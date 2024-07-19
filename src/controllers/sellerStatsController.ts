/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Request, Response } from 'express'
import { Op } from 'sequelize'
import Order from '../database/models/orderModel'
import Product from '../database/models/productModel'

/**
 * SEller stats Controller class
 */
export default class getStatsController {
  /**
   * Get statistics for a seller
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async getSellerStats(req: Request, res: Response): Promise<Response> {
    const { id: sellerId } = req.user
    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: 'startDate and endDate are required' })
    }

    const start = new Date(startDate as string)
    const end = new Date(endDate as string)

    try {
      const orders = await Order.findAll({
        where: {
          createdAt: {
            [Op.between]: [start, end],
          },
          status: {
            [Op.in]: ['Completed'],
          },
        },
      })

      const sellerItems: {
        productId: string
        name: string
        price: number
        quantity: number
        images: string[]
        amount: number
      }[] = []

      for (const order of orders) {
        for (const item of order.items) {
          const product = await Product.findOne({
            where: { id: item.productId, sellerId },
          })
          if (product) {
            sellerItems.push({
              ...item,
              amount: item.price * item.quantity,
            })
          }
        }
      }

    

      const totalAmount = sellerItems.reduce(
        (total, item) => total + item.amount,
        0,
      )
      const totalSoldItems = sellerItems.reduce(
        (total, item) => total + item.quantity,
        0,
      )

      return res.status(200).json({
        message: 'Seller stats retrieved successfully',
        totalAmount,
        totalSoldItems,
        orders: sellerItems,
      })
    } catch (err: unknown) {
      const error = err as Error
      return res.status(500).json({ message: error.message })
    }
  }
}
