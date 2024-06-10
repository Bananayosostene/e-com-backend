import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import express, { Request, Response, NextFunction } from 'express'
import Product from '../src/database/models/productModel'
import Cart, { CartItem } from '../src/database/models/cartModel'
import cartController from '../src/controllers/cartController'
import isAuthenticated, {
  checkPermission,
} from '../src/middlewares/authenticationMiddleware'

chai.use(sinonChai)

const updateCart = cartController.updateCart

describe('Update cart Total price by + or - quantity', function () {
  this.timeout(60000)

  let req: Request
  let res: Response
  let next: NextFunction
  let findByPkStub: sinon.SinonStub
  let findOneStub: sinon.SinonStub
  let updateStub: sinon.SinonStub

  beforeEach(() => {
    req = { user: { id: 1 } } as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response
    next = sinon.spy()
    findByPkStub = sinon.stub(Product, 'findByPk')
    findOneStub = sinon.stub(Cart, 'findOne')
    updateStub = sinon.stub(Cart, 'update')
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('updateCart', () => {
    it('should return 400 if items are missing', async () => {
      req.body = {}
      req.user = { id: 1 }
      await updateCart(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.json).to.have.been.calledWith({ message: 'Items are required' })
    })

    it('should return 400 if userId is missing', async () => {
      req.body = { items: [] }
      req.user = null
      await updateCart(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.json).to.have.been.calledWith({ message: 'User ID is required' })
    })

    it('should return 404 if cart is not found', async () => {
      req.body = { items: [] }
      req.user = { id: 1 }
      findOneStub.resolves(null)
      await updateCart(req as Request, res as Response)
      expect(res.status).to.have.been.calledWith(404)
      expect(res.json).to.have.been.calledWith({ message: 'Cart not found' })
    })

    it('should return 404 if product is not found', async () => {
      req.body = {
        items: [
          { productId: '10f8635d-2166-466b-a9df-4bd416b1a20d', quantity: 1 },
        ],
      }
      req.user = { id: 5540, userRole: 'buyer' }
      findByPkStub.resolves(null)
      findOneStub.resolves({
        id: 'cartId',
        buyerId: 1,
        status: 'active',
        items: [] as CartItem[],
        totalPrice: 0,
        totalQuantity: 0,
      })
      await updateCart(req as Request, res as Response)
      expect(res.status).to.have.been.calledWith(404)
      expect(res.json).to.have.been.calledWith({ message: 'Product not found' })
    })

    it('should return 400 if quantity is invalid', async () => {
      req.body = {
        items: [
          { productId: '7ffc7b37-edc2-4a3a-b741-5174cda3f099', quantity: 0 },
        ],
      }
      req.user = { id: 5540, userRole: 'buyer' }
      findOneStub.resolves({
        id: 'cartId',
        buyerId: 1,
        status: 'active',
        items: [] as CartItem[],
        totalPrice: 0,
        totalQuantity: 0,
      })
      await updateCart(req as Request, res as Response)
      expect(res.status).to.have.been.calledWith(400)
      expect(res.json).to.have.been.calledWith({ message: 'Invalid quantity' })
    })

    it('should return 400 if quantity exceeds available product stock', async () => {
      req.body = {
        items: [
          {
            productId: '8d4939dd-2637-4fa6-875a-7d0031d04bd5',
            quantity: 6,
          },
        ],
      }
      req.user = { id: 5540 }

      const product = {
        id: '8d4939dd-2637-4fa6-875a-7d0031d04bd5',
        name: 'Test Product',
        price: 10,
        quantity: 5,
        images: ['imageUrl'],
      }
      const cart = {
        id: '61ba3042-2a89-49c9-be57-6a365e612024',
        buyerId: 5540,
        status: 'active',
        items: [
          {
            productId: '8d4939dd-2637-4fa6-875a-7d0031d04bd5',
            quantity: 4,
          } as CartItem,
        ],
        totalPrice: 50,
        totalQuantity: 4,
      }

      findByPkStub.resolves(product)
      findOneStub.resolves(cart)

      await updateCart(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.json).to.have.been.calledWith({
        message: 'Products out of stock',
      })
    })

    it('should return 400 if quantity exceeds product stock for new item', async () => {
      req.body = {
        items: [
          {
            productId: '8d4939dd-2637-4fa6-875a-7d0031d04bd5',
            quantity: 10,
          },
        ],
      }
      req.user = { id: 5540 }

      const product = {
        id: '8d4939dd-2637-4fa6-875a-7d0031d04bd5',
        name: 'Test Product',
        price: 10,
        quantity: 5,
        images: ['imageUrl'],
      }
      const cart = {
        id: '61ba3042-2a89-49c9-be57-6a365e612024',
        buyerId: 5540,
        status: 'active',
        items: [] as CartItem[],
        totalPrice: 0,
        totalQuantity: 0,
      }

      findByPkStub.resolves(product)
      findOneStub.resolves(cart)

      await updateCart(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.json).to.have.been.calledWith({
        message: 'Insufficient stock',
      })
    })

    it('should add a new item to the cart and return 200 on success', async () => {
      req.body = {
        items: [
          {
            productId: '8d4939dd-2637-4fa6-875a-7d0031d04bd5',
            quantity: 3,
          },
        ],
      }
      req.user = { id: 5540 }

      const product = {
        id: '8d4939dd-2637-4fa6-875a-7d0031d04bd5',
        name: 'Test Product',
        price: 10,
        quantity: 10,
        images: ['imageUrl'],
      }
      const cart = {
        id: '61ba3042-2a89-49c9-be57-6a365e612024',
        buyerId: 5540,
        status: 'active',
        items: [] as CartItem[],
        totalPrice: 0,
        totalQuantity: 0,
      }
      const updatedCart = {
        id: '61ba3042-2a89-49c9-be57-6a365e612024',
        buyerId: 5540,
        status: 'active',
        items: [
          {
            productId: '8d4939dd-2637-4fa6-875a-7d0031d04bd5',
            name: 'Test Product',
            price: 10,
            quantity: 3,
            images: ['imageUrl'],
          } as CartItem,
        ],
        totalPrice: 30,
        totalQuantity: 3,
      }
      findByPkStub.resolves(product)
      findOneStub
        .onFirstCall()
        .resolves(cart)
        .onSecondCall()
        .resolves(updatedCart)
      updateStub.resolves([1])

      await updateCart(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.json).to.have.been.calledWith({
        message: 'Cart updated successfully',
        cart: updatedCart,
      })
    })
  })
})
