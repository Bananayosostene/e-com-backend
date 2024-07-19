import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import express, { Request, Response } from 'express'
import Order from '../src/database/models/orderModel'
import Product from '../src/database/models/productModel'
import getStatsController from '../src/controllers/sellerStatsController'

chai.use(sinonChai)

describe('getStatsController', function getStatsControllerTest() {
  this.timeout(60000)

  let req: Request
  let res: Response
  let findAllStub: sinon.SinonStub
  let findOneStub: sinon.SinonStub

  beforeEach(() => {
    req = {
      user: { id: 'seller123' },
      query: {},
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response
    findAllStub = sinon.stub(Order, 'findAll')
    findOneStub = sinon.stub(Product, 'findOne')
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('getSellerStats', () => {
    it('should return 400 if startDate or endDate is missing', async () => {
      await getStatsController.getSellerStats(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.json).to.have.been.calledWith({
        message: 'startDate and endDate are required',
      })
    })

    it('should return seller stats successfully', async () => {
      req.query = { startDate: '2023-01-01', endDate: '2023-12-31' }
      const mockOrders = [
        {
          items: [
            {
              productId: 'product1',
              name: 'Product 1',
              price: 100,
              quantity: 2,
              images: ['image1.jpg'],
            },
            {
              productId: 'product2',
              name: 'Product 2',
              price: 50,
              quantity: 1,
              images: ['image2.jpg'],
            },
          ],
        },
      ]
      findAllStub.resolves(mockOrders)
      findOneStub.resolves({ id: 'product1', sellerId: 'seller123' })

      findOneStub
        .withArgs({ where: { id: 'product2', sellerId: 'seller123' } })
        .resolves({ id: 'product2', sellerId: 'seller123' })

      await getStatsController.getSellerStats(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.json).to.have.been.calledWith({
        message: 'Seller stats retrieved successfully',
        totalAmount: 250,
        totalSoldItems: 3,
        orders: [
          {
            productId: 'product1',
            name: 'Product 1',
            price: 100,
            quantity: 2,
            images: ['image1.jpg'],
            amount: 200,
          },
          {
            productId: 'product2',
            name: 'Product 2',
            price: 50,
            quantity: 1,
            images: ['image2.jpg'],
            amount: 50,
          },
        ],
      })
    })

    it('should handle errors and return 500 status', async () => {
      req.query = { startDate: '2023-01-01', endDate: '2023-12-31' }
      findAllStub.throws(new Error('Database error'))

      await getStatsController.getSellerStats(req, res)

      expect(res.status).to.have.been.calledWith(500)
      expect(res.json).to.have.been.calledWith({
        message: 'Database error',
      })
    })
  })
})
