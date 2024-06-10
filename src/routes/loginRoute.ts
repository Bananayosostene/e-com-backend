import Router from 'express'

import LoginController from '../controllers/LoginController'
import loginSchema from '../validations/userLogin'
import validateRequest from '../utils/validateRequest'
import passport from '../config/passport'

const router = Router()
router.post(
  '/login',
  validateRequest(loginSchema, 'body'),
  LoginController.login,
)

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
)

router.get('/google/callback', LoginController.loginWithGoogle)
export default router
