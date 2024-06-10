/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout user
 *     description: Logs out a user by deleting token in Redis
 *     tags:
 *       - AUTH
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully logged out
 *       '401':
 *         description: Already logged out
 */
