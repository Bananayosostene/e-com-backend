/**
 * @swagger
 * /cart/products/{productId}:
 *   post:
 *     summary: Add a product to the cart
 *     description: Adds a product to the user's cart
 *     tags:
 *       - CART
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to add to the cart
 *     requestBody:
 *       description: Details of the product to add to the cart
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 description: The quantity of the product to add
 *                 example: 1
 *     responses:
 *       '201':
 *         description: Product added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product added to cart successfully
 *                 cart:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The ID of the cart
 *                     buyerId:
 *                       type: string
 *                       description: The ID of the buyer
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                             description: The ID of the product
 *                           name:
 *                             type: string
 *                             description: The name of the product
 *                           price:
 *                             type: number
 *                             description: The price of the product
 *                           quantity:
 *                             type: number
 *                             description: The quantity of the product in the cart
 *                           imageUrl:
 *                             type: string
 *                             description: The URL of the product image
 *                     totalPrice:
 *                       type: number
 *                       description: The total price of the cart
 *                     totalQuantity:
 *                       type: number
 *                       description: The total quantity of items in the cart
 *                     status:
 *                       type: string
 *                       description: The status of the cart
 *                       example: active
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid quantity
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       '404':
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user cart
 *     description: Gets an active cart of a user
 *     tags:
 *       - CART
 *     responses:
 *       '201':
 *         description: Cart retrived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cart retrived succssfully
 *                 cart:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The ID of the cart
 *                     buyerId:
 *                       type: string
 *                       description: The ID of the buyer
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                             description: The ID of the product
 *                           name:
 *                             type: string
 *                             description: The name of the product
 *                           price:
 *                             type: number
 *                             description: The price of the product
 *                           quantity:
 *                             type: number
 *                             description: The quantity of the product in the cart
 *                           imageUrl:
 *                             type: string
 *                             description: The URL of the product image
 *                     totalPrice:
 *                       type: number
 *                       description: The total price of the cart
 *                     totalQuantity:
 *                       type: number
 *                       description: The total quantity of items in the cart
 *                     status:
 *                       type: string
 *                       description: The status of the cart
 *                       example: active
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid quantity
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       '404':
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */


/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Clear user cart
 *     description: Clears the cart of a user
 *     tags:
 *       - CART
 *     responses:
 *       '201':
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cart cleared successfully
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid quantity
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       '404':
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
