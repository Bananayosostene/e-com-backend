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

const addToCart = cartController.addToCart

describe('CartController', function () {
  this.timeout(60000)

  let req: Request
  let res: Response
  let next: NextFunction
  let findByPkStub: sinon.SinonStub
  let findOneStub: sinon.SinonStub
  let createStub: sinon.SinonStub
  let updateStub: sinon.SinonStub

  beforeEach(() => {
    req = express.request as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response
    next = sinon.spy()
    findByPkStub = sinon.stub(Product, 'findByPk')
    findOneStub = sinon.stub(Cart, 'findOne')
    createStub = sinon.stub(Cart, 'create')
    updateStub = sinon.stub(Cart.prototype, 'update')
  })

  afterEach(() => {
    sinon.restore()
  })
  describe('addToCart', () => {
    it('should return 400 if productId or buyerId is missing', async () => {
      req.params = {}
      req.body = { quantity: 1 }
      req.user = { id: 1 }
      await isAuthenticated(req, res, next)
      await checkPermission('buyer')(req, res, next)

      await addToCart(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.json).to.have.been.calledWith({
        message: 'Product ID and user ID are required',
      })
    })
    it('Should return 400 if user ID is missing', async () => {
      delete req.user
      await cartController.addToCart(req, res)

      expect(res.status).to.be.calledOnceWith(400)
      expect(res.json).to.be.calledWith({ message: 'User ID is required' })
    })
    it('should return 400 if quantity is invalid', async () => {
      req.params = { productId: 'productId' }
      req.body = { quantity: 0 }
      req.user = { id: 123 }
      req.user = { userRole: 'buyer', id: 1 }
      await isAuthenticated(req, res, next)
      await checkPermission('buyer')(req, res, next)

      await addToCart(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.json).to.have.been.calledWith({ message: 'Invalid quantity' })
    })

    it('should return 404 if product is not found', async () => {
      req.params = { productId: 'productId' }
      req.body = { quantity: 1 }
      req.user = { userRole: 'buyer', id: 123 }
      await isAuthenticated(req, res, next)
      await checkPermission('buyer')(req, res, next)
      findByPkStub.resolves(null)

      await addToCart(req, res)

      expect(res.status).to.have.been.calledWith(404)
      expect(res.json).to.have.been.calledWith({ message: 'Product not found' })
    })
    it('should return 400 if product quantity is insufficient', async () => {
      req.params = { productId: 'productId' }
      req.body = { quantity: 10 }
      req.user = { userRole: 'buyer', id: 123 }
      await isAuthenticated(req, res, next)
      await checkPermission('buyer')(req, res, next)
      const product = {
        id: 'productId',
        name: 'Test Product',
        price: 10,
        quantity: 5,
        images: ['imageUrl'],
      }

      findByPkStub.resolves(product)

      await addToCart(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.json).to.have.been.calledWith({
        message: 'Product out of stock',
      })
    })

    it('should add product to cart successfully', async () => {
      req.params = { productId: 'productId' }
      req.body = { quantity: 1 }
      req.user = { userRole: 'buyer', id: 123 }
      await isAuthenticated(req, res, next)
      await checkPermission('buyer')(req, res, next)
      const product = {
        id: 'productId',
        name: 'Test Product',
        price: 10,
        quantity: 100,
        images: ['imageUrl'],
      }
      const cart = {
        id: 'a56eb4af-8194-413a-a487-d9884300c033',
        buyerId: 123,
        status: 'active',
        items: [] as CartItem[],
        totalPrice: 0,
        totalQuantity: 0,
      }

      findByPkStub.resolves(product)
      findOneStub.resolves(cart)
      updateStub.resolves([1, [cart]])

      await addToCart(req, res)

      expect(res.status).to.have.been.calledWith(201)
      expect(res.json).to.have.been.calledWith({
        message: 'Product added to cart successfully',
        cart,
      })
    })
    it('should return 400 if new quantity exceeds available stock', async () => {
      req.params = { productId: 'productId' }
      req.body = { quantity: 3 }
      req.user = { userRole: 'buyer', id: 123 }
      await isAuthenticated(req, res, next)
      await checkPermission('buyer')(req, res, next)
      const product = {
        id: 'productId',
        name: 'Test Product',
        price: 10,
        quantity: 5,
        images: ['imageUrl'],
      }
      const existingCart = {
        id: 'a56eb4af-8194-413a-a487-d9884300c033',
        buyerId: 123,
        status: 'active',
        items: [
          {
            productId: 'productId',
            name: 'Test Product',
            price: 10,
            quantity: 3,
            images: ['imageUrl'],
          },
        ],
        totalPrice: 30,
        totalQuantity: 3,
      }

      findByPkStub.resolves(product)
      findOneStub.resolves(existingCart)

      await cartController.addToCart(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.json).to.have.been.calledWith({
        message: 'Insufficient stock',
      })
    })

    it('should create a new cart if no active cart exists', async () => {
      req.params = { productId: 'productId' }
      req.body = { quantity: 1 }
      req.user = { userRole: 'buyer', id: 123 }
      await isAuthenticated(req, res, next)
      await checkPermission('buyer')(req, res, next)
      const product = {
        id: 'productId',
        name: 'Test Product',
        price: 10,
        quantity: 100,
        images: ['imageUrl'],
      }
      const newCart = {
        id: 'a56eb4af-8194-413a-a487-d9884300c033',
        buyerId: 123,
        items: [] as CartItem[],
        totalPrice: 10,
        totalQuantity: 1,
        status: 'active',
      }

      findByPkStub.resolves(product)
      findOneStub.resolves(null)
      createStub.resolves(newCart)

      await addToCart(req, res)

      expect(createStub).to.have.been.calledWith({
        buyerId: 123,
        items: [] as CartItem[],
        totalPrice: 10,
        totalQuantity: 1,
        status: 'active',
      })
      expect(res.status).to.have.been.calledWith(201)
      expect(res.json).to.have.been.calledWith({
        message: 'Product added to cart successfully',
        cart: newCart,
      })
    })
    it('should update existing cart item quantity if new quantity does not exceed stock', async () => {
      req.params = { productId: 'productId' }
      req.body = { quantity: 2 }
      req.user = { userRole: 'buyer', id: 123 }
      await isAuthenticated(req, res, next)
      await checkPermission('buyer')(req, res, next)
      const product = {
        id: 'productId',
        name: 'Test Product',
        price: 10,
        quantity: 10,
        images: ['imageUrl'],
      }
      const existingCart = {
        id: 'a56eb4af-8194-413a-a487-d9884300c033',
        buyerId: 123,
        status: 'active',
        items: [
          {
            productId: 'productId',
            name: 'Test Product',
            price: 10,
            quantity: 3,
            images: ['imageUrl'],
          },
        ],
        totalPrice: 30,
        totalQuantity: 3,
      }
      const updatedCart = {
        ...existingCart,
        items: [
          {
            productId: 'productId',
            name: 'Test Product',
            price: 10,
            quantity: 5,
            images: ['imageUrl'],
          },
        ],
        totalPrice: 50,
        totalQuantity: 5,
      }

      findByPkStub.resolves(product)
      findOneStub.resolves(existingCart)
      updateStub.resolves([1, [updatedCart]])

      await cartController.addToCart(req, res)

      expect(res.status).to.have.been.calledWith(201)
      expect(res.json).to.have.been.calledWith({
        message: 'Product added to cart successfully',
        cart: updatedCart,
      })
    })
  })
})

