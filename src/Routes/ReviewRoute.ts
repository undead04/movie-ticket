import express from 'express';
import reviewController from '../Controllers/ReviewController';
import { authenticateToken } from '../Middlewares/Auth';

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.get('/', reviewController.getAllWithFilterAndPagination);
router.get("/:id",reviewController.get)
router.post("/",authenticateToken,reviewController.create)
router.put("/:id",authenticateToken,reviewController.update)
router.delete("/:id",authenticateToken,reviewController.remove)
router.delete('/',reviewController.removeArray)
export default router;
