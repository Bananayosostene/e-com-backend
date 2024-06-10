import { Request, Response } from 'express'
import Notification,{NotificationAttributes} from '../database/models/notificationModel'
/**
 * Controller class for managing notifications-related operations ..
 */
class NotificationController {
  /**
   * Get notifications for the authenticated user
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async getNotifications(
    req: Request,
    res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user.id
      const notifications = await Notification.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
      })

      return res.status(200).json({ data: notifications })
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
  
  /**
   * Get a single notification by ID and mark it as read.
   * @param {AuthenticatedRequest} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async getSingleNotification(
    req: Request,
    res: Response,
  ): Promise<Response> {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findOne({
        where: { id: notificationId, userId },
      });

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      if (!notification.isRead) {
        await notification.update({ isRead: true });
      }

      return res.status(200).json({ data: notification });
    } catch (error) {

      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

/**
 * Mark a notification as read or unread
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Promise that resolves to an Express response
 */
static async changeNotificationStatus(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const notificationStatus = !notification.isRead;
    await notification.update({ isRead: notificationStatus });

    const statusMessage = notificationStatus ? 'Notification is now read' : 'Notification is now unread';
    return res.status(200).json({ message: statusMessage });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
}


  /**
 * Mark all notifications as read or unread
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Promise that resolves to an Express response
 */
static async changeAllNotificationStatus(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
      where: { userId: userId },
    });

    if (notifications.length === 0) {
      return res.status(404).json({ message: 'No notifications found' });
    }


    const allRead = notifications.every(notification => notification.isRead);
    const newIsReadStatus = !allRead;

    await Promise.all(notifications.map(notification => notification.update({ isRead: newIsReadStatus })));

    const statusMessage = newIsReadStatus ? 'All notifications are now read' : 'All notifications are now unread';
    return res.status(200).json({ message: statusMessage });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
}
}

export default NotificationController
