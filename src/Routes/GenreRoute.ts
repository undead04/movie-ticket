import express from 'express';
import genreController from '../Controllers/GenreController';  // Đảm bảo genreController được import đúng cách.
import authController from '../Controllers/AuthController';
import { authenticateToken } from '../Middlewares/Auth';

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.get('/', genreController.getAllWithFilterAndPagination);
router.get("/:id",genreController.get)
router.post("/",authenticateToken,genreController.create)
router.post("/createArray",authenticateToken,genreController.createArray)
router.put("/:id",authenticateToken,genreController.update)
router.delete("/:id",authenticateToken,genreController.remove)
router.delete("/",authenticateToken,genreController.removeArray)

export default router;
