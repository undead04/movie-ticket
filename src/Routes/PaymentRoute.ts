import express from 'express';
import { authenticateToken } from '../Middlewares/Auth';
import PaymentController from '../Controllers/PaymentController';
import ValidateErrorMiddleware from '../Middlewares/ValidateErrorMiddlware';

const router = express.Router();

const paymentController = new PaymentController()
// Lấy tất cả genres với filter và phân trang
router.post('/', authenticateToken(),paymentController.createPayment);
router.post("/transaction",authenticateToken(),paymentController.transactionStatus)
router.post('/callBack',authenticateToken(),paymentController.callBackPayment)

export default router;
