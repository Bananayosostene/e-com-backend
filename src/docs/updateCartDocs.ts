/**
 * @swagger
 * /cart/products/{productId}:
 *   patch:
 *     summary: Update the buyer's cart
 *     description: Updates the buyer's cart with new items or changes to existing items
 *     tags:
 *       - CART
 *     requestBody:
 *       description: Details of the items to update in the cart
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: The ID of the product
 *                       example: "12345"
 *                     quantity:
 *                       type: number
 *                       description: The quantity of the product
 *                       example: 2
 *     responses:
 *       '200':
 *         description: Cart updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cart updated successfully
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
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                               description: The URL of the product image
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
 *                   example: Invalid request data
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
 *         description: Cart or Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cart or Product not found
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
