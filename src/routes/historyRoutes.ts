import { Router } from 'express';
import { getHistoryByBoardId } from '../controllers/historyController';

const router = Router();

router.get('/history/:id', getHistoryByBoardId);

export default router;
