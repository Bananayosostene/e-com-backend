/**
 * @swagger
 * /collections/{id}/product:
 *   put:
 *     summary: Update a product
 *     description: Updates an existing product by ID.
 *     tags:
 *       - PRODUCT
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the product to update
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Product data to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 nullable: true
 *               price:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *               category:
 *                 type: string
 *                 nullable: true
 *               bonus:
 *                 type: number
 *                 nullable: true
 *               sku:
 *                 type: string
 *                 nullable: true
 *               quantity:
 *                 type: integer
 *                 nullable: true
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-31"
 *                 nullable: true
 *     responses:
 *       '200':
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1"
 *                     name:
 *                       type: string
 *                       example: "Product Name"
 *                     price:
 *                       type: number
 *                       format: float
 *                       example: 29.99
 *                     category:
 *                       type: string
 *                       example: "Electronics"
 *                     bonus:
 *                       type: number
 *                       example: 10
 *                     sku:
 *                       type: string
 *                       example: "SKU12345"
 *                     quantity:
 *                       type: integer
 *                       example: 100
 *                     expiryDate:
 *                       type: string
 *                       format: date
 *                       example: "2023-12-31"
 *       '400':
 *         description: Invalid input or product not available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid input or product not available"
 *       '404':
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product not found"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Error message details"
 */
/**
 * @swagger
 * /collections/product:
 *   get:
 *     summary: Get all products of the signed-in user
 *     description: Retrieves all products associated with the currently authenticated user.
 *     tags:
 *       - PRODUCT
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "1"
 *                   name:
 *                     type: string
 *                     example: "Product Name"
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 29.99
 *                   category:
 *                     type: string
 *                     example: "Electronics"
 *                   bonus:
 *                     type: number
 *                     example: 10
 *                   sku:
 *                     type: string
 *                     example: "SKU12345"
 *                   quantity:
 *                     type: integer
 *                     example: 100
 *                   expiryDate:
 *                     type: string
 *                     format: date
 *                     example: "2023-12-31"
 *                   sellerId:
 *                     type: string
 *                     example: "user123"
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Error message details"
 */

/**
 * @swagger
 * /collections/product/{id}/images:
 *   delete:
 *     summary: Remove images from a product
 *     tags: [Product Image Update]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["image1.jpg"]
 *     responses:
 *       200:
 *         description: Images removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: No images were removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
/**
 * @swagger
 * /collections/product/{id}/images:
 *   post:
 *     summary: Add images to a product
 *     tags: [Product Image Update]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: file
 *                   format: binary
 *                 description: List of image files to be added
 *     responses:
 *       200:
 *         description: Images added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Product should have at least 4 images
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
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
 *           example: "Product Name"
 *         price:
 *           type: number
 *           format: float
 *           example: 29.99
 *         category:
 *           type: string
 *           example: "Electronics"
 *         bonus:
 *           type: number
 *           example: 10
 *         sku:
 *           type: string
 *           example: "SKU12345"
 *         quantity:
 *           type: integer
 *           example: 100
 *         expiryDate:
 *           type: string
 *           format: date
 *           example: "2023-12-31"
 *         sellerId:
 *           type: string
 *           example: "user123"
 */