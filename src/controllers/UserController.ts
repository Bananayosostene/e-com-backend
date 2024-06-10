import { Request, Response } from 'express'
import User, { UserRole } from '../database/models/userModel'

import {
  getUserProfileById,
  updateUserById,
  updateUserProfileById,
  getUserById,
} from '../services/userServices'

import {
  validateAndRetrieveToken,
  deleteTokenByUserId,
  validateRedisToken,
} from '../services/tokenServices'
import { hashPassword } from '../utils/passwords'
import { generateResetToken, generateToken } from '../utils/jwt'
import { verificationsEmailTemplate } from '../utils/emailTemplates'
import Token from '../database/models/tokenModel'
import sendMail from '../utils/sendEmail'
import { NODEMAILER_BASE_URL } from '../config'
import redisClient from '../utils/redisConfiguration'
/**
 * User Controller class
 */
export default class UserController {
  /**
   * Signup method for user registration
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async signup(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, username } = req.body
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        return res.status(409).json({
          message: 'This user already exists',
        })
      }
      const hashedpassword = hashPassword(password)

      const newUser = new User({
        username,
        email,
        password: (await hashedpassword).toString(),
        verified: false,
      })

      await newUser.save()

      const token = generateToken({
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      })
      const baseUrl = `${NODEMAILER_BASE_URL}users/verify/${token}`

      const html = verificationsEmailTemplate(newUser.username, baseUrl)

      Promise.all([
        await sendMail(email, 'Verify Account', html),
        await Token.create({
          userId: newUser.id,
          token,
        }),
      ])

      return res.status(201).json({
        message: 'Account Created successfully, verify your email to continue',
      })
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error })
    }
  }

  /**
   * verifyEmail method for verifying a user
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async verifyEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.params

      const decodedToken = await validateAndRetrieveToken(token)

      if (!decodedToken) {
        return res.status(401).send({ message: 'Invalid token' })
      }

      const user = await getUserById(decodedToken.id)

      if (!user) {
        return res
          .status(400)
          .send({ message: 'Invalid token or user not found' })
      }

      await Promise.all([
        user.update({ verified: true }),
        deleteTokenByUserId(decodedToken.id),
      ])

      res.status(201).send({ message: 'Email verified successfully' })
    } catch (error) {
      res.status(500).send({ message: 'Internal server error' })
    }
  }

  /**
   * updateUser method for updating user information
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.user
      const fieldsToUpdate = req.body
      const { username, email } = req.body
      if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: 'nothing to update' })
      }

      if (username || email) await updateUserById({ username, email }, id)
      await updateUserProfileById(fieldsToUpdate, id)

      const updateduser = await getUserProfileById(id)
      return res.status(200).json(updateduser)
    } catch (err: unknown) {
      const errors = err as Error
      return res.status(500).json(errors.message)
    }
  }

  /**
   * getUser method for getting user profile
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async getUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.user
      const myprofile = await getUserProfileById(id)
      return res.status(200).json(myprofile)
    } catch (err: unknown) {
      return res.status(500).json(err)
    }
  }

  /**
   * Handles OTP verification /Two factor authentication.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async twofaVerifyOtp(req: Request, res: Response): Promise<Response> {
    const { otp } = req.body
    const { email } = req.params
    try {
      const redisResult = await redisClient.get(email)
      if (!redisResult) {
        return res.status(404).json({ message: 'OTP token not found' })
      }
      const [storedOtp, storedToken] = redisResult.split('=')
      if (storedOtp !== otp) {
        return res.status(406).json({ message: 'Invalid One Time Password' })
      }
      await redisClient.del(email)
      return res
        .status(200)
        .json({ jwt: storedToken, message: 'Login successful' })
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * changeUserRole method for changing user role
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async changeUserRole(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params
      const { newRole } = req.body

      if (!userId || !newRole) {
        return res.status(400).json({ message: 'Bad request' })
      }

      if (
        ![UserRole.ADMIN, UserRole.BUYER, UserRole.SELLER].includes(newRole)
      ) {
        return res.status(400).json({ Message: 'Invalid role set', newRole })
      }

      const existingUser = await User.findOne({ where: { id: userId } })

      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' })
      }

      existingUser.update({ userRole: newRole })
      return res.status(200).json({
        message: 'User role has been updated.',
        existingUser,
      })
    } catch (error) {
      res.status(400).json({ message: 'Error Occured', error })
    }
  }
  static async resetPasswordLink(
    req: Request,
    res: Response,
  ): Promise<Response> {
    try {
      const { email } = req.body
      const user = await User.findOne({ where: { email } })

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      const token = generateResetToken({
        id: user.id,
        email: user.email,
        username: user.username,
      })

      const resetLink = `${NODEMAILER_BASE_URL}/users/reset-password/${token}`

      const msg = {
        to: user.email,
        subject: 'Password Reset Request',
        html: `<strong>Click on the link to reset your password: <a href="${resetLink}">RESET PASSWORD</a></strong>`,
      }

      await redisClient.setEx(token, 3000, token)
      await sendMail(msg.to, msg.subject, msg.html)
      return res.status(200).json({ message: 'Password reset email sent' })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async newPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.params
      const { password } = req.body

      const redisToken = await redisClient.get(token)
      if (!redisToken) {
        return res.status(404).json({ message: 'Token not found or expired' })
      }

      const decodedToken = await validateRedisToken(redisToken)

      if (!decodedToken) {
        return res.status(401).json({ message: 'Invalid token' })
      }
      const user = await getUserById(decodedToken.id)
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      const hashedPassword = await hashPassword(password)
      await user.update({
         password: hashedPassword,
         isExpired: false,
         lastTimePasswordUpdate: new Date(),
         })
      await redisClient.del(token)

      return res
        .status(200)
        .json({ message: 'Password has been successfully reset' })
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}
