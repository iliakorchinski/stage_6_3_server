import { Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
export const createList = async (req: Request, res: Response) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;

    const last = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
    });
    const position = last ? last.position + 1000 : 1000;

    const list = await prisma.list.create({
      data: { title, boardId, position },
    });

    res.status(201).json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create list' });
  }
};

export const getListsByBoard = async (req: Request, res: Response) => {
  try {
    const { boardId } = req.params;

    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: { lists: true },
    });

    res.json(board?.lists.sort((a, b) => a.position - b.position));
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
};

// Обновить лист
export const updateList = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const { title, position } = req.body;

    const updated = await prisma.list.update({
      where: { id: listId },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(position !== undefined ? { position } : {}),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update list' });
  }
};

// Удалить лист
export const deleteList = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;

    await prisma.list.delete({
      where: { id: listId },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
};

export const reorderLists = async (req: Request, res: Response) => {
  try {
    const { listOrder } = req.body;
    if (!Array.isArray(listOrder))
      return res.status(400).json({ error: 'listOrder must be array' });

    const updates = listOrder.map((item) =>
      prisma.list.update({
        where: { id: item.id },
        data: { position: item.position, boardId: item.boardId },
      })
    );
    const updatedLists = await prisma.$transaction(updates);
    res.status(200).json(updatedLists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reorder lists' });
  }
};
