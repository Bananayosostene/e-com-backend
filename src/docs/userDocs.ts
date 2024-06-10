/**
 * @swagger
 * /users/changeRole/{userId}:
 *   post:
 *     summary: Changes Role of a user
 *     description: An Admin can be able to change role of someone
 *     tags:
 *       - USERS
 *     requestBody:
 *       description: New user ROle to set
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newRole:
 *                 type: string
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Id of a user to be modified
 *     responses:
 *       '200':
 *         description: A successful response indicating user role changed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       '400':
 *         description: Invalid Role set
 *       '404':
 *         description: User Not Found
 *       '500':
 *         description: Unexpected error
 */

/**
 * @swagger
 * /users/reset/link:
 *   post:
 *     summary: Request a password reset link
 *     description: Sends an email with a password reset link to the user
 *     tags: [AUTH]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 *       500:
 *         description: Error sending email
 */

/**
 * @swagger
 * /users/reset/password/{token}:
 *   post:
 *     summary: Reset the user's password
 *     description: Resets the user's password using a token sent via email
 *     tags: [AUTH]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: newPassword123
 *     responses:
 *       200:
 *         description: Password has been successfully reset
 *       400:
 *         description: User not found
 *       401:
 *         description: Invalid token
 *       404:
 *         description: Token not found or expired
 *       500:
 *         description: Internal server error
 */
