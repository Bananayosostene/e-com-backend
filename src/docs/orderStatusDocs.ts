/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: integer
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         totalAmount:
 *           type: number
 *         status:
 *           type: string
 *           enum:
 *             - PENDING
 *             - COMPLETED
 *             - CANCELLED
 *         deliveryInfo:
 *           $ref: '#/components/schemas/DeliveryInfo'
 *         paymentInfo:
 *           $ref: '#/components/schemas/PaymentInfo'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     OrderItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *         name:
 *           type: string
 *         quantity:
 *           type: integer
 *         price:
 *           type: number
 *     DeliveryInfo:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         country:
 *           type: string
 *         streetAddress:
 *           type: string
 *         town:
 *           type: string
 *         email:
 *           type: string
 *         deliveryDate:
 *           type: string
 *           format: date
 *     PaymentInfo:
 *       type: object
 *       properties:
 *         method:
 *           type: string
 *           enum:
 *             - creditCard
 *             - mobileMoney
 *         mobileMoneyNumber:
 *           type: string
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Process a checkout and create an order
 *     tags: [orders]
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order retrieved successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: No order found for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No active cart found for the user
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred while processing the order
 * /orders/{orderId}/status:
 *   patch:
 *     summary: admin updates an order status
 *     tags: [orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Canceled, Confirmed]
 *     responses:
 *       200:
 *         description: Order status updated  successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order retrieved successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: No order found for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No active cart found for the user
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred while processing the order
 * /orders/all:
 *   get:
 *     summary: Get All Orders
 *     description: Get all orders as an admin
 *     tags:
 *       [orders]
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
 *         description: The limit of Orders
 *     responses:
 *       '200':
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Orders retrieved successfully
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: no Orders found
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get buyer order
 *     description: Get order created by a buyer
 *     tags:
 *       [orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order Id
 *     responses:
 *       '200':
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Orders retrieved successfully
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Seller has no Order
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order not found
 *       '500':
 *         description: Internal server error
 */
