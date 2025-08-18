import { Router } from 'express';
import {
  createList,
  getListsByBoard,
  updateList,
  reorderLists,
  deleteList,
} from '../controllers/listsController';

const router = Router();

router.post('/boards/:boardId/lists', createList);
router.get('/boards/:boardId/lists', getListsByBoard);
router.patch('/lists/:listId', updateList);
router.post('/boards/:boardId/lists/reorder', reorderLists);
router.delete('/lists/:listId', deleteList);

export default router;
