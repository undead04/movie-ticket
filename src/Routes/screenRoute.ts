import express from 'express';
import screenController from '../Controllers/ScreenController';

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.get('/', screenController.getAllWithFilterAndPagination);
router.get("/:id",screenController.get)
router.post("/",screenController.create)
router.post("/createArray",screenController.createArray)
router.put("/:id",screenController.update)
router.delete("/:id",screenController.remove)
router.delete("/",screenController.removeArray)

export default router;
