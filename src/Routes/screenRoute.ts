import express from 'express';
import { authenticateToken } from '../Middlewares/Auth';
import ValidateErrorMiddleware from '../Middlewares/ValidateErrorMiddlware';
import ValidatorNotFoundMiddlewares from '../Middlewares/ValidatorNotFoundMiddlewares';
import ScreenController from '../Controllers/ScreenController';
import { ScreenModel } from '../Model/ScreenModel';

const router = express.Router();
const screenController = new ScreenController()
const validateError=new ValidateErrorMiddleware<ScreenModel>(ScreenModel)
const validatorNotFound=new ValidatorNotFoundMiddlewares(Screen,'screen',"Không tìm thấy phòng chiếu phim này")
// Lấy tất cả genres với filter và phân trang
router.get('/',
     screenController.getAllWithFilterAndPagination);
router.get("/:id",
    validatorNotFound.IsNotFound,
    screenController.get)
router.post("/",
    authenticateToken,
    validateError.ValidateError,
    screenController.create)
router.post("/createArray",
    authenticateToken,
    validateError.ValidateError,
    screenController.createArray)
router.put("/:id",authenticateToken,
    validatorNotFound.IsNotFound,
    validateError.ValidateError,
    screenController.update)
router.delete("/:id",authenticateToken,
    validatorNotFound.IsNotFound,
    screenController.remove)
router.delete("/",authenticateToken,
    validatorNotFound.IsNotFoundArray,
    screenController.removeArray)
export default router;
