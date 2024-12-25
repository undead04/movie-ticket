import express from 'express';
import { authenticateToken } from '../Middlewares/Auth';
import ValidateErrorMiddleware from '../Middlewares/ValidateErrorMiddlware';
import ValidatorNotFoundMiddlewares from '../Middlewares/ValidatorNotFoundMiddlewares';
import ScreenController from '../Controllers/ScreenController';
import { ScreenArrayModel, ScreenModel } from '../Model/ScreenModel';
import { Screen } from "../Data/Screen";
import AppRole from '../Model/GroupRoleModel';
const router = express.Router();
const screenController = new ScreenController()
const validateError=new ValidateErrorMiddleware<ScreenModel>(ScreenModel)
const validateArrayModel = new ValidateErrorMiddleware(ScreenArrayModel)
const validatorNotFound=new ValidatorNotFoundMiddlewares(Screen,'screen',"Không tìm thấy phòng chiếu phim này")
// Lấy tất cả genres với filter và phân trang
router.get('/',
     screenController.getAllWithFilterAndPagination);
router.post("/",
    authenticateToken([AppRole.Admin]),
    validateError.ValidateError,
    screenController.create)
router.post("/createArray",
    authenticateToken([AppRole.Admin]),
    validateArrayModel.ValidateError,
    screenController.createArray)
router.post('/checkWarningDelete'
    ,authenticateToken([AppRole.Admin])
    ,validatorNotFound.IsNotFoundArray
    ,screenController.waningDelete)
router.delete("/",authenticateToken([AppRole.Admin]),
    validatorNotFound.IsNotFoundArray,
    screenController.removeArray)
router.put("/:id",authenticateToken([AppRole.Admin]),
    validatorNotFound.IsNotFound,
    validateError.ValidateError,
    screenController.update)
router.get("/:id",
    validatorNotFound.IsNotFound,
    screenController.get)
router.delete("/:id",authenticateToken([AppRole.Admin]),
    validatorNotFound.IsNotFound,
    screenController.remove)
export default router;
