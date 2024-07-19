import { Router } from 'express'
import notificationController from '../controllers/NotificationController'
import isAuthenticated from '../middlewares/authenticationMiddleware'
import { authenticate } from 'passport'

const router = Router()
router.get('/', isAuthenticated, notificationController.getNotifications)
router.put(
    '/:notificationId/one',
    isAuthenticated,
    notificationController.changeNotificationStatus,
  )
  router.put(
    '/all',
    isAuthenticated,
    notificationController.changeAllNotificationStatus,
  )
export default router
