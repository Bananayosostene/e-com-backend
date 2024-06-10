import { Request, Response, NextFunction } from 'express'
import { verificationsEmailTemplate } from '../utils/emailTemplates'
import User, { UserRole, UserAttributes } from '../database/models/userModel'
import loginSchema from '../validations/userLogin'
import { generateToken } from '../utils/jwt'
import { createUserProfile } from '../services/userServices'
import Token from '../database/models/tokenModel'
import { comparePassword,hashPassword } from '../utils/passwords'
import userEvents from '../utils/passwordUpdateEvent'
import otpEmailTemplate from '../utils/otpEmailTemplate'
import redisClient from '../utils/redisConfiguration'
import sendMail from '../utils/sendEmail'
import passport from '../config/passport'
import { getTokenByTokenValue } from '../services/tokenServices'

/**
 * Controller class for managing user-related operations.
 */
export default class LoginController {
  /**
   * Handles user login.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body

      const existingUser = await User.findOne({ where: { email } })

      if (!existingUser) {
        return res.status(404).send({ message: 'User not found' })
      }
      if (existingUser.status === 'inactive') {
        return res.status(401).json({ message: 'User is disabled' })
      }

      const isPasswordValid = await comparePassword(
        password,
        existingUser.password,
      )
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' })
      }

      if (existingUser.isExpired === true) {
        return res
          .status(401)
          .json({ message: 'Your password has expired please update it' })
      }

      createUserProfile(existingUser.id)

      if (existingUser.dataValues.verified === false) {
        // Handle pending verification
        const pendingVerification = await Token.findOne({
          where: { userId: existingUser.id },
        })

        // Generate and send new verification email
        const newVerificationToken = generateToken({
          id: existingUser.id,
          email: existingUser.email,
        })
        const baseUrl = `${process.env.NODEMAILER_BASE_URL}users/verify/${newVerificationToken}`
        const html = verificationsEmailTemplate(existingUser.username, baseUrl)

        if (!pendingVerification) {
          await Token.create({
            userId: existingUser.id,
            token: newVerificationToken,
          })
        } else {
          await pendingVerification.update({ token: newVerificationToken })
        }

        try {
          await sendMail(email, 'verify Your Account', html)
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error' })
        }

        return res
          .status(200)
          .send({ message: 'A verification email has been sent' })
      }

      const tokenPayload = {
        id: existingUser.id,
        userRole: existingUser.userRole,
        username: existingUser.username,
        email: existingUser.email,
        otp: '',
      }

      if (existingUser.userRole === UserRole.SELLER) {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`
        const html = otpEmailTemplate(existingUser.username, otp)
        const otptoken = generateToken({
          id: existingUser.id,
          email: existingUser.email,
          username: existingUser.username,
          otp,
        })
        await redisClient
          .setEx(existingUser.email, 300, `${otp}=${otptoken}`)
          .then(async () => {
            await sendMail(email, 'OTP VERIFICATION CODE', html)
          })

        tokenPayload.otp = otp
        const sellerTokenMessage =
          'Email sent to your email. Please check your inbox messages and enter the OTP for verification'
        return res.status(200).json({ message: sellerTokenMessage })
      }

      // Generate and return JWT token for authenticated user
      const authToken = generateToken(tokenPayload)
      redisClient.setEx(`user:${existingUser.id}`, 86400, authToken)
      return res.status(200).send({ message: 'Login successful', authToken })
    } catch (error) {
      return res
        .status(500)
        .send({ message: 'Internal server error', error: error.message })
    }
  }

  /**
   * Login method via google
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   * @returns {void}
   */
  static loginWithGoogle(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    passport.authenticate(
      'google',
      (err: unknown, user: UserAttributes | null) => {
        if (err) {
          return res.status(500).json({ error: 'Internal Server Error' })
        }
        if (!user) {
          return res.status(401).json({ error: 'Authentication failed' })
        }
        const plainUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          userRole: user.userRole,
          verified: user.verified,
        }
        const token = generateToken(plainUser)
        res.status(200).json({ token })
        // res.redirect(`${FRONTEND_URL}/google?token=${token}`)
      },
    )(req, res, next)
  }

  /**
   * Handles user logout
   * @param {AuthenticatedRequest} req - Express request object with user property
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async logOut(req: Request, res: Response): Promise<Response> {
    const userId = req.user.id
    const tokenKey = `user:${userId}`
    const tokenExists = await redisClient.exists(tokenKey)

    if (tokenExists) {
      await redisClient.del(tokenKey)
      res.removeHeader('authorization')
      return res.status(200).json({ message: 'Logout successfully' })
    }
    return res.status(401).json({ message: 'Already logged out' })
  }
}
