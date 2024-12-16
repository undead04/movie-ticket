import express from 'express';
import theaterController from '../Controllers/TheaterController';

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.get('/', theaterController.getAllWithFilterAndPagination);
router.get("/:id",theaterController.get)
router.post("/",theaterController.create)
router.post("/createArray",theaterController.createArray)
router.put("/:id",theaterController.update)
router.delete("/:id",theaterController.remove)
router.delete("/",theaterController.removeArray)

export default router;
