import express from 'express';
import screenController from '../Controllers/ScreenController';
import { authenticateToken } from '../Middlewares/Auth';

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.get('/', screenController.getAllWithFilterAndPagination);
router.get("/:id",screenController.get)
router.post("/",authenticateToken,screenController.create)
router.post("/createArray",authenticateToken,screenController.createArray)
router.put("/:id",authenticateToken,screenController.update)
router.delete("/:id",authenticateToken,screenController.remove)
router.delete("/",authenticateToken,screenController.removeArray)

export default router;