describe('viewCart new', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let sandbox: sinon.SinonSandbox
  let findCartStub: sinon.SinonStub
  let mockUser: any

  beforeEach(() => {
    req = {
      headers: {},
      query: {},
    } as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
      locals: {},
    } as unknown as Response
    next = sinon.spy()
    sandbox = sinon.createSandbox()
    findCartStub = sinon.stub(Cart, 'findOne')
    mockUser = { userRole: 'buyer', id: 1 }
    req.user = mockUser
  })

  afterEach(() => {
    sinon.restore()
    sandbox.restore()
  })

  it('Should return user cart if available', async () => {
    const mockedCart = { buyerId: 1, status: 'active', items: [] } as Cart
    findCartStub.resolves(mockedCart)
    await cartController.viewCart(req, res)

    expect(res.status).to.be.calledOnceWith(200)
    expect(res.json).to.be.calledWith({
      message: 'Cart retrived successfully',
      cart: mockedCart,
    })
  })

  it('Should return 400 if user ID is missing', async () => {
    delete req.user // Remove user object to simulate missing ID
    await cartController.viewCart(req, res)

    expect(res.status).to.be.calledOnceWith(400)
    expect(res.json).to.be.calledWith({ message: 'User ID is required' })
  })

  it('Should return 404 if cart not found', async () => {
    findCartStub.resolves(null)
    await cartController.viewCart(req, res)

    expect(res.status).to.be.calledOnceWith(404)
    expect(res.json).to.be.calledWith({ message: 'No Cart Found' })
  })

  it('Should return 500 on database error', async () => {
    findCartStub.throws(new Error('Database error'))
    await cartController.viewCart(req, res)

    expect(res.status).to.be.calledOnceWith(500)
    expect(res.json).to.be.calledWith({
      message: 'Internal server error',
      error: 'Database error',
    })
  })
})

