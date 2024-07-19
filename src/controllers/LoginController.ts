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
import { FRONTEND_URL} from '../config/index'

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
          userRole:existingUser.userRole,
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
       res.setHeader('Authorization', `Bearer ${authToken}`)
      return res.status(200).send({ message: 'Login successful', authToken })
    } catch (error) {
      return res
        .status(500)
        .send({ message: 'Internal server error', error: error.message })
    }
  }

  /**
   * Handles user logout
   * @param {AuthenticatedRequest} req - Express request object with user property
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async logOut(req: Request, res: Response): Promise<Response> {
    try{
    const userId = req.user.id
    const tokenKey = `user:${userId}`
    const tokenExists = await redisClient.exists(tokenKey)

    if (tokenExists) {
      await redisClient.del(tokenKey)
      res.removeHeader('authorization')
      return res.status(200).json({ message: 'Logout successfully' })
    }
    return res.status(401).json({ message: 'Already logged out' })
  }catch (error) {
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
   */
  static async loginWithGoogle(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      passport.authenticate(
        'google',
        async (err: unknown, user: UserAttributes | null) => {
          if (err) {
             res.status(500).json({ error: 'Internal Server Error' })
          }
          if (!user) {
            return res.status(401).json({ error: 'Authentication failed' })
          }
          if (user.status === 'inactive') {
             res.status(401).json({ message: 'User is disabled' })
          }
          createUserProfile(user.id)

          if (!user.verified) {
            await handlePendingVerification(user, res)
            return; 
          }
          if (user.userRole === UserRole.SELLER) {
            await handleSellerOTP(user, res)
            return 
          }
          const token = generateUserToken(user)
          if(user.userRole === UserRole.ADMIN){
             res.redirect(`${FRONTEND_URL}/admin?token=${token}`)
          }else{
           res.redirect(`${FRONTEND_URL}/login?token=${token}`)
          }
        },
      )(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

const handlePendingVerification = async (
  user: UserAttributes,
  res: Response,
) => {
  const pendingVerification = await Token.findOne({
    where: { userId: user.id },
  })
  const newVerificationToken = generateToken({ id: user.id, email: user.email })
  const baseUrl = `${process.env.NODEMAILER_BASE_URL}users/verify/${newVerificationToken}`
  const html = verificationsEmailTemplate(user.username, baseUrl)

  if (!pendingVerification) {
    await Token.create({ userId: user.id, token: newVerificationToken })
  } else {
    await pendingVerification.update({ token: newVerificationToken })
  }

  try {
    await sendMail(user.email, 'Verify Your Account', html)
     res.status(200).send({ message: 'A verification email has been sent' })
  } catch (error) {
     res.status(500).json({ message: 'Internal server error' })
  }
}

const handleSellerOTP = async (user: UserAttributes, res: Response) => {
  const otp = `${Math.floor(1000 + Math.random() * 9000)}`
  const html = otpEmailTemplate(user.username, otp)
  const otpToken = generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
    otp,
  })

  try {
    await redisClient.setEx(user.email, 300, `${otp}=${otpToken}`)
    await sendMail(user.email, 'OTP Verification Code', html)
     res.redirect(`${FRONTEND_URL}/verify-otp?email=${user.email}`);
  } catch (error) {
     res.status(500).json({ message: 'Internal server error' })
  }
}

const generateUserToken = (user: UserAttributes) => {
  const plainUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    userRole: user.userRole,
    verified: user.verified,
  }
  return generateToken(plainUser)
}