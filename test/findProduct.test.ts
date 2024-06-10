import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import express, { Request, Response, NextFunction } from 'express'
import Product from '../src/database/models/productModel'
import productController from '../src/controllers/productController'

chai.use(sinonChai)

const getProductDetails = productController.getProductDetails

describe('getProductDetails', function getProductDetailsTest() {
  this.timeout(50000)

  let req: Request
  let res: Response
  let next: NextFunction
  let findByPkStub: sinon.SinonStub

  beforeEach(() => {
    req = express.request as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response
    next = sinon.spy()
    findByPkStub = sinon.stub(Product, 'findByPk')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should return 404 if product is not found', async () => {
    req.params = { id: 'productId' }
    findByPkStub.resolves(null)

    await getProductDetails(req, res)

    expect(res.status).to.have.been.calledWith(404)
    expect(res.json).to.have.been.calledWith({
      status: 404,
      error: 'Product not found',
    })
  })

  it('should return 403 if item does not exist in seller collection', async () => {
    req.params = { id: 'productId' }
    req.user = { id: 123, userRole: 'seller' }
    findByPkStub.resolves({
      sellerId: 456,
      quantity: 5,
      toJSON: () => ({ sellerId: 456, quantity: 5 }),
    })

    await getProductDetails(req, res)

    expect(res.status).to.have.been.calledWith(403)
    expect(res.json).to.have.been.calledWith({
      status: 403,
      message: 'You are not authorized to access this product',
    })
  })

  it('should return 200 if item is retrieved successfully for seller', async () => {
    req.params = { id: 'productId' }
    req.user = { id: 123, userRole: 'seller' }
    const productMock = {
      sellerId: 123,
      quantity: 5,
      toJSON: () => ({ sellerId: 123, quantity: 5 }),
    }
    findByPkStub.resolves(productMock)

    await getProductDetails(req, res)

    expect(res.status).to.have.been.calledWith(200)
    expect(res.json).to.have.been.calledWith({
      status: 200,
      message: 'Product details retrieved successfully by seller',
      item: {
        ...productMock.toJSON(),
        averageRating: 0,
      },
    })
  })

  it('should return 200 if item is retrieved successfully for admin and quantity > 0', async () => {
    req.params = { id: 'productId' }
    req.user = { id: 123, userRole: 'admin' }
    const productMock = {
      quantity: 5,
      toJSON: () => ({ quantity: 5 }),
    }
    findByPkStub.resolves(productMock)

    await getProductDetails(req, res)

    expect(res.status).to.have.been.calledWith(200)
    expect(res.json).to.have.been.calledWith({
      status: 200,
      message: 'Product details retrieved successfully by admin',
      item: {
        ...productMock.toJSON(),
        averageRating: 0,
      },
    })
  })

  it('should return 404 if item is expired for buyer', async () => {
    req.params = { id: 'productId' }
    req.user = { id: 123, userRole: 'buyer' }
    const mockExpiryDate = new Date(Date.now() - 10000)
    const productMock = {
      quantity: 5,
      productStatus: 'available',
      expiryDate: mockExpiryDate,
      toJSON: () => ({
        quantity: 5,
        productStatus: 'available',
        expiryDate: mockExpiryDate,
      }),
    }
    findByPkStub.resolves(productMock)

    await getProductDetails(req, res)

    expect(res.status).to.have.been.calledWith(404)
    expect(res.json).to.have.been.calledWith({
      status: 404,
      error: 'Product has expired',
    })
  })

  it('should return 404 if item is not available for buyer', async () => {
    req.params = { id: 'productId' }
    req.user = { id: 123, userRole: 'buyer' }
    const mockExpiryDate = new Date(Date.now() + 10000)
    const productMock = {
      quantity: 5,
      productStatus: 'unavailable',
      expiryDate: mockExpiryDate,
      toJSON: () => ({
        quantity: 5,
        productStatus: 'unavailable',
        expiryDate: mockExpiryDate,
      }),
    }
    findByPkStub.resolves(productMock)

    await getProductDetails(req, res)

    expect(res.status).to.have.been.calledWith(404)
    expect(res.json).to.have.been.calledWith({
      status: 404,
      error: 'Product is currently unavailable',
    })
  })

  it('should return 200 if item is retrieved successfully for buyer and quantity > 0, product is available and not expired', async () => {
    req.params = { id: 'productId' }
    req.user = { id: 123, userRole: 'buyer' }
    const mockExpiryDate = new Date('2026-05-26 00:00:00+00')
    const productMock = {
      quantity: 5,
      productStatus: 'available',
      expiryDate: mockExpiryDate,
      toJSON: () => ({
        quantity: 5,
        productStatus: 'available',
        expiryDate: mockExpiryDate,
      }),
    }
    findByPkStub.resolves(productMock)

    await getProductDetails(req, res)

    expect(res.status).to.have.been.calledWith(200)
    expect(res.json).to.have.been.calledWith({
      status: 200,
      message: 'Product details retrieved successfully by buyer',
      item: {
        ...productMock.toJSON(),
        averageRating: 0,
      },
    })
  })

  it('should return 200 with correct average rating if item has reviews', async () => {
    req.params = { id: 'productId' }
    req.user = { id: 123, userRole: 'buyer' }
    const mockExpiryDate = new Date('2026-05-26 00:00:00+00')
    const reviewsMock = [
      { rating: 4, toJSON: () => ({ rating: 4 }) },
      { rating: 5, toJSON: () => ({ rating: 5 }) },
    ]
    const productMock = {
      quantity: 5,
      productStatus: 'available',
      expiryDate: mockExpiryDate,
      toJSON: () => ({
        quantity: 5,
        productStatus: 'available',
        expiryDate: mockExpiryDate,
      }),
      reviews: reviewsMock,
    }
    findByPkStub.resolves(productMock)

    await getProductDetails(req, res)

    expect(res.status).to.have.been.calledWith(200)
    expect(res.json).to.have.been.calledWith({
      status: 200,
      message: 'Product details retrieved successfully by buyer',
      item: {
        ...productMock.toJSON(),
        averageRating: 4.5,
      },
    })
  })

  it('should handle internal server error', async () => {
    req.params = { id: 'productId' }
    findByPkStub.rejects(new Error('Internal server error'))

    await getProductDetails(req, res)

    expect(res.status).to.have.been.calledWith(500)
    expect(res.json).to.have.been.calledWith({
      status: 500,
      error: 'Internal server error',
    })
  })
})
