import { Request, Response } from 'express'
import User from '../database/models/userModel'
import sendMail from '../utils/sendEmail'
import disableUserTemplate from '../utils/emailTemplates/disableUserTemplate'
import enableUserTemplate from '../utils/emailTemplates/enableUserTemplate'
export default class adminContoller {
  /**
   * Update user status
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {string} newStatus - New status to set for the user
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async getAllUsers(req: Request, res: Response): Promise<Response> {
    try {
      const users = await User.findAll()
      return res.status(200).json(users)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
  /**
   * Update user status
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async updateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params
      const { newStatus, description } = req.body

      if (!newStatus) {
        return res.status(400).json({ message: 'New status is required' })
      }

      if (!description && newStatus === 'inactive') {
        return res
          .status(400)
          .json({ message: 'Description is required for deactivation' })
      }

      const user = await User.findByPk(userId)

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      if (user.status === newStatus) {
        return res.status(400).json({ message: `User is already ${newStatus}` })
      }

      user.status = newStatus
      await user.save()

      const html =
        newStatus === 'inactive'
          ? disableUserTemplate(user.username, description)
          : enableUserTemplate(user.username)

      try {
        await sendMail(user.email, `Confirmation of account status`, html)
        return res
          .status(200)
          .json({
            message: `User is now ${newStatus}, email sent successfully`,
          })
      } catch (emailError) {
        return res
          .status(500)
          .json({
            message: `User is now ${newStatus}, but failed to send email`,
            error: emailError.message,
          })
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Internal server error', error: error.message })
    }
  }
}
