import express from 'express';
import theaterController from '../Controllers/TheaterController';
import { authenticateToken } from '../Middlewares/Auth';

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.get('/', theaterController.getAllWithFilterAndPagination);
router.get("/:id",authenticateToken,theaterController.get)
router.post("/",authenticateToken,theaterController.create)
router.post("/createArray",authenticateToken,theaterController.createArray)
router.put("/:id",authenticateToken,theaterController.update)
router.delete("/:id",authenticateToken,theaterController.remove)
router.delete("/",authenticateToken,theaterController.removeArray)

export default router;
