import express from 'express'
import isAuthenticated, {
  checkPermission,
} from '../middlewares/authenticationMiddleware'
import { UserRole } from '../database/models/userModel'
import wishlistController from '../controllers/wishlistController'

const router = express.Router()

router.post(
  '/products/:productId',
  isAuthenticated,
  checkPermission(UserRole.BUYER),
  wishlistController.addToWishlist,
)
router.get(
  '/products',
  isAuthenticated,
  checkPermission(UserRole.BUYER),
  wishlistController.getWishlist,
)
router.delete(
  '/products/:productId',
  isAuthenticated,
  checkPermission(UserRole.BUYER),
  wishlistController.deleteFromWishlist,
)

export default router
