import express from 'express';
import genreController from '../Controllers/GenreController';  // Đảm bảo genreController được import đúng cách.
import userController from '../Controllers/UserController';
import { authenticateToken } from '../Middlewares/Auth';

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.get('/', userController.getAllWithFilterAndPagination);
router.get("/:id",userController.get)
router.put("/:id",userController.update)
router.put("/updatePassword",authenticateToken,userController.updatePassword)
router.delete("/:id",userController.remove)
router.delete("/",userController.removeArray)

export default router;
