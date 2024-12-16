import express from 'express';
import movieController from '../Controllers/MoiveController';

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.get('/', movieController.getAllWithFilterAndPagination);
router.get("/:id",movieController.get)
router.post("/",movieController.create)
router.post("/createArray",movieController.createArray)
router.put("/:id",movieController.update)
router.delete("/:id",movieController.remove)
router.delete('/',movieController.removeArray)
export default router;
