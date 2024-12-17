import express from 'express';
import movieController from '../Controllers/MoiveController';
import { authenticateToken } from '../Middlewares/Auth';

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.get('/', movieController.getAllWithFilterAndPagination);
router.get("/:id",movieController.get)
router.post("/",authenticateToken,movieController.create)
router.post("/createArray",authenticateToken,movieController.createArray)
router.put("/:id",authenticateToken,movieController.update)
router.delete("/:id",authenticateToken,movieController.remove)
router.delete('/',authenticateToken,movieController.removeArray)
export default router;
