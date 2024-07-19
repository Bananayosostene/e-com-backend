import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import express, { Request, Response, NextFunction } from 'express'
import Product from '../src/database/models/productModel'
import searchController from '../src/controllers/searchController'
import { UserRole } from '../src/database/models/userModel'
import * as productService from '../src/services/productServices'

chai.use(sinonChai)

const searchProducts = searchController.searchProducts

describe('ProductController - searchProducts', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let searchProductsStub: sinon.SinonStub

  beforeEach(() => {
    req = express.request as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response
    next = sinon.spy()
    searchProductsStub = sinon.stub(productService, 'searchProductsService')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should return 404 if no products match the search criteria', async () => {
    req.query = { query: 'nonexistent', minPrice: '100', maxPrice: '500' }
    searchProductsStub.resolves([])

    await searchProducts(req, res)

    expect(res.status).to.have.been.calledWith(404)
    expect(res.json).to.have.been.calledWith({
      message: 'No products match the search criteria',
    })
  })

  it('should return 200 with available products for admin', async () => {
    req.query = { query: 'product', minPrice: '100', maxPrice: '500' }
    req.user = { id: 123, userRole: UserRole.ADMIN }
    searchProductsStub.resolves([{ quantity: 5 }])

    await searchProducts(req, res)

    expect(res.status).to.have.been.calledWith(200)
    expect(res.json).to.have.been.calledWith({
      status: 200,
      message: 'Product(s) retrieved successfully',
      items: [{ quantity: 5 }],
    })
  })

  it('should return 403 if seller does not own any matching products', async () => {
    req.query = { query: 'product', minPrice: '100', maxPrice: '500' }
    req.user = { id: 123, userRole: UserRole.SELLER }
    searchProductsStub.resolves([{ sellerId: 456, quantity: 5 }])

    await searchProducts(req, res)

    expect(res.status).to.have.been.calledWith(403)
    expect(res.json).to.have.been.calledWith({
      status: 403,
      message:
        'No available products match the search criteria in this collection',
    })
  })

  it('should return 200 with available products for seller', async () => {
    req.query = { query: 'product', minPrice: '100', maxPrice: '500' }
    req.user = { id: 123, userRole: UserRole.SELLER }
    searchProductsStub.resolves([{ sellerId: 123, quantity: 5 }])

    await searchProducts(req, res)

    expect(res.status).to.have.been.calledWith(200)
    expect(res.json).to.have.been.calledWith({
      status: 200,
      message: 'Product(s) retrieved successfully',
      items: [{ sellerId: 123, quantity: 5 }],
    })
  })

  it('should return 404 if no available products for buyer', async () => {
    req.query = { query: 'product', minPrice: '100', maxPrice: '500' }
    req.user = { id: 123, userRole: UserRole.BUYER }
    const currentDate = new Date()
    searchProductsStub.resolves([
      {
        productStatus: 'unavailable',
        expiryDate: new Date(currentDate.getTime() + 10000),
      },
    ])

    await searchProducts(req, res)

    expect(res.status).to.have.been.calledWith(404)
    expect(res.json).to.have.been.calledWith({
      status: 404,
      message: 'No available products match the search criteria',
    })
  })

  it('should return 200 with available products for buyer', async () => {
    req.query = { query: 'product', minPrice: '100', maxPrice: '500' }
    req.user = { id: 123, userRole: UserRole.BUYER }
    const currentDate = new Date()
    const mockExpiryDate = new Date(currentDate.getTime() + 100000)
    searchProductsStub.resolves([
      { productStatus: 'available', expiryDate: mockExpiryDate, quantity: 5 },
    ])

    await searchProducts(req, res)

    expect(res.status).to.have.been.calledWith(200)
    expect(res.json).to.have.been.calledWith({
      status: 200,
      message: 'Product(s) retrieved successfully',
      items: [
        { productStatus: 'available', expiryDate: mockExpiryDate, quantity: 5 },
      ],
    })
  })

  it('should handle internal server error', async () => {
    req.query = { query: 'product', minPrice: '100', maxPrice: '500' }
    searchProductsStub.rejects(new Error('Internal server error'))

    await searchProducts(req, res)

    expect(res.status).to.have.been.calledWith(500)
    expect(res.json).to.have.been.calledWith({
      message: 'Internal server error',
    })
  })
})
//
