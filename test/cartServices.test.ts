import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import Cart from '../src/database/models/cartModel'
import { getCart, createNewcart, clearCart } from '../src/services/cartService'
import {
  deleteProductById,
  getProductById,
} from '../src/services/productServices'

chai.use(sinonChai)

describe('Cart Services', () => {
  let sandbox: sinon.SinonSandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('getCart', () => {
    it('should return cart ', async () => {
        const mockedCart = {
            id: 'd95193b1-5548-4650-adea-71f622667095',
            buyerId:1,
            totalPrice:0,
            totalQuantity:0,
            items:[]
          } as Cart
      const findOneStub = sandbox.stub(Cart, 'findOne').resolves(mockedCart)

      const result = await getCart('d95193b1-5548-4650-adea-71f622667095',1)

      expect(findOneStub).to.have.been.called
      expect(result).to.deep.equal(mockedCart)
    })
  })

  describe('clearCart', () => {
    it('should update Cart', async () => {
      const updateStub = sandbox.stub(Cart, 'update').resolves()

      await clearCart('d95193b1-5548-4650-adea-71f622667095',
      )

      expect(updateStub).to.have.been.called
    })
  })

  describe('createNewCart', () => {
    it('should create new Cart', async () => {
        const mockedCart = {
            id: 'd95193b1-5548-4650-adea-71f622667095',
            buyerId:1,
            totalPrice:0,
            totalQuantity:0,
            items:[]
          } as Cart
      const createStub = sandbox.stub(Cart, 'create').resolves(mockedCart)

      const result = await createNewcart(1,
      )

      expect(createStub).to.have.been.called
      expect(result).to.equal(mockedCart)

    })
  })
})
