import express from 'express'
import validateRequest from '../utils/validateRequest'
import isAuthenticated, {
  checkPermission,
} from '../middlewares/authenticationMiddleware'
import { UserRole } from '../database/models/userModel'
import orderSchema from '../validations/orderValidation'
import checkoutController from '../controllers/checkoutController'
import checkCartMiddleware from '../middlewares/checkCartMiddleware'
const router = express.Router()

router.post(
  '/',
  isAuthenticated,
  checkPermission(UserRole.BUYER),
  checkCartMiddleware,
  validateRequest(orderSchema, 'body'),
  checkoutController.checkout,
)
export default router
