/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User login
 *     description: Logs in an existing user
 *     tags:
 *       - AUTH
 *     requestBody:
 *       description: User credentials for login
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful login, returns a JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jwt:
 *                   type: string
 *                   description: JWT token for authentication
 *                 message:
 *                   type: string
 *                   description: Success message
 *       '401':
 *         description: Invalid email or password
 *       '500':
 *         description: Unexpected error
 */
