import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const getHistoryByBoardId = async (req: Request, res: Response) => {
  const { id } = req.params;

  const history = await prisma.history.findMany({
    where: { boardId: id },
    orderBy: { createdAt: 'desc' },
  });

  res.json(history);
};
