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
 *         cardNumber:
 *           type: string
 *         cardHolderName:
 *           type: string
 *         expiryDate:
 *           type: string
 *         cvv:
 *           type: string
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
 */
