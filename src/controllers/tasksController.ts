import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, listId } = req.body;

    const maxTask = await prisma.task.findFirst({
      where: { listId },
      orderBy: { position: 'desc' },
    });

    const position = maxTask ? maxTask.position + 1 : 0;

    const task = await prisma.task.create({
      data: { title, description, position, listId },
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { title, description },
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

export const moveTask = async (req: Request, res: Response) => {
  try {
    const { listId, position } = req.body;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { listId, position },
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to move task' });
  }
};

export const getTasksByBoard = async (req: Request, res: Response) => {
  try {
    const { boardId } = req.body;

    const lists = await prisma.list.findMany({
      where: { boardId },
      select: { id: true },
      orderBy: { position: 'asc' },
    });

    const listIds = lists.map((l) => l.id);

    const tasks = await prisma.task.findMany({
      where: { listId: { in: listIds } },
      orderBy: { position: 'asc' },
    });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks for board' });
  }
};

export const reorderTasks = async (req: Request, res: Response) => {
  try {
    const { taskOrder } = req.body;
    if (!Array.isArray(taskOrder))
      return res.status(400).json({ error: 'taskOrder must be array' });

    const updates = taskOrder.map((item, index) =>
      prisma.task.update({
        where: { id: item.id },
        data: { position: index, listId: item.listId },
      })
    );
    const updatedTasks = await prisma.$transaction(updates);
    const sorted = updatedTasks.sort((a, b) => a.position - b.position);
    res.status(200).json(sorted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
};
