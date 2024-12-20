import express from 'express';
import { authenticateToken } from '../Middlewares/Auth';
import TheaterController from '../Controllers/TheaterController';
import ValidateErrorMiddleware from '../Middlewares/ValidateErrorMiddlware';
import { TheaterModel } from '../Model/TheaterModel';
import ValidatorNotFoundMiddlewares from '../Middlewares/ValidatorNotFoundMiddlewares';
import { Theater } from '../Data/Theater';

const router = express.Router();
const theaterController = new TheaterController()
const validateError=new ValidateErrorMiddleware<TheaterModel>(TheaterModel)
const validatorNotFound=new ValidatorNotFoundMiddlewares(Theater,'theater',"Không tìm thấy rạp chiếu phim này")
// Lấy tất cả genres với filter và phân trang
router.get('/',
     theaterController.getAllWithFilterAndPagination);
router.get("/:id",
    validatorNotFound.IsNotFound,
    theaterController.get)
router.post("/",
    authenticateToken,
    validateError.ValidateError,
    theaterController.create)
router.post("/createArray",
    authenticateToken,
    validateError.ValidateError,
    theaterController.createArray)
router.put("/:id",authenticateToken,
    validatorNotFound.IsNotFound,
    validateError.ValidateError,
    theaterController.update)
router.delete("/:id",authenticateToken,
    validatorNotFound.IsNotFound,
    theaterController.remove)
router.delete("/",authenticateToken,
    validatorNotFound.IsNotFoundArray,
    theaterController.removeArray)
export default router;
