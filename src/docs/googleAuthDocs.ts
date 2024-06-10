/**
 * @swagger
 * components:
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
 *
 *   securitySchemes:
 *     googleAuth:
 *       type: oauth2
 *       flows:
 *         authorizationCode:
 *           authorizationUrl: https://accounts.google.com/o/oauth2/auth
 *           tokenUrl: https://accounts.google.com/o/oauth2/token
 *           scopes:
 *             email: Grants access to the user's email address
 *             profile: Grants access to the user's profile information
 */

/**
 * @swagger
 * /users/google:
 *   get:
 *     summary: Authentication via Google
 *     description: User is able to login via Google account
 *     tags:
 *       - AUTH
 *     security:
 *       - googleAuth: [email, profile]
 *     responses:
 *       '201':
 *         description: Login Successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:  # Define properties of the data object
 *                     user:
 *                       $ref: '#/components/schemas/userModel'
 *       '401':
 *         description: Authentication failed
 *       '500':
 *         description: Internal server error
 */
