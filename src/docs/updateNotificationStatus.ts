/**
 * @swagger
 * components:
 *   schemas:
 *     notificationStatus:
 *       type: object
 *       properties:
 *         isRead:
 *           type: boolean
 *           example: false
 */
/**
 * @swagger
 * /notifications/all:
 *   put:
 *     summary: Mark all notifications as read or unread
 *     tags: [Notifications]
 *     responses:
 *       '200':
 *         description: Status of all notifications updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All notifications have been updated."
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 *                 error:
 *                   type: string
 *                   example: "Detailed error message."
 */
/**
 * @swagger
 * /notifications/{notificationId}/one:
 *   put:
 *     summary: Mark a notification as read or unread
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the notification
 *     responses:
 *       '200':
 *         description: Status of the notification updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notification status has been updated."
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 *                 error:
 *                   type: string
 *                   example: "Detailed error message."
 */
