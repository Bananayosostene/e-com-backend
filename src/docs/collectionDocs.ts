/**
 * @swagger
 * /collections:
 *   post:
 *     summary: Create a new collection
 *     description: Create a new collection with the provided name
 *     tags:
 *       - COLLECTION
 *     requestBody:
 *       description: Collection details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the collection
 *               description:
 *                 type: string
 *                 description: Description of the collection
 *     responses:
 *       '201':
 *         description: Collection created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Collection created successfully
 *       '400':
 *         description: Bad Request
 *       '500':
 *         description: Internal server error
 */
