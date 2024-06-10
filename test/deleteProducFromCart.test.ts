import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import express, { Request, Response, NextFunction } from 'express'
import Cart, { CartItem } from '../src/database/models/cartModel'
import cartController from '../src/controllers/cartController'

chai.use(sinonChai)

const deleteProductFromCart = cartController.deleteProductFromCart

describe('Remove product in cart', function () {
  this.timeout(60000)

  let req: Request
  let res: Response
  let next: NextFunction
  let findOneStub: sinon.SinonStub
  let updateStub: sinon.SinonStub

  beforeEach(() => {
    req = express.request as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response
    next = sinon.spy()
    findOneStub = sinon.stub(Cart, 'findOne')
    updateStub = sinon.stub(Cart.prototype, 'save')
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('deleteProductFromCart', () => {
    it('should return 400 if user ID is missing', async () => {
      delete req.user
      req.params = { productId: 'productId' }
      await deleteProductFromCart(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.json).to.have.been.calledWith({
        message: 'User ID is required',
      })
    })


    it('should return 404 if product is not found in cart', async () => {
      req.user = { id: 1 }
      req.params = { productId: 'productId' }

      const cart = {
        id: 'cartId',
        buyerId: 1,
        status: 'active',
        items: [] as CartItem[],
        totalPrice: 0,
        totalQuantity: 0,
      }

      findOneStub.resolves(cart)

      await deleteProductFromCart(req, res)

      expect(res.status).to.have.been.calledWith(404)
      expect(res.json).to.have.been.calledWith({
        message: 'Product not found in cart',
      })
    })

    it('should remove the product from the cart successfully', async () => {
      req.user = { id: 5540 }
      req.params = { productId: 'a56eb4af-8194-413a-a487-d9884300c033' }

      const cart = {
        id: '61ba3042-2a89-49c9-be57-6a365e612024',
        buyerId: 5540,
        status: 'active',
        items: [
          {
            productId: 'a56eb4af-8194-413a-a487-d9884300c033',
            name: 'Test Product',
            price: 10,
            quantity: 1,
            images: ['imageUrl'],
          },
        ],
        totalPrice: 10,
        totalQuantity: 1,
      }

      const updatedCart = {
        ...cart,
        items: [] as CartItem[],
        totalPrice: 0,
        totalQuantity: 0,
      }

      findOneStub.resolves(cart)
      updateStub.resolves(updatedCart)

      await deleteProductFromCart(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.json).to.have.been.calledWith({
        message: 'Product removed from cart successfully',
        cart: updatedCart,
      })
    })
       it('should update totalPrice correctly after removing product from cart', async () => {
      req.user = { id: 5540 };
      req.params = { productId: 'a56eb4af-8194-413a-a487-d9884300c033' };

      const cart = {
        id: '61ba3042-2a89-49c9-be57-6a365e612024',
        buyerId: 5540,
        status: 'active',
        items: [
          {
            productId: 'a56eb4af-8194-413a-a487-d9884300c033',
            name: 'Test Product',
            price: 10,
            quantity: 1,
            images: ['imageUrl'],
          },
          {
            productId: 'anotherProduct',
            name: 'Another Product',
            price: 5,
            quantity: 2,
            images: ['anotherImageUrl'],
          },
        ],
        totalPrice: 20,
        totalQuantity: 3,
      };

      const updatedCart = {
        ...cart,
        items: [
          {
            productId: 'anotherProduct',
            name: 'Another Product',
            price: 5,
            quantity: 2,
            images: ['anotherImageUrl'],
          },
        ],
        totalPrice: 10,
        totalQuantity: 2,
      };

      findOneStub.resolves(cart);
      updateStub.resolves(updatedCart);

      await deleteProductFromCart(req, res);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        message: 'Product removed from cart successfully',
        cart: updatedCart,
      });
      expect(updatedCart.totalPrice).to.equal(10);
    });

    it('should update totalQuantity correctly after removing product from cart', async () => {
      req.user = { id: 5540 };
      req.params = { productId: 'a56eb4af-8194-413a-a487-d9884300c033' };

      const cart = {
        id: '61ba3042-2a89-49c9-be57-6a365e612024',
        buyerId: 5540,
        status: 'active',
        items: [
          {
            productId: 'a56eb4af-8194-413a-a487-d9884300c033',
            name: 'Test Product',
            price: 10,
            quantity: 1,
            images: ['imageUrl'],
          },
          {
            productId: 'anotherProduct',
            name: 'Another Product',
            price: 5,
            quantity: 2,
            images: ['anotherImageUrl'],
          },
        ],
        totalPrice: 20,
        totalQuantity: 3,
      };

      const updatedCart = {
        ...cart,
        items: [
          {
            productId: 'anotherProduct',
            name: 'Another Product',
            price: 5,
            quantity: 2,
            images: ['anotherImageUrl'],
          },
        ],
        totalPrice: 10,
        totalQuantity: 2,
      };

      findOneStub.resolves(cart);
      updateStub.resolves(updatedCart);

      await deleteProductFromCart(req, res);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        message: 'Product removed from cart successfully',
        cart: updatedCart,
      });
      expect(updatedCart.totalQuantity).to.equal(2);
    });
  })
})
