import express from 'express'
import isAuthenticated, {
  checkPermission
} from '../middlewares/authenticationMiddleware'
import { getorder, updateproductorder } from '../controllers/orderController';
import { UserRole } from '../database/models/userModel';
import { orderStatusSchema } from '../validations/orderValidation';
import validateRequest from '../utils/validateRequest';

const router = express.Router()

router.patch(
  '/:orderId/status',
  isAuthenticated,
  checkPermission(UserRole.ADMIN),
  validateRequest(orderStatusSchema, 'body'),
  updateproductorder
);
router.get('/', isAuthenticated,checkPermission(UserRole.BUYER), getorder);

export default router
