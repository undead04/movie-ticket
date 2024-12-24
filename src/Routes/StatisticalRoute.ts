import express from 'express';
import StatisticalController from '../Controllers/StatisticalController';
import { authenticateToken } from '../Middlewares/Auth';
import AppRole from '../Model/GroupRoleModel';
const router = express.Router();
const statisticalController = new StatisticalController()
router.get('/',authenticateToken([AppRole.Admin]),statisticalController.getFillter)
export default router