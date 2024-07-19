import express from 'express'
import isAuthenticated, {
  checkPermission,
} from '../middlewares/authenticationMiddleware'
import {
  getAllorders,
  getorder,
  updateproductorder,
  getSingleUserOrder,
  getUserOrders,
} from '../controllers/orderController'
import { UserRole } from '../database/models/userModel'
import { orderStatusSchema } from '../validations/orderValidation'
import validateRequest from '../utils/validateRequest'

const router = express.Router()

router.patch(
  '/:orderId/status',
  isAuthenticated,
  checkPermission(UserRole.ADMIN),
  validateRequest(orderStatusSchema, 'body'),
  updateproductorder,
)
router.get('/', isAuthenticated, checkPermission(UserRole.BUYER), getUserOrders)
router.get(
  '/:orderId',
  isAuthenticated,
  checkPermission(UserRole.BUYER),
  getSingleUserOrder,
)
router.get(
  '/all',
  isAuthenticated,
  checkPermission(UserRole.ADMIN),
  getAllorders,
)

export default router
