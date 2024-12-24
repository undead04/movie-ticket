import express from 'express';
import { authenticateToken } from '../Middlewares/Auth';
import TheaterController from '../Controllers/TheaterController';
import ValidateErrorMiddleware from '../Middlewares/ValidateErrorMiddlware';
import { TheaterModel } from '../Model/TheaterModel';
import ValidatorNotFoundMiddlewares from '../Middlewares/ValidatorNotFoundMiddlewares';
import { Theater } from '../Data/Theater';
import AppRole from '../Model/GroupRoleModel';

const router = express.Router();
const theaterController = new TheaterController()
const validateError=new ValidateErrorMiddleware<TheaterModel>(TheaterModel)
const validatorNotFound=new ValidatorNotFoundMiddlewares(Theater,'theater',"Không tìm thấy rạp chiếu phim này")
// Lấy tất cả  với filter và phân trang
router.get('/',
     theaterController.getAllWithFilterAndPagination);

// Tạo
router.post("/",
    authenticateToken([AppRole.Admin]),
    validateError.ValidateError,
    theaterController.create)

// Tạo nhiều
router.post("/createArray",
    authenticateToken([AppRole.Admin]),
    validateError.ValidateError,
    theaterController.createArray)

// Xóa
router.delete("/",authenticateToken([AppRole.Admin]),
    validatorNotFound.IsNotFoundArray,
    theaterController.removeArray)

// Check
router.post('/checkWarningDelete'
    ,authenticateToken([AppRole.Admin])
    ,validatorNotFound.IsNotFoundArray
    ,theaterController.waningDelete)

// Lấy 1
router.get("/:id",
    validatorNotFound.IsNotFound,
    theaterController.get)

router.put("/:id",authenticateToken([AppRole.Admin]),
    validatorNotFound.IsNotFound,
    validateError.ValidateError,
    theaterController.update)
    
router.delete("/:id",authenticateToken([AppRole.Admin]),
    validatorNotFound.IsNotFound,
    theaterController.remove)
export default router;
