import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import Product from '../src/database/models/productModel'
import { Op } from 'sequelize'
import {
  deleteProductById,
  getProductById,
  searchProductsService
} from '../src/services/productServices'

chai.use(sinonChai)

describe('Product Services', () => {
  let sandbox: sinon.SinonSandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('getProductById', () => {
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

      const result = await getProductById(
        1,
        'd95193b1-5548-4650-adea-71f622667095',
      )

      expect(findOneStub).to.have.been.called
      expect(result).to.deep.equal({
        id: 'd95193b1-5548-4650-adea-71f622667095',
        name: 'watch',
        price: 2000,
        sellerId: 1,
        bonus: 12,
        sku: 'fghj',
        images: ['dfghjk'],
      })
    })
  })

  describe('deleteProductById', () => {
    it('should delete a product by id', async () => {
      const destroyStub = sandbox.stub(Product, 'destroy').resolves(1)

      const result = await deleteProductById(
        1,
        'd95193b1-5548-4650-adea-71f622667095',
      )

      expect(destroyStub).to.have.been.called
      expect(result).to.equal(1)
    })
  })

    describe('search product', () => {
      it('should return products matching the search criteria', async () => {
        const findAllStub = sandbox.stub(Product, 'findAll').resolves([
          {
            id: 'd95193b1-5548-4650-adea-71f622667095',
            name: 'watch',
            price: 2000,
            category: 'electronics',
            quantity: 10,
            productStatus: 'available',
            expiryDate: new Date('2025-01-01'),
          },
          {
            id: 'd95193b1-5548-4650-adea-71f622667096',
            name: 'phone',
            price: 1500,
            category: 'electronics',
            quantity: 5,
            productStatus: 'available',
            expiryDate: new Date('2025-01-01'),
          },
        ] as Product[])

        const query = {
          query: 'electro',
          minPrice: '1000',
          maxPrice: '2500',
        }

        const result = await searchProductsService(query)

        expect(findAllStub).to.have.been.calledWith({
          where: {
            [Op.or]: [
              { name: { [Op.iLike]: '%electro%' } },
              { category: { [Op.iLike]: '%electro%' } },
            ],
            price: {
              [Op.gte]: 1000,
              [Op.lte]: 2500,
            },
          },
        })
        expect(result).to.be.an('array').that.has.lengthOf(2)
        expect(result[0]).to.deep.include({
          id: 'd95193b1-5548-4650-adea-71f622667095',
          name: 'watch',
          price: 2000,
        })
        expect(result[1]).to.deep.include({
          id: 'd95193b1-5548-4650-adea-71f622667096',
          name: 'phone',
          price: 1500,
        })
      })

      it('should return an empty array if no products match the search criteria', async () => {
        const findAllStub = sandbox.stub(Product, 'findAll').resolves([])

        const query = {
          query: 'nonexistent',
          minPrice: '1000',
          maxPrice: '2500',
        }

        const result = await searchProductsService(query)

        expect(findAllStub).to.have.been.calledWith({
          where: {
            [Op.or]: [
              { name: { [Op.iLike]: '%nonexistent%' } },
              { category: { [Op.iLike]: '%nonexistent%' } },
            ],
            price: {
              [Op.gte]: 1000,
              [Op.lte]: 2500,
            },
          },
        })
        expect(result).to.be.an('array').that.is.empty
      })
    })
})
