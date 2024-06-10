import { Request, Response, NextFunction } from 'express'
import Cart from '../database/models/cartModel'

/**
 * Middleware to check if the logged-in user has an active cart.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Promise that resolves to void
 */
const checkCartMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user
  try {
    const cart = await Cart.findOne({
      where: { buyerId: user.id, status: 'active' },
    })

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({
        message: 'No items found in the cart',
      })
    }

    next()
  } catch (error) {
    next(error)
  }
}

export default checkCartMiddleware
