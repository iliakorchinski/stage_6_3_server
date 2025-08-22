import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

type Value = {
  [key: string]: string | undefined;
};

export const historyCreate = async (
  entityType: string,
  entityId: string,
  operation: string,
  boardId?: string,
  oldValue?: Value,
  newValue?: Value
) => {
  await prisma.history.create({
    data: {
      entityType,
      entityId,
      boardId,
      operation,
      oldValue,
      newValue,
    },
  });
};
