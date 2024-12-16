import express from 'express';
import billController from '../Controllers/BillController';
import { authenticateToken } from '../Middlewares/Auth';

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.get('/', authenticateToken,billController.getAllWithFilterAndPagination);
router.get("/:id",authenticateToken,billController.get)
router.post("/",authenticateToken,billController.create)
router.delete("/:id",billController.remove)
router.put('/:id',authenticateToken,billController.update)

export default router;
