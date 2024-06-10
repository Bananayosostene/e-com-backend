/**
 * @swagger
 * components:
 *   securitySchemes:
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *   schemas:
 *     userModel:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: First name and the Last name of the user
 *         email:
 *           type: string
 *           description: Email of the user
 *         password:
 *           type: string
 *           description: Password of the user
 *         userRole:
 *           type: string
 *           description: Role of the user
 *         verified:
 *           type: boolean
 *           description: Indicates if a user is verified
 *           enum:
 *             - admin
 *             - seller
 *             - buyer
 *           default: buyer
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date and time when the user was created
 *       required:
 *         - username
 *         - email
 *         - password
 */

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user
 *     tags:
 *       - AUTH
 *     requestBody:
 *       description: User object to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '201':
 *         description: A successful response, returns the newly created user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *       '400':
 *         description: Invalid email format
 *       '409':
 *         description: Email already exists
 *       '500':
 *         description: Unexpected error
 */

/**
 * @swagger
 * /users/login/verify/otp/{email}:
 *   post:
 *     summary: Verify OTP for two-factor authentication
 *     description: Verifies the one-time password (OTP) provided by the user during the two-factor authentication process.
 *     tags:
 *       - AUTH
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email associated with the OTP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *                 description: The one-time password provided by the user.
 *     responses:
 *       '200':
 *         description: Account authentication successful and Logged In Successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       '400':
 *         description: Bad request
 *       '404':
 *         description: OTP token not found
 *       '406':
 *         description: Invalid One Time Password
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/verify/{token}:
 *   get:
 *     summary: Verifies a user
 *     description: Verifies a user's account through their email using a verification token.
 *     tags:
 *       - AUTH
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token to be verified
 *     responses:
 *       '201':
 *         description: A successful response indicating user verification.
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
 *         description: Invalid Token
 *       '404':
 *         description: User Not Found
 *       '500':
 *         description: Unexpected error
 */
