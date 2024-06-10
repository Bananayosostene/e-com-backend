/**
 * @swagger
 * tags:
 *   name: PRODUCT
 *   description: Product management and status updates
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     productModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "1"
 *         name:
 *           type: string
 *           example: "Sample Product"
 *         description:
 *           type: string
 *           example: "This is a sample product."
 *         price:
 *           type: number
 *           example: 100.0
 *         productStatus:
 *           type: string
 *           example: "available"
 *         sellerId:
 *           type: number
 *           example: 123
 *       required:
 *         - id
 *         - name
 *         - price
 *         - productStatus
 *         - sellerId
 */

/**
 * @swagger
 * /collections/product/{productId}/status:
 *   patch:
 *     summary: Update product status
 *     tags: [PRODUCT]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productStatus:
 *                 type: string
 *                 enum: [available, unavailable]
 *                 example: "available"
 *     responses:
 *       200:
 *         description: Successfully updated product status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/productModel'
 *                 message:
 *                   type: string
 *                   example: Product status updated
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Status must be one of [available, unavailable]"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Product not found
 */
