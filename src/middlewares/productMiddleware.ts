import Order, { OrderStatus } from '../database/models/orderModel';
import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
      interface Request {
        purchasedProduct?: {
            buyerId: number,
            productId: string
        }
      }
    }
  }

/**
 * Middleware to check if the product is purchased successfully.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
export const checkProductPurchased = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = req.params.productId;
        const user = req.user;
        const buyerId = user.id;

        const order = await Order.findOne({
            where: { userId: buyerId, status: OrderStatus.COMPLETED },
        });
        const productFound = order.items.some(item => item.productId === productId)

        if (productFound) {
            req.purchasedProduct = {buyerId, productId};
            return next();
        }
        return res.status(404).json({ message: 'Product not found or not purchased successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
