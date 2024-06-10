import { UUID } from 'crypto'
import { Request, Response } from 'express'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { EventEmitter } from 'events'
import Product from '../database/models/productModel'
import Cart, { CartItem } from '../database/models/cartModel'
import Order, { OrderStatus } from '../database/models/orderModel'
import { momoToken } from '../middlewares/momoAuth'
import { decrementProductServices } from '../services/productServices'
import {
  MOMO_TARGET_ENV,
  MOMO_API_KEY,
  MOMO_SUBSCRIPTION_KEY,
  MOMO_URL,
  MOMO_XREFERENCED,
  MOMO_CALLBACK_URL,
} from '../config/index'
import Notification from '../database/models/notificationModel'
import User from '../database/models/userModel'
import sendEmail from '../utils/sendEmail'
import { eventEmitter } from '../services/notificationServices'


const momoHost = MOMO_URL
const momoRequestToPayUrl = `${momoHost}/v1_0/requesttopay`


/**
 * Cart Controller class
 */
export default class MoMoController {
  /**
   * Momo controller
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async getMoMoToken(req: Request, res: Response): Promise<Response> {
    try {
      const token = await momoToken()

      return res.status(200).json({ token })
    } catch (error) {
      
      res
        .status(500)
        .json({ message: 'Internal server error', error: error.message })
    }
  }

  /**
   * Momo controller
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async requestToPay(req: Request, res: Response): Promise<Response> {
    const orderId =req.params.orderId
    // orderId  = orderId.trim()
    

    const order = await Order.findByPk(orderId)

    if (!order || order.paymentInfo.method !== 'mobileMoney') {
      return res.status(404).json({ message: 'Invalid Order' })
    }

    if(order.status === OrderStatus.COMPLETED || order.status === OrderStatus.INITIATED){
      return res.status(404).json({ message: `Order has already been ${order.status}`}) 
    }
    const momoToken = req.momoToken
    const subscriptionKey = MOMO_SUBSCRIPTION_KEY

    try {
      if (!momoToken) {
        return res.status(400).json({ error: 'MoMo token not available' })
      }

      const body = {
        amount: order.totalAmount,
        currency: 'EUR',
        externalId: order.id,
        payer: {
          partyIdType: 'MSISDN',
          partyId: order.paymentInfo.mobileMoneyNumber,
        },
        payerMessage: 'Payment for order',
        payeeNote: 'Payment for order',
      }
      const transId = uuidv4()
      const Response = await axios.post(momoRequestToPayUrl, body, {
        headers: {
          'X-Reference-Id': `${transId}`,
          'X-Target-Environment': MOMO_TARGET_ENV,
          'Ocp-Apim-Subscription-Key': `${subscriptionKey}`,
          Authorization: `Bearer ${momoToken}`,
          'Content-Type': 'application/json',
          "X-Callback-Url":MOMO_CALLBACK_URL
        },
      })
      
      if (Response.status === 200 || Response.status === 202) {
        order.reference = transId
        const reference = await order.save()
        if (!reference) {
          return res.status(401).json({
            message: 'failed to add reference id',
          })
        }

        await Promise.all([
          decrementProductServices(order.items),
          Order.update(
            { status: OrderStatus.INITIATED },
            { where: { id: order.id } },
          ),
          eventEmitter.emit('order:updatedStatus', order)

        ])
      }
      res.json({message:"Order initiated successfully", transId })
    } catch (error) {
     
      res.status(500).json({ message: 'An error occurred', error:error.message })
    }
  }

  /**
   * Momo controller
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async checkPayed(req: Request, res: Response): Promise<Response> {
    try {
      const subscriptionKey = MOMO_SUBSCRIPTION_KEY
      const { orderId } = req.params

      const order = await Order.findByPk(orderId)

      if (!order || order.paymentInfo.method !== 'mobileMoney') {
        return res.status(404).json({ message: 'Invalid Order' })
      }

      if(order.status === OrderStatus.COMPLETED){
        return res.status(404).json({ message: `Order has already been ${order.status}`}) 
      }
      const token = req.momoToken

      if (!token) {
        return res.status(400).json({ error: 'MoMo token not available' })
      }

      const url = `${momoRequestToPayUrl}/${order.reference}`
      const target = MOMO_TARGET_ENV

      const headers = {
        'X-Target-Environment': target,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        Authorization: `Bearer ${token}`,
      }

      const responses = await axios.get(url, { headers })
      if (
        (responses.status === 200 || responses.status === 202) &&
        responses.data.status === 'SUCCESSFUL'
      ) {
          await Order.update({status:OrderStatus.COMPLETED},{where:{id:order.id}})
          eventEmitter.emit('order:updatedStatus', order)
        return res
          .status(200)
          .json({ message: 'Order Completed', response: responses.data })
      }

      return res
        .status(200)
        .json({
          message: 'Order Payment unsuccessful',
          data: responses.data.status,
        })
    } catch (error) {
      
      res
        .status(500)
        .json({ message: 'Internal server error', error: error.message })
    }
  }
}
