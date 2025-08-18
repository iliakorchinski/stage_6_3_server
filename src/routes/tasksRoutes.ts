import { Router } from 'express';
import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  getTasksByList,
  getTasksByBoard,
  reorderTasks,
} from '../controllers/tasksController';

const router = Router();

router.post('/lists/:listId/tasks', createTask);
router.patch('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);
router.patch('/tasks/:id/move', moveTask);
router.get('/lists/:listId/tasks', getTasksByList);
router.get('/boards/:boardId/tasks', getTasksByBoard);
router.post('/tasks/reorder', reorderTasks);

export default router;
