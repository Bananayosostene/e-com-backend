/**
 * @swagger
 * components:
 *   schemas:
 *     userProfile:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: First name and the Last name of the user
 *         email:
 *           type: string
 *           description: Email of the user
 *         gender:
 *           type: string
 *           description: Gender of the user
 *         billingAddress:
 *           type: string
 *           description: Billing Address of the user
 *         homeAddress:
 *           type: string
 *           description: Home Address of the user
 *         preferredCurrency:
 *           type: string
 *           description: Preferred Currency of the user
 *         preferredLanguage:
 *           type: string
 *           description: Preferred Language of the user
 *         birthdate:
 *           type: string
 *           description: Birth Date of the user
 *         phoneNumber:
 *           type: string
 *           description: Phone Number of the user
 *         profileImageUrl:
 *           type: string
 *           description: Profile Photo of the user
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [UserProfile]
 *     responses:
 *       '200':
 *         description: A successful response, returns the user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/userProfile'
 *       '400':
 *         description: No user profile found
 *       '500':
 *         description: Unexpected error
 *   patch:
 *     summary: Update a User Profile
 *     tags: [UserProfile]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: First name and the Last name of the user
 *               email:
 *                 type: string
 *                 description: Email of the user
 *               password:
 *                 type: string
 *                 description: Password of the user
 *               gender:
 *                 type: string
 *                 description: Gender of the user
 *               billingAddress:
 *                 type: string
 *                 description: Billing Address of the user
 *               homeAddress:
 *                 type: string
 *                 description: Home Address of the user
 *               preferredCurrency:
 *                 type: string
 *                 description: Preferred Currency of the user
 *               preferredLanguage:
 *                 type: string
 *                 description: Preferred Language of the user
 *               birthdate:
 *                 type: string
 *                 description: Birth Date of the user
 *               phoneNumber:
 *                 type: string
 *                 description: Phone Number of the user
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Profile Photo of the user
 *     responses:
 *       200:
 *         description: The User profile was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/userProfile'
 *       403:
 *         description: Nothing to update or no User found
 */
