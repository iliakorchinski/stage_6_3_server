import { Router } from 'express';
import {
  createList,
  getListsByBoard,
  updateList,
  reorderLists,
  deleteList,
} from '../controllers/listsController';

const router = Router();

router.post('/lists/create', createList);
router.post('/lists', getListsByBoard);
router.patch('/lists/:listId', updateList);
router.post('/lists/reorder', reorderLists);
router.delete('/lists/:listId', deleteList);

export default router;
