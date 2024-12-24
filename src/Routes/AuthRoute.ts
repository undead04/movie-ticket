import express from 'express';
import AuthController from '../Controllers/AuthController';
import ValidateErrorMiddleware from '../Middlewares/ValidateErrorMiddlware';
import { LoginModel, UserModel } from '../Model/UserModel';

const router = express.Router();
const authController=new AuthController()
const validateLogin = new ValidateErrorMiddleware(LoginModel)
const validateRegister = new ValidateErrorMiddleware(UserModel)
// Lấy tất cả genres với filter và phân trang
router.post('/login'
    ,validateLogin.ValidateError
    ,authController.login);
router.post("/register"
    ,validateRegister.ValidateError
    ,authController.register)
router.get("/logout",authController.logout)


export default router;