describe("clearCart new", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;
  let sandbox: sinon.SinonSandbox;
  let findCartStub: sinon.SinonStub;
  let updateCartStub: sinon.SinonStub;
  let saveCartStub: sinon.SinonStub;
  let mockUser: any;

  beforeEach(() => {
    req = {
      headers: {},
      query: {},
    } as Request;
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
      locals: {},
    } as unknown as Response;
    next = sinon.spy();
    sandbox = sinon.createSandbox();
    findCartStub = sinon.stub(Cart, 'findOne');
    updateCartStub = sinon.stub(Cart, 'update');
    // saveCartStub = sinon.stub(Cart, 'save');
    mockUser = { userRole: 'buyer', id: 1 };
    req.user = mockUser;
  });

  afterEach(() => {
    sinon.restore();
    sandbox.restore();
  });

  it("Should return 400 if user ID is missing", async () => {
    delete req.user; 
    await cartController.clearCart(req, res);

    expect(res.status).to.be.calledOnceWith(400);
    expect(res.json).to.be.calledWith({ message: "User ID is required" });
  });

  it("Should return 404 if cart not found", async () => {
    findCartStub.resolves(null);
    await cartController.clearCart(req, res);

    expect(res.status).to.be.calledOnceWith(404);
    expect(res.json).to.be.calledWith({ message: "Cart not found" });
  });

  it("Should return 500 on database error", async () => {
    findCartStub.throws(new Error("Database error"));
    await cartController.clearCart(req, res);

    expect(res.status).to.be.calledOnceWith(500);
    expect(res.json).to.be.calledWith({ message: "Internal server error", error: "Database error" });
  });

 
  it("Should clear empty cart successfully", async () => {
    const mockedCart = { buyerId: 1, status: "active", items: [], totalPrice: 0, totalQuantity: 0 } as Cart;
    findCartStub.resolves(mockedCart);
    updateCartStub.resolves()

    await cartController.clearCart(req, res);

    expect(res.status).to.be.calledOnceWith(200);
    expect(res.json).to.be.calledWith({ message: "Cart cleared successfully" });
  });
  it("Should clear cart and return success message", async () => {
    const mockedCart = { buyerId: 1, status: "active", items: [], totalPrice: 0, totalQuantity: 0 } as Cart;
    findCartStub.resolves(mockedCart);
    const updatedCart = { buyerId: 1, status: "completed", items: [], totalPrice: 0, totalQuantity: 0 } as Cart;
  
    updateCartStub.resolves(updatedCart)
    await cartController.clearCart(req, res);
  
    expect(res.status).to.be.calledOnceWith(200);
    expect(res.json).to.be.calledWith({ message: "Cart cleared successfully" });
    expect(updateCartStub.calledOnce).to.be.true;
  });
});
