import express from 'express'
import isAuthenticated, {
  checkPermission,
} from '../middlewares/authenticationMiddleware'
import { UserRole } from '../database/models/userModel'
import getSellerStats from '../controllers/sellerStatsController'

const router = express.Router()

router.get(
  '/seller-stats',
  isAuthenticated,
  checkPermission(UserRole.SELLER),
  getSellerStats.getSellerStats,
)

export default router
