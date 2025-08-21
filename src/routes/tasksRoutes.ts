import { Router } from 'express';
import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  getTasksByBoard,
  reorderTasks,
} from '../controllers/tasksController';

const router = Router();

router.post('/tasks/create', createTask);
router.patch('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);
router.patch('/tasks/:id/move', moveTask);
router.post('/tasks', getTasksByBoard);
router.post('/tasks/reorder', reorderTasks);

export default router;
