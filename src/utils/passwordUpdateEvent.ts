import cron from 'node-cron'
import { Op } from 'sequelize'
import User from '../database/models/userModel'
import { EventEmitter } from 'events'
import { passwordExpiry } from './emailTemplates/passwordExpiryTemplate'
import sendMail from '../utils/sendEmail'
import { PASSWORD_EXPIRATION_TIME, URL } from '../config/index'
import logger from '../utils/logger'

const userEvents = new EventEmitter()

export const passwordExpiryCron = (): void => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const PASSWORD_EXPIRATION_DAYS: number = PASSWORD_EXPIRATION_TIME
      const expirationDate: Date = new Date(
        Date.now() - PASSWORD_EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
      )

      const users = await User.findAll({
        where: {
          lastTimePasswordUpdate: {
            [Op.lt]: expirationDate,
          },
          isExpired: false,
        },
      })

      for (const user of users) {
        await notifyUser(user)
        await User.update({ isExpired: true }, { where: { id: user.id } })
      }
    } catch (error) {
      logger.error('Error running password expiry cron job:', error)
    }
  })
}

userEvents.on('passwordUpdated', async (userId: number) => {
  try {
    await User.update(
      { lastTimePasswordUpdate: new Date(), isExpired: false },
      { where: { id: userId } },
    )
  } catch (error) {
    console.error(
      `Failed to update password update time for user ${userId}:`,
      error,
    )
  }
})

export async function notifyUser(user: any): Promise<void> {
  try {
    const html = passwordExpiry(
      user.username,
    )
    await sendMail(user.email, 'Password Expiry Notification', html)
    logger.info(`Password expiry notification sent to user ${user.id}`)
  } catch (error) {
    logger.error(
      `Failed to send password expiry notification to user ${user.id}:`,
      error,
    )
  }
}

export default userEvents