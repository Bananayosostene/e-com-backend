/**
 * @swagger
 * /cart/products/{productId}:
 *   delete:
 *     summary: Delete a product from the buyer's cart
 *     description: Removes a specific product from the buyer's cart
 *     tags:
 *       - CART
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to delete
 *     responses:
 *       '200':
 *         description: Product deleted successfully from cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully from cart
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
