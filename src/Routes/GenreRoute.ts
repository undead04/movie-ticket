import express from 'express';
import genreController from '../Controllers/GenreController';  // Đảm bảo genreController được import đúng cách.

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.get('/', genreController.getAllWithFilterAndPagination);
router.get("/:id",genreController.get)
router.post("/",genreController.create)
router.post("/createArray",genreController.createArray)
router.put("/:id",genreController.update)
router.delete("/:id",genreController.remove)
router.delete("/",genreController.removeArray)

export default router;
