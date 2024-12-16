import express from 'express';
import authController from '../Controllers/AuthController';

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.post('/login', authController.login);
router.post("/register",authController.register)
router.get("/logout",authController.logout)


export default router;
