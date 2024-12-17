import express from 'express';
import showtimeController from '../Controllers/ShowtimeController';
import { authenticateToken } from '../Middlewares/Auth';


const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.get('/', showtimeController.getAllWithFilterAndPagination);
router.get("/:id",showtimeController.get)
router.post("/",authenticateToken,showtimeController.create)
router.post('/createArray',authenticateToken,showtimeController.createArray)
router.put("/:id",authenticateToken,showtimeController.update)
router.delete("/:id",authenticateToken,showtimeController.remove)
router.delete("/",authenticateToken,showtimeController.removeArray)
export default router;
