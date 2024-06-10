import chai, { expect } from 'chai'
import sinon, { SinonStub } from 'sinon'
import { Request, Response } from 'express'
import sinonChai from 'sinon-chai'
import ProductController from '../src/controllers/productController'
import * as productServices from '../src/services/productServices'
import Product from '../src/database/models/productModel'
import { getProductById } from '../src/services/productServices'

// Setting up sinon-chai for better assertions with sinon

chai.use(sinonChai)

describe('ProductController', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let statusStub: SinonStub
  let jsonStub: SinonStub
  let sandbox: sinon.SinonSandbox

  beforeEach(() => {
    req = {}
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    }
    statusStub = res.status as SinonStub
    jsonStub = res.json as SinonStub
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sinon.restore()
    sandbox.restore()
  })

  describe('ProductStatusAvailable', () => {
    it('should return 404 if the product is not found', async () => {
      req.user = { userRole: 'seller' }
      req.params = { id: 'nonexistent-id' }
      req.body = { productStatus: 'available' }

      sinon.stub(productServices, 'getProductById').resolves(null)
      await ProductController.changeProductStatus(
        req as Request,
        res as Response,
      )
      expect(statusStub).to.have.been.calledWith(404)
    })
    it('should return 400 if product quantity is zero and status is available', async () => {
      const productMock = {
        quantity: 0,
        expiryDate: new Date(Date.now() + 100000),
        update: sinon.stub(),
      }
      req.user = { id: 1 }
      req.params = { productId: 'existing-id' }
      req.body = { productStatus: 'available' }

      sinon.stub(productServices, 'getProductById').resolves(productMock as any)

      await ProductController.changeProductStatus(
        req as Request,
        res as Response,
      )

      expect(statusStub).to.have.been.calledWith(400)
      expect(jsonStub).to.have.been.calledWith({
        error:
          'Product cannot be marked as available. May be the quantity is zero or the product has expired.',
      })
    })
    it('should return 200 and update product status to available or unavailable', async () => {
      const productMock = {
        id: 'existing-id',
        update: sinon
          .stub()
          .resolves({ id: 'existing-id', productStatus: 'available' }),
      }
      req.user = { userRole: 'seller' }
      req.body = { productStatus: 'available' }
      req.params = { id: 'e578b02d-4d6c-4898-bec8-68deed4a469f' }

      sinon.stub(productServices, 'getProductById').resolves(productMock as any)

      await ProductController.changeProductStatus(
        req as Request,
        res as Response,
      )
      expect(statusStub).to.have.been.calledWith(200)
    })

    it('should return a product by id', async () => {
      const findOneStub = sandbox.stub(Product, 'findOne').resolves({
        id: 'd95193b1-5548-4650-adea-71f622667095',
        name: 'watch',
        price: 2000,
        sellerId: 1,
        bonus: 12,
        sku: 'fghj',
        images: ['dfghjk'],
      } as Product)

      await getProductById(1, 'd95193b1-5548-4650-adea-71f622667095')

      expect(findOneStub).to.have.been.called
    })
  })
})
