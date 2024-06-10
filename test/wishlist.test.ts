import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import express, { Request, Response, NextFunction } from 'express'
import Product from '../src/database/models/productModel'
import Wishlist, { wishlistProduct } from '../src/database/models/wishlistModel'
import WishlistController from '../src/controllers/wishlistController'

chai.use(sinonChai)

const addToWishlist = WishlistController.addToWishlist
const getWishlist = WishlistController.getWishlist
const deleteFromWishlist = WishlistController.deleteFromWishlist

describe('WishlistController', function wishListTest() {
  this.timeout(60000)

  let req: Request
  let res: Response
  let next: NextFunction
  let findByPkStub: sinon.SinonStub
  let findOneStub: sinon.SinonStub
  let createStub: sinon.SinonStub
  let findAllStub: sinon.SinonStub
  let updateStub: sinon.SinonStub

  beforeEach(() => {
    req = express.request as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response
    next = sinon.spy()
    findByPkStub = sinon.stub(Product, 'findByPk')
    findOneStub = sinon.stub(Wishlist, 'findOne')
    createStub = sinon.stub(Wishlist, 'create')
    findAllStub = sinon.stub(Wishlist, 'findAll')
    updateStub = sinon.stub(Wishlist.prototype, 'update')
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('addToWishlist', () => {
    it('should return 400 if productId or buyerId is missing', async () => {
      req.params = {}

      await addToWishlist(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.json).to.have.been.calledWith({
        message: 'Product ID and user ID are required',
      })
    })

    it('should return 404 if product not found', async () => {
      req.params = { productId: '1' }
      req.user = { id: 123 }

      findByPkStub.resolves(null)

      await addToWishlist(req, res)

      expect(res.status).to.have.been.calledWith(404)
      expect(res.json).to.have.been.calledWith({ message: 'Product not found' })
    })
    it('should return 400 if buyerId is not provided', async () => {
      req.params = { productId: '1' }
      req.user = null

      await addToWishlist(req, res)

      expect(findByPkStub).not.to.have.been.called
      expect(findOneStub).not.to.have.been.called
      expect(createStub).not.to.have.been.called
      expect(res.status).to.have.been.calledWith(400)
      expect(res.json).to.have.been.calledWith({
        message: 'Product ID and user ID are required',
      })
    })
    it('should return 400 if product already exists in wishlist', async () => {
      req.params = { productId: '1' }
      req.user = { id: 123 }

      const product = {
        id: '1',
        name: 'Product',
        price: 100,
        images: ['imageUrl'],
      }

      const wishlist = {
        products: [
          { productId: '1', name: 'Product', price: 100, images: ['imageUrl'] },
        ],
      }

      findByPkStub.resolves(product)
      findOneStub.resolves(wishlist)

      await addToWishlist(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.json).to.have.been.calledWith({
        message: 'Product already in wishlist',
      })
    })

    it('should add product to wishlist successfully', async () => {
      const productId = '1'
      const buyerId = 123
      const product = {
        id: productId,
        name: 'Product',
        price: 100,
        images: ['imageUrl'],
      }

      req.params = { productId }
      req.user = { id: buyerId }
      findByPkStub.resolves(product)

      findOneStub.resolves(null)

      const newWishlist = {
        id: 'wishlistId',
        buyerId,
        products: [
          {
            productId,
            name: product.name,
            price: product.price,
            images: product.images,
          },
        ],
      }

      createStub.resolves(newWishlist)

      await addToWishlist(req, res)

      expect(createStub).to.have.been.calledWith({
        buyerId,
        products: newWishlist.products,
      })
      expect(res.status).to.have.been.calledWith(201)
      expect(res.json).to.have.been.calledWith({
        message: 'Product added to wishlist successfully',
        wishlist: newWishlist,
      })

      const existingWishlist = {
        id: 'existingWishlistId',
        buyerId,
        products: [
          {
            productId: '2',
            name: 'Existing Product',
            price: 50,
            images: ['existingUrl'],
          },
        ],
        save: sinon.stub().resolves(),
      }

      findOneStub.resolves(existingWishlist)

      const updatedWishlist = {
        ...existingWishlist,
        products: [
          ...existingWishlist.products,
          {
            productId,
            name: product.name,
            price: product.price,
            images: product.images,
          },
        ],
      }

      await addToWishlist(req, res)

      expect(existingWishlist.save).to.have.been.called
      expect(res.status).to.have.been.calledWith(201)
      expect(res.json).to.have.been.calledWith({
        message: 'Product added to wishlist successfully',
        wishlist: updatedWishlist,
      })
    })
  })

  describe('getWishlist', () => {
    it('should return 404 if no products in wishlist', async () => {
      req.user = { id: 123 }

      findOneStub.resolves([])

      await getWishlist(req, res)

      expect(res.status).to.have.been.calledWith(404)
      expect(res.json).to.have.been.calledWith({
        message: 'No product in wishlist',
      })
    })
    it('should return 400 if buyerId is not provided', async () => {
      req.user = null

      await getWishlist(req, res)

      expect(findOneStub).not.to.have.been.called

      expect(res.status).to.have.been.calledWith(400)
      expect(res.json).to.have.been.calledWith({
        message: 'User ID are required',
      })
    })

    it('should return wishlist successfully', async () => {
      req.user = { id: 123 }

      findAllStub.resolves([
        {
          id: 'wishlistId',
          productId: '1',
          buyerId: 'buyerId',
          Product: { name: 'Product', price: 100, images: ['imageUrl'] },
        },
      ])

      await getWishlist(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.json).to.have.been.calledWith([
        {
          id: 'wishlistId',
          productId: '1',
          buyerId: 'buyerId',
          Product: { name: 'Product', price: 100, images: ['imageUrl'] },
        },
      ])
    })
  })
  describe('deleteFromWishlist', () => {
    it('should return 404 if wishlist not found', async () => {
      req.params = { productId: 'productId' }
      req.user = { id: 123 }

      findOneStub.resolves(null)

      await deleteFromWishlist(req, res)

      expect(res.status).to.have.been.calledWith(404)
      expect(res.json).to.have.been.calledWith({
        message: 'Wishlist not found',
      })
    })
    it('should return 400 if buyerId is not provided', async () => {
      req.params = { productId: '1' }
      req.user = null

      await deleteFromWishlist(req, res)

      expect(findOneStub).not.to.have.been.called
      expect(updateStub).not.to.have.been.called
      expect(res.status).to.have.been.calledWith(400)
      expect(res.json).to.have.been.calledWith({
        message: 'Product ID and user ID are required',
      })
    })

    it('should return 404 if product is not found in wishlist', async () => {
      const productId = '1'
      const buyerId = 123
      const wishlist = {
        id: '1',
        buyerId,
        products: [{ productId: '2' }],
        save: sinon.stub().resolves(),
      }

      req.params = { productId }
      req.user = { id: buyerId }
      findOneStub.resolves(wishlist)

      await deleteFromWishlist(req, res)

      expect(wishlist.save).not.to.have.been.called
      expect(res.status).to.have.been.calledWith(404)
      expect(res.json).to.have.been.calledWith({
        message: 'Product not found in wishlist',
      })
    })
    it('should delete product from wishlist successfully', async () => {
      const productId = '1'
      const buyerId = 123
      const wishlist = {
        id: '3a19c24f-2e4e-48e2-a7c4-79af0c357679',
        buyerId,
        products: [{ productId }],
      }

      req.params = { productId }
      req.user = { id: buyerId }
      findOneStub.resolves(wishlist)

      const updatedProducts = [] as wishlistProduct[]
      updateStub.resolves([1])

      await deleteFromWishlist(req, res)
      expect(res.status).to.have.been.calledWith(200)
      expect(res.json).to.have.been.calledWith({
        message: 'Product removed from wishlist successfully',
        updatedWishlist: {
          ...wishlist,
          products: updatedProducts,
        },
      })
    })
  })
})
