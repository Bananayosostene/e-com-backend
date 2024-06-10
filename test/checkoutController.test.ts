import { Request, Response, NextFunction } from 'express'
import CheckoutController from '../src/controllers/checkoutController'
import Order, { OrderStatus } from '../src/database/models/orderModel'
import Cart from '../src/database/models/cartModel'
import { eventEmitter } from '../src/services/notificationServices'
import sinon, { SinonSpy, SinonStub } from 'sinon'
import { expect } from 'chai'

describe('CheckoutController', () => {
  describe('checkout', () => {
    let req: Partial<Request>
    let res: Partial<Response>
    let next: SinonSpy

    beforeEach(() => {
      req = {
        body: {
          fullName: 'John Doe',
          phoneNumber: '1234567890',
          country: 'USA',
          streetAddress: '123 Main St',
          town: 'Townsville',
          email: 'john@example.com',
          paymentMethod: 'creditCard',
          cardNumber: '4111111111111111',
        },
        user: {
          id: 1,
          email: 'john@example.com',
        },
      }

      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis(),
      } as unknown as Response

      next = sinon.spy() as SinonSpy
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should process the order successfully with credit card', async () => {
      const cart = {
        id: 1,
        buyerId: req.user.id,
        status: 'active',
        items: [
          {
            productId: 'a56eb4af-8194-413a-a487-d9884300c033',
            name: 'Laptop Bags',
            quantity: 2,
            price: 18000,
          },
        ],
      } as any

      const createdOrder = {
        id: 'order-id',
        userId: req.user.id,
        items: cart.items,
        totalAmount: 36000,
        status: OrderStatus.PENDING,
        deliveryInfo: req.body,
        paymentInfo: {
          method: 'creditCard',
          cardNumber: '4111111111111111',
          cardHolderName: 'Customer',
          expiryDate: '2030-12-12T00:00:00',
          cvv: '123',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any

      const findOneStub = sinon.stub(Cart, 'findOne').resolves(cart)
      const updateStub = sinon.stub(Cart, 'update').resolves([1])
      const createStub = sinon.stub(Order, 'create').resolves(createdOrder)
      const emitStub = sinon.stub(eventEmitter, 'emit')

      await CheckoutController.checkout(req as Request, res as Response, next)

      expect(findOneStub.calledOnce).to.be.true
      expect(updateStub.calledOnce).to.be.true
      expect(createStub.calledOnce).to.be.true
      expect(emitStub.calledOnce).to.be.true
    })
    it('should process the order successfully with mobile money', async () => {
      req.body.paymentMethod = 'mobileMoney'
      req.body.mobileMoneyNumber = '0781234567'

      const cart = {
        id: 1,
        buyerId: req.user.id,
        status: 'active',
        items: [
          {
            productId: 'a56eb4af-8194-413a-a487-d9884300c033',
            name: 'Laptop Bags',
            quantity: 2,
            price: 18000,
          },
        ],
      } as any

      const createdOrder = {
        id: 'order-id',
        userId: req.user.id,
        items: cart.items,
        totalAmount: 36000,
        status: OrderStatus.PENDING,
        deliveryInfo: req.body,
        paymentInfo: { method: 'mobileMoney', mobileMoneyNumber: '0781234567' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any

      const findOneStub = sinon.stub(Cart, 'findOne').resolves(cart)
      const updateStub = sinon.stub(Cart, 'update').resolves([1])
      const createStub = sinon.stub(Order, 'create').resolves(createdOrder)
      const emitStub = sinon.stub(eventEmitter, 'emit')

      await CheckoutController.checkout(req as Request, res as Response, next)

      expect(findOneStub.calledOnce).to.be.true
      expect(updateStub.calledOnce).to.be.true
      expect(createStub.calledOnce).to.be.true
      expect(emitStub.calledOnce).to.be.true
      expect(next.notCalled).to.be.true
    })

    it('should handle invalid payment method', async () => {
      req.body.paymentMethod = 'invalidMethod'

      await CheckoutController.checkout(req as Request, res as Response, next)
      expect(next.notCalled).to.be.true
    })

    it('should handle errors during order processing', async () => {
      const error = new Error('Database error')
      const findOneStub = sinon.stub(Cart, 'findOne').rejects(error)

      await CheckoutController.checkout(req as Request, res as Response, next)

      expect(findOneStub.calledOnce).to.be.true
      expect(next.calledOnce).to.be.true
      expect(next.calledWith(error)).to.be.true
    })
  })
})
