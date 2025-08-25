import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { historyCreate } from '../utils/historyCreate';

export const prisma = new PrismaClient();

export const getBoards = async (req: Request, res: Response) => {
  try {
    const include = req.query.include as string | undefined;
    const boards = await prisma.board.findMany();

    if (include === 'history') {
      const boardIds = boards.map((b) => b.id);

      const histories = await prisma.history.findMany({
        where: { boardId: { in: boardIds } },
        orderBy: { createdAt: 'desc' },
      });

      const historyMap = histories.reduce<Record<string, typeof histories>>(
        (acc, history) => {
          if (!history.boardId) return acc;
          if (!acc[history.boardId]) acc[history.boardId] = [];
          acc[history.boardId].push(history);
          return acc;
        },
        {}
      );

      const boardsWithHistory = boards.map((board) => ({
        ...board,
        history: historyMap[board.id] || [],
      }));
      return res.json(boardsWithHistory);
    }

    res.json(boards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
};

export const getBoardById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const board = await prisma.board.findUnique({ where: { id } });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json(board);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
};

export const createBoard = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const board = await prisma.board.create({ data: { title } });
    historyCreate('Board', board.id, 'CREATE', board.id, undefined, {
      title: board.title,
    });

    res.status(201).json(board);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create board' });
  }
};

export const updateBoard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const prevBoard = await prisma.board.findUnique({ where: { id } });

    const board = await prisma.board.update({
      where: { id },
      data: { title },
    });
    historyCreate(
      'Board',
      id,
      'UPDATE',
      id,
      { title: prevBoard?.title },
      { title: board.title }
    );

    res.json(board);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update board' });
  }
};

export const deleteBoard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.history.deleteMany({ where: { boardId: id } });
    await prisma.list.deleteMany({ where: { boardId: id } });

    await prisma.board.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
};
