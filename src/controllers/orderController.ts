import { Request, Response } from 'express'
import Order from '../database/models/orderModel';
import eventEmitter from '../services/notificationServices';
import OrderService from '../services/orderService';
import Product from '../database/models/productModel';

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
export const getUserOrders = async (req: Request, res: Response) => {
    const { id } = req.user;
    try {
      const orders = await Order.findAll({
        where: { userId: id },
      });
      if (!orders) {
        return res.status(404).json({message: 'User has no orders'})
      }
      return res.status(200).json({message: 'Orders retrieved successful', orders})
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
export const getSingleUserOrder = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { orderId } = req.params;
    try {
      const order = await Order.findOne({
        where: { userId: id , id:orderId},
      });
      if (!order) {
        return res.status(404).json({message: 'User has no orders'})
      }
      return res.status(200).json({message: 'Order retrieved successful', order})
    } catch (err: unknown) {
      const errors = err as Error;
      return res.status(500).json( errors.message)
    }
  };

/**
 * Get all orders as an admin
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Promise that resolves to an Express response
 */
export const getAllorders = async (req: Request, res: Response) => {
    try {
      const page: number =
      Number.parseInt(req.query.page as unknown as string, 10) || 1
    const limit: number =
      Number.parseInt(req.query.limit as unknown as string, 10) || 5

    if (
      Number.isNaN(page) ||
      Number.isNaN(limit) ||
      page <= 0 ||
      limit <= 0
    ) {
      return res
        .status(400)
        .json({ message: 'Invalid pagination parameters' })
    }

      const offset = (page - 1) * limit

      const orders = await Order.findAll({offset, limit});
      if (!orders) {
        return res.status(404).json({message: 'no orders found'})
      }
      return res.status(200).json({message: 'Orders retrieved successful', orders})
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
