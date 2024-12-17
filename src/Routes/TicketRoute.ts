import express from 'express';
import billController from '../Controllers/BillController';
import { authenticateToken } from '../Middlewares/Auth';
import ticketController from '../Controllers/TicketController';

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.get('/', authenticateToken,ticketController.get);

export default router;
