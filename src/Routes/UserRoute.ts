import express from 'express';
import { authenticateToken } from '../Middlewares/Auth';
import UserController from '../Controllers/UserController';
import ValidatorNotFoundMiddlewares from '../Middlewares/ValidatorNotFoundMiddlewares';
import { User } from '../Data/User';
import ValidateErrorMiddleware from '../Middlewares/ValidateErrorMiddlware';
import { PasswordModel, UserUpdateModel } from '../Model/UserModel';

const router = express.Router();
const userController = new UserController()
const validateNotFound = new ValidatorNotFoundMiddlewares(User,'user','Không tìm thấy người dùng này')
const validateUser = new ValidateErrorMiddleware(UserUpdateModel)
const validatePassword = new ValidateErrorMiddleware(PasswordModel)
router.get('/', userController.getAllWithFilterAndPagination);
router.put("/updatePassword",authenticateToken(),validatePassword.ValidateError,userController.updatePassword)
router.get("/getMe",authenticateToken(),userController.userGetMy)
router.get("/:id",authenticateToken(),validateNotFound.IsNotFound,userController.get)
router.put("/:id",authenticateToken(),validateNotFound.IsNotFound,validateUser.ValidateError,userController.update)
export default router;
