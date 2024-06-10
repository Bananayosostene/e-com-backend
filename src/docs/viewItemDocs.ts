/**
 * @swagger
 * /collections/product/{id}:
 *   get:
 *     summary: Retrieve Item details
 *     description: Retrieves the details of a specific product based on the product ID.
 *     tags:
 *       - PRODUCT
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the product to retrieve.
 *     responses:
 *       '200':
 *         description: Item retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 item:
 *                   $ref: '#/components/schemas/Product'
 *       '400':
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *       '403':
 *         description: Item does not exist in your collection
 *       '404':
 *         description: Item not found or Item not available
 *       '500':
 *         description: Internal server error
 */
