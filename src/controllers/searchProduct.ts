import { Request, Response } from 'express'
import {searchProductsService,} from '../services/productServices'
import { UserRole } from '../database/models/userModel'


/**
 * Product Controller class
 */
export default class searchController {
  /**
   * Search product
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async searchProducts(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id
    const userRole = req.user?.userRole

    try {
      const products = await searchProductsService(req.query)

      if (products.length === 0) {
        return res
          .status(404)
          .json({ message: 'No products match the search criteria' })
      }

      if (userRole === UserRole.ADMIN) {
        const availableProducts = products.filter(
          (product) => product.quantity > 0,
        )
        return res.status(200).json({
          status: 200,
          message: 'Product(s) retrieved successfully',
          items: availableProducts,
        })
      }

      if (userRole === UserRole.SELLER) {
        const sellerProducts = products.filter(
          (product) => product.sellerId === userId,
        )
        if (sellerProducts.length === 0) {
          return res.status(403).json({
            status: 403,
            message:
              'No available products match the search criteria in this collection',
          })
        }
        const availableSellerProducts = sellerProducts.filter(
          (product) => product.quantity > 0,
        )
        return res.status(200).json({
          status: 200,
          message: 'Product(s) retrieved successfully',
          items: availableSellerProducts,
        })
      }

      if (userRole === UserRole.BUYER) {
        const currentDate = new Date()
        const availableProducts = products.filter(
          (product) =>
            product.productStatus === 'available' &&
            product.expiryDate > currentDate,
        )
        if (availableProducts.length === 0) {
          return res.status(404).json({
            status: 404,
            message: 'No available products match the search criteria',
          })
        }
        return res.status(200).json({
          status: 200,
          message: 'Product(s) retrieved successfully',
          items: availableProducts,
        })
      }
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}
