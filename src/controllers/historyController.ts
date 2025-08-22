import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const getHistoryByBoardId = async (req: Request, res: Response) => {
  const { boardId } = req.params;

  const history = await prisma.history.findMany({
    where: { boardId },
    orderBy: { createdAt: 'desc' },
  });

  res.json(history);
};

export const getHistoryByListId = async (req: Request, res: Response) => {
  const { listId } = req.params;

  const history = await prisma.history.findMany({
    where: { entityId: listId },
    orderBy: { createdAt: 'desc' },
  });

  res.json(history);
};
