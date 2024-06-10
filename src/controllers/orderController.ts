import { Request, Response } from 'express'
import Order from '../database/models/orderModel';
import eventEmitter from '../services/notificationServices';
import OrderService from '../services/orderService';

/**
 * Get notifications for the authenticated user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Promise that resolves to an Express response
 */
export const getorder = async (req: Request, res: Response) => {
    const { id } = req.user;
    try {
      const order = await Order.findOne({
        where: { userId: id },
      });
      if (!order) {
        return res.status(404).json({message: 'Order not found'})
      }
      return res.status(200).json({message: 'Order retrieved successful', order})
    } catch (err: unknown) {
      const errors = err as Error;
      return res.status(500).json( errors.message)
    }
  };

  /**
   * Get notifications for the authenticated user
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  export const updateproductorder = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { status } = req.body;
  
    try {
      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({message: 'Order not found'})
      }
      await OrderService.updateOrderStatus(orderId as string, status);
      const updatedOrder = await Order.findByPk(orderId);
      const statu = updatedOrder.status
      eventEmitter.emit('order:updatedStatus', updatedOrder)
      return res.status(200).json({message: 'Order status updated successfully', statu})
    } catch (err: unknown) {
      const errors = err as Error;
      return res.status(500).json( errors.message)
    }
  };
