/**
   * @swagger
   * /wishlist/products/{productId}:
   *   post:
   *     summary: Add a product to the wishlist
   *     description: Add a specified product to the authenticated user's wishlist
   *     tags: 
   *       - WISHLIST
   *     parameters:
   *       - in: path
   *         name: productId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of product to add to wishlist 
   *     responses:
   *       '201':
   *         description: Product added to wishlist successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Product added to wishlist successfully
   *                 wishlist:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     productId:
   *                       type: string
   *                     buyerId:
   *                       type: string
   *                 product:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     name:
   *                       type: string
   *                     price:
   *                       type: number
   *                     imageUrl:
   *                       type: string
   *                       example: 'https://example.com/image.jpg'
   *       '400':
   *         description: Product already in wishlist
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Product already in wishlist
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
   *                 error:
   *                   type: string
   */




 /**
   * @swagger
   * /wishlist/products:
   *   get:
   *     summary: Get user's wishlist
   *     description: Retrieve the authenticated user's wishlist
   *     tags: 
   *       - WISHLIST
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
   *         description: The limit of Users
   *     responses:
   *       '200':
   *         description: List of wishlist items
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                   buyerId:
   *                     type: string
   *                   Products:
   *                     type: object
   *                     properties:
   *                       name:
   *                         type: string
   *                       price:
   *                         type: number
   *                       images:
   *                         type: array
   *                         items:
   *                           type: string
   *                           example: 'https://example.com/image.jpg'
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
   *                 error:
   *                   type: string
   */




 /**
   * @swagger
   * /wishlist/products/{productId}:
   *   delete:
   *     summary: Remove product from wishlist
   *     description: Remove a specified product from the authenticated user's wishlist
   *     tags: 
   *       - WISHLIST
   *     parameters:
   *       - in: path
   *         name: productId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the wishlist product to delete
   *     responses:
   *       '200':
   *         description: Product removed from wishlist successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Product removed from wishlist successfully
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
   *         description: Wishlist not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Wishlist not found
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
   *                 error:
   *                   type: string
   */