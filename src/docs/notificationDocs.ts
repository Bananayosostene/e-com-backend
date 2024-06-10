/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API for managing notifications
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The notification ID
 *         userId:
 *           type: integer
 *           description: The ID of the user
 *         message:
 *           type: string
 *           description: The notification message
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The creation date of the notification
 */

/**
 * Controller class for managing notifications-related operations.
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: A list of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */

/**
 * @swagger
 * /notifications/{notificationId}:
 *   get:
 *     summary: Get a single notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the notification
 *     responses:
 *       200:
 *         description: A single notification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */