import express from 'express'
import validateRequest from '../utils/validateRequest'
import cartSchema from '../validations/cartValidation'
import isAuthenticated, {
  checkPermission,
} from '../middlewares/authenticationMiddleware'
import cartController from '../controllers/cartController'
import { UserRole } from '../database/models/userModel'

const router = express.Router()

router.post(
  '/products/:productId',
  isAuthenticated,
  checkPermission(UserRole.BUYER),
  validateRequest(cartSchema, 'body'),
  cartController.addToCart,
)
router.get(
    '/',
    isAuthenticated,
    checkPermission(UserRole.BUYER),
    cartController.viewCart,
  )
  

router.delete(
  '/clear',
  isAuthenticated,
  checkPermission(UserRole.BUYER),
  cartController.clearCart,
)

router.patch(
  '/products/:productId',
  isAuthenticated,
  checkPermission(UserRole.BUYER),
  cartController.updateCart,
)

router.delete(
  '/products/:productId',
  isAuthenticated,
  checkPermission(UserRole.BUYER),
  cartController.deleteProductFromCart,
)
export default router
