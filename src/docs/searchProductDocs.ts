/**
 * @swagger
 * /collections/products/search:
 *   get:
 *     summary: Search for products
 *     description: A user can search for products by name, category, and price range. The search can be a combination of these criteria with an AND operation.
 *     tags:
 *       - PRODUCT
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Part or full name of the product or category to search
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price of the product to search
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price of the product to search
 *     responses:
 *       '200':
 *         description: A list of products that match the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Product(s) retrieved successfully
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 123e4567-e89b-12d3-a456-426614174000
 *                       name:
 *                         type: string
 *                         example: Stove
 *                       price:
 *                         type: number
 *                         example: 4500.00
 *                       category:
 *                         type: string
 *                         example: Electronics
 *                       collectionId:
 *                         type: string
 *                         example: 123e4567-e89b-12d3-a456-426614174001
 *                       bonus:
 *                         type: number
 *                         example: 10
 *                       sku:
 *                         type: string
 *                         example: SKU123456
 *                       quantity:
 *                         type: number
 *                         example: 100
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: https://example.com/image.jpg
 *                       expiryDate:
 *                         type: string
 *                         format: date
 *                         example: 2024-12-31
 *                       sellerId:
 *                         type: number
 *                         example: 1
 *                       productStatus:
 *                         type: string
 *                         example: available
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid query parameters
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: You are not authorized to access these products
 *       '404':
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: No products match the search criteria
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
