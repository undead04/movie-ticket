import express from 'express';
import { paymentController } from '../Controllers/PaymentController';

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.post('/', paymentController.createPayment);
router.post("/transaction",paymentController.transactionStatus)
router.post('/callBack',paymentController.callBackPayment)

export default router;
