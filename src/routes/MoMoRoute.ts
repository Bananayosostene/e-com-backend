import express from 'express'
import validateRequest from '../utils/validateRequest'
import isAuthenticated, {
  checkPermission,
  excludePermission,
} from '../middlewares/authenticationMiddleware'
import { UserRole } from '../database/models/userModel'
import { momoToken, renewMomoToken } from '../middlewares/momoAuth'
import MoMoController from '../controllers/momoPayment'


const router = express.Router()

router.post(
  '/momo/token',
  MoMoController.getMoMoToken,
)
router.post(
  '/momo/pay/:orderId',
  renewMomoToken,
  MoMoController.requestToPay,
)
router.post(
  '/momo/check/:orderId',
  renewMomoToken,
  MoMoController.checkPayed,
)


export default router
