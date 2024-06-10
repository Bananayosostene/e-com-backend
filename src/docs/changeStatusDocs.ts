/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [USERS]
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /users/{userId}/status:
 *   patch:
 *     summary: Update user status
 *     tags: [USERS]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newStatus:
 *                 type: string
 *                 enum: [active, inactive]
 *               description:
 *                 type: string
 *                 description: Description is required if status is inactive
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier for the user
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         status:
 *           type: string
 *           description: The current status of the user
 */
