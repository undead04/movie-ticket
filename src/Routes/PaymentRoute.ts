import express from 'express';
import { paymentController } from '../Controllers/PaymentController';
import { authenticateToken } from '../Middlewares/Auth';

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.post('/', authenticateToken,paymentController.createPayment);
router.post("/transaction",authenticateToken,paymentController.transactionStatus)
router.post('/callBack',authenticateToken,paymentController.callBackPayment)

export default router;
