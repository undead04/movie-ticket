import express from 'express';
import AuthController from '../Controllers/AuthController';

const router = express.Router();
const authController=new AuthController()
// Lấy tất cả genres với filter và phân trang
router.post('/login', authController.login);
router.post("/register",authController.register)
router.get("/logout",authController.logout)


export default router;
