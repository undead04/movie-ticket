import express from 'express';
import { authenticateToken } from '../Middlewares/Auth';

import TicketController from '../Controllers/TicketController';

const router = express.Router();
const ticketController = new TicketController()
// Lấy tất cả genres với filter và phân trang
router.get('/:billId', authenticateToken(),ticketController.getTicket);

export default router;
