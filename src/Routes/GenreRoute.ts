import express from 'express';
import { authenticateToken } from '../Middlewares/Auth';
import GenreController from './../Controllers/GenreController';
import { Genre } from '../Data/Genre';
import ValidatorNotFoundMiddlewares from '../Middlewares/ValidatorNotFoundMiddlewares';
import ValidateErrorMiddleware from '../Middlewares/ValidateErrorMiddlware';
import { GenreModel } from '../Model/GenreMode';
import AppRole from '../Model/GroupRoleModel';

const router = express.Router();
const genreController = new GenreController()
const validateError=new ValidateErrorMiddleware<GenreModel>(GenreModel)
const validatorNotFound=new ValidatorNotFoundMiddlewares(Genre,'genre',"Không tìm thấy thể loại phim này")

// Lấy danh sách thể loại
router.get('',
     genreController.getAllWithFilterAndPagination);

// Tạo thể loại
router.post("",
    authenticateToken([AppRole.Admin]),
    validateError.ValidateError,
    genreController.create)

// Tạo nhiều thể loại cùng một lúc
router.post("/createArray",
    authenticateToken([AppRole.Admin]),
    validateError.ValidateError,
    genreController.createArray)

// chech trước khi xóa
router.post('/checkWarningDelete'
    ,authenticateToken([AppRole.Admin])
    ,validatorNotFound.IsNotFoundArray
    ,genreController.waningDelete)
    
// Xóa thể loại
router.delete("",authenticateToken([AppRole.Admin]),
    validatorNotFound.IsNotFoundArray,
    genreController.removeArray)
// Cập nhập thể loại
router.put("/:id",authenticateToken([AppRole.Admin]),
        validatorNotFound.IsNotFound,
        validateError.ValidateError,
        genreController.update)
//Xóa thể loại
router.delete("/:id",authenticateToken([AppRole.Admin]),
        validatorNotFound.IsNotFound,
        genreController.remove)

// Lấy thể loại
router.get("/:id",
        validatorNotFound.IsNotFound,
        genreController.get)

export default router;
