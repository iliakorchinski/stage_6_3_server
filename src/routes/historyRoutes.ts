import { Router } from 'express';
import {
  getHistoryByBoardId,
  getHistoryByListId,
} from '../controllers/historyController';

const router = Router();

router.get('/history/boards/:boardId', getHistoryByBoardId);
router.get('/history/lists/:listId', getHistoryByListId);

export default router;
