/**
 * @swagger
 * /stats/seller-stats:
 *   get:
 *     summary: Get statistics for a seller
 *     tags: [SELLER STATS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: The start date for the statistics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: The end date for the statistics (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Seller stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Seller stats retrieved successfully
 *                 totalAmount:
 *                   type: number
 *                   example: 1500.00
 *                 totalSoldItems:
 *                   type: number
 *                   example: 10
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                         example: 123e4567-e89b-12d3-a456-426614174000
 *                       name:
 *                         type: string
 *                         example: Product Name
 *                       price:
 *                         type: number
 *                         example: 100.00
 *                       quantity:
 *                         type: number
 *                         example: 2
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                       amount:
 *                         type: number
 *                         example: 200.00
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: startDate and endDate are required
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No token, authorization denied
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No orders found for the given time frame
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred
 */