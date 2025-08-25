import { Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';
import { historyCreate } from '../utils/historyCreate';

export const prisma = new PrismaClient();
export const createList = async (req: Request, res: Response) => {
  try {
    const { title, boardId } = req.body;

    const last = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
    });
    const position = last ? last.position + 1000 : 1000;

    const list = await prisma.list.create({
      data: { title, boardId, position },
    });
    historyCreate('List', list.id, 'CREATE', boardId, undefined, {
      title: list.title,
    });

    res.status(201).json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create list' });
  }
};
export const getListsByBoard = async (req: Request, res: Response) => {
  try {
    const { boardIds } = req.body as { boardIds: string[] };

    if (!boardIds || boardIds.length === 0) {
      return res.status(400).json({ error: 'boardIds are required' });
    }

    const boards = await prisma.board.findMany({
      where: { id: { in: boardIds } },
      include: { lists: true },
    });

    const result = boards.map((board) => ({
      boardId: board.id,
      lists: board.lists.sort((a, b) => a.position - b.position),
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
};

export const updateList = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const { title, position } = req.body;

    const prevList = await prisma.list.findUnique({ where: { id: listId } });

    const updated = await prisma.list.update({
      where: { id: listId },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(position !== undefined ? { position } : {}),
      },
    });
    if (prevList?.title !== updated.title) {
      historyCreate(
        'List',
        listId,
        'UPDATE',
        updated.boardId,
        { title: prevList?.title },
        { title: updated.title }
      );
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update list' });
  }
};

export const deleteList = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;

    const prevList = await prisma.list.findUnique({ where: { id: listId } });

    const deleted = await prisma.list.delete({
      where: { id: listId },
    });
    historyCreate('List', listId, 'DELETE', deleted.boardId, {
      title: prevList?.title,
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

    const oldLists = await prisma.list.findMany({
      where: { id: { in: listOrder.map((item) => item.id) } },
    });

    const boards = await prisma.board.findMany({
      where: { id: { in: oldLists.map((item) => item.boardId) } },
      include: { lists: true },
    });

    const updates = listOrder.map((item) =>
      prisma.list.update({
        where: { id: item.id },
        data: { position: item.position, boardId: item.boardId },
      })
    );

    const updatedLists = await prisma.$transaction(updates);

    const historyRecords = updatedLists
      .map((newItem) => {
        const oldItem = oldLists.find((o) => o.id === newItem.id);
        if (oldItem?.position === newItem.position) {
          return null;
        }
        return prisma.history.create({
          data: {
            entityType: 'List',
            entityId: newItem.id,
            boardId: newItem.boardId,
            operation: 'REORDER',
            oldValue: oldItem
              ? {
                  position: oldItem.position,
                  title: boards.find((b) => b.id === oldItem.boardId)?.title,
                }
              : undefined,
            newValue: { position: newItem.position, title: newItem.title },
          },
        });
      })
      .filter((item) => item !== null);
    await prisma.$transaction(historyRecords);

    res.status(200).json(updatedLists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reorder lists' });
  }
};
