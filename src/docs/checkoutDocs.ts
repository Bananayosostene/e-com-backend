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
 * /checkout:
 *   post:
 *     summary: Process a checkout and create an order
 *     tags: [Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: GUY MAX
 *               phoneNumber:
 *                 type: string
 *                 example: 1234567890
 *               country:
 *                 type: string
 *                 example: Rwanda
 *               streetAddress:
 *                 type: string
 *                 example: 123 Main St
 *               town:
 *                 type: string
 *                 example: Kigali
 *               email:
 *                 type: string
 *                 example: guy@example.com
 *               deliveryDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-12-31
 *               paymentMethod:
 *                 type: string
 *                 enum: [creditCard, mobileMoney]
 *                 example: creditCard
 *               cardNumber:
 *                 type: string
 *                 example: 4111111111111111
 *               cardHolderName:
 *                 type: string
 *                 example: Maxime Guy
 *               expiryDate:
 *                 type: string
 *                 example: 2025-12-31
 *               cvv:
 *                 type: string
 *                 example: 123
 *               mobileMoneyNumber:
 *                 type: string
 *                 example: 0781234567
 *     responses:
 *       201:
 *         description: Order processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order processed successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid payment method or other bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid payment method
 *       404:
 *         description: No active cart found for the user
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
