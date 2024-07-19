import { Request, Response } from 'express'
import User from '../database/models/userModel'
import sendMail from '../utils/sendEmail'
import disableUserTemplate from '../utils/emailTemplates/disableUserTemplate'
import enableUserTemplate from '../utils/emailTemplates/enableUserTemplate'
import Paginator from '../utils/paginator'
import { getUsersCount } from '../services/userServices'

export default class adminContoller {
/**
 * Get all users
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Promise that resolves to an Express response
 */
static async getAllUsers(req: Request, res: Response): Promise<Response> {
  try {
    
    const paginationResults = Paginator(req, res)

    if(!paginationResults){
      return res
  .status(400)
  .json({ message: 'Invalid pagination parameters' })
}

const {offset, limit, page} = paginationResults

const totalCount: number = await getUsersCount()
const totalPages = Math.ceil(totalCount / limit)

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      offset,
      limit
    });
    return res.status(200).json({
      message: 'Users retrieved successfully',
      users,
      pagination: { limit, page, totalPages },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
