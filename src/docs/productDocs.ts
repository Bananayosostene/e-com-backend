/**
 * @swagger
 * /collections/{id}/product:
 *   post:
 *     summary: Add a new product
 *     description: Add a new product with images
 *     tags:
 *       - PRODUCT
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the collection to which the product belongs
 *     requestBody:
 *       description: Product details along with images
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the product
 *               price:
 *                 type: number
 *                 description: Price of the product
 *               category:
 *                 type: string
 *                 description: Name of the category
 *               bonus:
 *                 type: number
 *                 description: Bonus points for the product
 *               sku:
 *                 type: string
 *                 description: SKU of the product
 *               quantity:
 *                 type: number
 *                 description: Quantity of the product
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                   description: Image file(s) of the product
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 description: Expiry date of the product
 *     responses:
 *       '201':
 *         description: Product added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product added successfully
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No files were uploaded or Product with the same name already exists for this seller
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Collection not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Collection not found
 *       '500':
 *         description: Internal server error
 * /collections/products/{productId}:
 *   delete:
 *     summary: Deletes a product
 *     description: Deletes  product with provided id
 *     tags:
 *       - PRODUCT
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: id of the product to delete
 *     responses:
 *       '200':
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       '410':
 *         description: not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No item found
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Seller not found
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /collections:
 *   get:
 *     summary: Get All Sellers Collection
 *     description: Get collections created by a seller
 *     tags:
 *       [COLLECTION]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: string
 *         description: The page
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: string
 *         description: The limit of Collections
 *     responses:
 *       '200':
 *         description: Collections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Collections retrieved successfully
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Seller has no collection
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Collection not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Collection not found
 *       '500':
 *         description: Internal server error
 */
/**
 * @swagger
 * /collections/products:
 *   get:
 *     summary: Get Products
 *     description: Get allproduct(if buyer) and products in collection if seller
 *     tags:
 *       [PRODUCT]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: string
 *         description: The page
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: string
 *         description: The limit of products
 *     responses:
 *       '200':
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Products retrieved successfully
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Seller has no collection
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Collection not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Collection not found
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /collections/{collectionId}/products:
 *   get:
 *     summary: Get Products
 *     description: Get allproduct(if buyer) and products in collection if seller
 *     tags:
 *       [PRODUCT]
 *     parameters:
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the collection a used want to see
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: string
 *         description: The page
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: string
 *         description: The limit of products
 *     responses:
 *       '200':
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Products retrieved successfully
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Seller has no collection
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Collection not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Collection not found
 *       '500':
 *         description: Internal server error
 */
