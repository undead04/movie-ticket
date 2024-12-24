import express from 'express';
import GroupRoleController from '../Controllers/GroupRoleController';

const router = express.Router();

const groupRoleController = new GroupRoleController()
router.post('/createArray',groupRoleController.createArray)
export default router;
