import express from 'express';
import { authenticateToken } from '../Middlewares/Auth';
import GenreController from './../Controllers/GenreController';
import { Genre } from '../Data/Genre';
import ValidatorNotFoundMiddlewares from '../Middlewares/ValidatorNotFoundMiddlewares';
import ValidateErrorMiddleware from '../Middlewares/ValidateErrorMiddlware';
import { GenreModel } from '../Model/GenreMode';

const router = express.Router();
const genreController = new GenreController()
const validateError=new ValidateErrorMiddleware<GenreModel>(GenreModel)
const validatorNotFound=new ValidatorNotFoundMiddlewares(Genre,'genre',"Không tìm thấy thể loại phim này")
router.get('/',
     genreController.getAllWithFilterAndPagination);
router.get("/:id",
    validatorNotFound.IsNotFound,
    genreController.get)
router.post("/",
    authenticateToken,
    validateError.ValidateError,
    genreController.create)
router.post("/createArray",
    authenticateToken,
    validateError.ValidateError,
    genreController.createArray)
router.put("/:id",authenticateToken,
    validatorNotFound.IsNotFound,
    validateError.ValidateError,
    genreController.update)
router.delete("/:id",authenticateToken,
    validatorNotFound.IsNotFound,
    genreController.remove)
router.delete("/",authenticateToken,
    validatorNotFound.IsNotFoundArray,
    genreController.removeArray)

export default router;
