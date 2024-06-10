import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import cloudinary from 'cloudinary'
import moment from 'moment'
import express, { Request, Response, NextFunction } from 'express'
import Product from '../src/database/models/productModel'
import Collection from '../src/database/models/collectionModel'
import productController from '../src/controllers/productController'
import isAuthenticated, {
  checkPermission,
  excludePermission,
} from '../src/middlewares/authenticationMiddleware'

chai.use(sinonChai)

import { eventEmitter } from '../src/services/notificationServices'
chai.use(sinonChai)

const addProduct = productController.addProduct

describe('addProduct', function addProductTest() {
  this.timeout(60000)

  let req: Partial<Request>
  let res: Partial<Response>
  let findOneStub: sinon.SinonStub
  let findByPkStub: sinon.SinonStub
  let createStub: sinon.SinonStub
  let uploadStub: sinon.SinonStub
  let eventEmitterSpy: sinon.SinonSpy

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      files: [],
      user: {},
    }
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    }
    findOneStub = sinon.stub(Product, 'findOne')
    findByPkStub = sinon.stub(Collection, 'findByPk')
    createStub = sinon.stub(Product, 'create')
    uploadStub = sinon.stub(cloudinary.v2.uploader, 'upload')
    eventEmitterSpy = sinon.spy(eventEmitter, 'emit')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should add product successfully', async () => {
    req.body = {
      name: 'Test Product',
      price: 10,
      category: 'category',
      bonus: '10',
      sku: '456sku',
      quantity: 'quantity',
      expiryDate: '25-12-2027',
    }
    req.params = { id: 'collectionId' }
    req.files = [
      { path: 'imagePath1' },
      { path: 'imagePath2' },
      { path: 'imagePath3' },
      { path: 'imagePath4' },
    ] as Express.Multer.File[]
    req.user = { id: 123 }

    findOneStub.resolves(null)
    findByPkStub.resolves({ id: 'collectionId' })
    uploadStub.resolves({ secure_url: 'imageUrl' })
    createStub.resolves({
      id: 1,
      name: 'Test Product',
      price: 10,
      category: 'category',
      bonus: '10',
      sku: '456sku',
      quantity: 'quantity',
      expiryDate: '25-12-2027',
      images: ['imageUrl', 'imageUrl', 'imageUrl', 'imageUrl'],
      sellerId: 123,
    })

    await addProduct(req as Request, res as Response)

    expect(createStub).to.have.been.calledWith({
      name: 'Test Product',
      price: 10,
      category: 'category',
      collectionId: 'collectionId',
      bonus: '10',
      sku: '456sku',
      quantity: 'quantity',
      images: ['imageUrl', 'imageUrl', 'imageUrl', 'imageUrl'],
      expiryDate: '25-12-2027',
      sellerId: 123,
    })
    expect(eventEmitterSpy).to.have.been.calledWith('product:created')
    expect(res.status).to.have.been.calledWith(201)
    expect(res.json).to.have.been.calledWith({
      message: 'Product added successfully',
    })
  })

  it('should return 409 if product already exists', async () => {
    req.body = {
      name: 'Test Product',
      price: 10,
      category: 'category',
      bonus: '10',
      sku: '456sku',
      quantity: 'quantity',
      expiryDate: '25-12-2027',
    }
    req.params = { id: 'collectionId' }
    req.user = { id: 123 }

    findOneStub.resolves({ name: 'Test Product' })
    findByPkStub.resolves({ id: 'collectionId' })

    await addProduct(req as Request, res as Response)

    expect(res.status).to.have.been.calledWith(409)
    expect(res.json).to.have.been.calledWith({
      message: 'Product exists, please update your stock',
    })
  })

  it('should return 404 if collection does not exist', async () => {
    req.body = {
      name: 'Test Product',
      price: 10,
      category: 'category',
      bonus: '10',
      sku: '456sku',
      quantity: 'quantity',
      expiryDate: '25-12-2027',
    }
    req.params = { id: 'collectionId' }
    req.user = { id: 123 }

    findByPkStub.resolves(null)

    await addProduct(req as Request, res as Response)

    expect(res.status).to.have.been.calledWith(404)
    expect(res.json).to.have.been.calledWith({
      message: 'Collection not found',
    })
  })

  it('should return 400 if no images are provided', async () => {
    req.body = {
      name: 'Test Product',
      price: 10,
      category: 'category',
      bonus: '10',
      sku: '456sku',
      quantity: 'quantity',
      expiryDate: '25-12-2027',
    }
    req.params = { id: 'collectionId' }
    req.user = { id: 123 }
    req.files = []

    findByPkStub.resolves({ id: 'collectionId' })

    await addProduct(req as Request, res as Response)

    expect(res.status).to.have.been.calledWith(400)
    expect(res.json).to.have.been.calledWith({
      message: 'Images are required',
    })
  })

  it('should return 400 if fewer than 4 images are provided', async () => {
    req.body = {
      name: 'Test Product',
      price: 10,
      category: 'category',
      bonus: '10',
      sku: '456sku',
      quantity: 'quantity',
      expiryDate: '25-12-2027',
    }
    req.params = { id: 'collectionId' }
    req.user = { id: 123 }
    req.files = [
      { path: 'imagePath1' },
      { path: 'imagePath2' },
      { path: 'imagePath3' },
    ] as Express.Multer.File[]

    findByPkStub.resolves({ id: 'collectionId' })

    await addProduct(req as Request, res as Response)

    expect(res.status).to.have.been.calledWith(400)
    expect(res.json).to.have.been.calledWith({
      message: 'Please upload 4 to 8 images',
    })
  })

  it('should return 400 if more than 8 images are provided', async () => {
    req.body = {
      name: 'Test Product',
      price: 10,
      category: 'category',
      bonus: '10',
      sku: '456sku',
      quantity: 'quantity',
      expiryDate: '25-12-2027',
    }
    req.params = { id: 'collectionId' }
    req.user = { id: 123 }
    req.files = [
      { path: 'imagePath1' },
      { path: 'imagePath2' },
      { path: 'imagePath3' },
      { path: 'imagePath4' },
      { path: 'imagePath5' },
      { path: 'imagePath6' },
      { path: 'imagePath7' },
      { path: 'imagePath8' },
      { path: 'imagePath9' },
    ] as Express.Multer.File[]

    findByPkStub.resolves({ id: 'collectionId' })

    await addProduct(req as Request, res as Response)

    expect(res.status).to.have.been.calledWith(400)
    expect(res.json).to.have.been.calledWith({
      message: 'Please upload 4 to 8 images',
    })
  })

  it('should handle errors during product creation', async () => {
    req.body = {
      name: 'Test Product',
      price: 10,
      category: 'category',
      bonus: '10',
      sku: '456sku',
      quantity: 'quantity',
      expiryDate: '25-12-2027',
    }
    req.params = { id: 'collectionId' }
    req.files = [
      { path: 'imagePath1' },
      { path: 'imagePath2' },
      { path: 'imagePath3' },
      { path: 'imagePath4' },
    ] as Express.Multer.File[]
    req.user = { id: 123 }

    findOneStub.resolves(null)
    findByPkStub.resolves({ id: 'collectionId' })
    uploadStub.resolves({ secure_url: 'imageUrl' })
    createStub.rejects(new Error('Creation error'))
    await addProduct(req as Request, res as Response)

    expect(res.status).to.have.been.calledWith(500)
    expect(res.json).to.have.been.calledWith({
      message: 'Internal server error',
    })
  })
})

// ==========================================================================================================================================

describe('List Products', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let sandbox: sinon.SinonSandbox
  let findOneStub: sinon.SinonStub
  let findAllStub: sinon.SinonStub
  let findCollectionStub: sinon.SinonStub
  let momentStub: sinon.SinonStub

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
    findOneStub = sinon.stub(Product, 'findOne')
    findAllStub = sinon.stub(Product, 'findAll')
    findCollectionStub = sinon.stub(Collection, 'findOne')
    momentStub = sinon.stub(moment, 'defaultFormat')
  })

  afterEach(() => {
    sinon.restore()
    sandbox.restore()
  })
  it('should get all products for a buyer using default limit and page', async () => {
    const page = ''
    const limit = ''
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.user = { userRole: 'buyer', id: 1 }
    await isAuthenticated(req, res, next)
    await excludePermission('seller')(req, res, next)
    const currentDate = moment().format('YYYY-MM-DD HH:mm:ssZ')
    const mockProducts = [{} as Product, {} as Product, {} as Product]

    findAllStub.resolves(mockProducts)

    await productController.listProducts(req, res)

    expect(res.status).to.be.calledWith(200)
    expect(res.json).to.be.calledWith({
      message: 'Products retrieved successfully',
      products: mockProducts,
      pagination: { page: 1, limit: 5, totalPages: 1 },
    })
  })

  it('should get all products for admin', async () => {
    const page = 1
    const limit = 1
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.user = { userRole: 'admin', id: 1 }
    await isAuthenticated(req, res, next)
    await excludePermission('seller')(req, res, next)
    const currentDate = moment().format('YYYY-MM-DD HH:mm:ssZ')
    const mockProducts = [{} as Product, {} as Product, {} as Product]

    findAllStub.resolves(mockProducts)

    await productController.listProducts(req, res)

    expect(res.status).to.be.calledWith(200)
    expect(res.json).to.be.calledWith({
      message: 'Products retrieved successfully',
      products: mockProducts,
      pagination: { page, limit, totalPages: 3 },
    })
  })

  it('should get all products for a buyer', async () => {
    const page = 1
    const limit = 1
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.user = { userRole: 'buyer', id: 1 }
    await isAuthenticated(req, res, next)
    await excludePermission('seller')(req, res, next)
    const currentDate = moment().format('YYYY-MM-DD HH:mm:ssZ')
    const mockProducts = [{} as Product, {} as Product, {} as Product]

    findAllStub.resolves(mockProducts)

    await productController.listProducts(req, res)

    expect(res.status).to.be.calledWith(200)
    expect(res.json).to.be.calledWith({
      message: 'Products retrieved successfully',
      products: mockProducts,
      pagination: { page, limit, totalPages: 3 },
    })
  })

  it('----should return 500 if collection brings error', async () => {
    const page = 1
    const limit = 1
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.user = { userRole: 'buyer', id: 1 }
    await isAuthenticated(req, res, next)
    await excludePermission('seller')(req, res, next)
    findCollectionStub.returns(new Error('This error'))
    findAllStub.returns([])

    await productController.listProducts(req, res)

    expect(res.status).to.be.calledWith(500)
    expect(res.json).to.be.called
  })

  it('new should return 500 if error occurs', async () => {
    const page = 1
    const limit = 1
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.user = { userRole: 'buyer', id: 1 }
    const thisError = new Error('Error occured')

    findCollectionStub.resolves({})
    findAllStub.resolves(thisError)
    await isAuthenticated(req, res, next)
    await excludePermission('seller')(req, res, next)
    await productController.listProducts(req, res)

    expect(res.status).to.be.calledWith(500)
    expect(res.json).to.be.called
  })

  it('should return 500 if error', async () => {
    const page = 1
    const limit = 1
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.user = { userRole: 'buyer', id: 1 }
    const thisError = new Error('Error occured')

    findAllStub.rejects(new Error('Unexpected error fetching products'))

    await productController.listProducts(req, res)

    expect(res.status).to.be.called
    expect(res.json).to.be.calledWith({
      message: 'Internal server error',
      error: 'Unexpected error fetching products',
    })
  })

  it('should return 400 for invalid page or limit parameter (buyer)', async () => {
    const page = -10
    const limit = -21
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.user = { userRole: 'buyer', id: 1 }
    await isAuthenticated(req, res, next)
    await excludePermission('seller')(req, res, next)
    await productController.listProducts(req, res)

    expect(res.status).to.be.calledWith(400)
    expect(res.json).to.be.calledWith({
      message: 'Invalid pagination parameters',
    })
  })
})

describe('List products from a collection', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let sandbox: sinon.SinonSandbox
  let findOneStub: sinon.SinonStub
  let findAllStub: sinon.SinonStub
  let findCollectionStub: sinon.SinonStub
  let momentStub: sinon.SinonStub

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
    findOneStub = sinon.stub(Product, 'findOne')
    findAllStub = sinon.stub(Product, 'findAll')
    findCollectionStub = sinon.stub(Collection, 'findOne')
    momentStub = sinon.stub(moment, 'defaultFormat')
  })

  afterEach(() => {
    sinon.restore()
    sandbox.restore()
  })

  it('should get products from a sellers collection using default limit and page', async () => {
    const page = ''
    const limit = ''
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.params = { collectionId: 'f3692b5b-446f-4adc-ac5f-c6a640947d84' }
    req.user = { userRole: 'seller', id: 1 }
    await isAuthenticated(req, res, next)
    await checkPermission('seller')(req, res, next)

    const currentDate = moment().format('YYYY-MM-DD HH:mm:ssZ')
    const mockProducts = [
      {} as Product,
      {} as Product,
      {} as Product,
      {} as Product,
      {} as Product,
    ]

    findCollectionStub.resolves({})
    findAllStub.resolves(mockProducts)

    await productController.listCollectionProducts(req, res)

    expect(res.status).to.be.called
    expect(res.json).to.be.calledWith({
      message: 'Products in collection retrieved successfully',
      products: mockProducts,
      pagination: { page: 1, limit: 5, totalPages: 1 },
    })
  })
  it('should get products from a sellers collection', async () => {
    const page = 1
    const limit = 1
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.params = { collectionId: 'f3692b5b-446f-4adc-ac5f-c6a640947d84' }
    req.user = { userRole: 'seller', id: 1 }
    await isAuthenticated(req, res, next)
    await checkPermission('seller')(req, res, next)

    const currentDate = moment().format('YYYY-MM-DD HH:mm:ssZ')
    const mockProducts = [{} as Product, {} as Product, {} as Product]

    findCollectionStub.resolves({})
    findAllStub.resolves(mockProducts)

    await productController.listCollectionProducts(req, res)

    expect(res.status).to.be.calledWith(200)
    expect(res.json).to.be.calledWith({
      message: 'Products in collection retrieved successfully',
      products: mockProducts,
      pagination: { page, limit, totalPages: 3 },
    })
  })

  it('should return 400 if seller has no collection', async () => {
    const page = 1
    const limit = 1
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.params = { collectionId: 'f3692b5b-446f-4adc-ac5f-c6a640947d84' }
    req.user = { userRole: 'seller', id: 1 }
    await isAuthenticated(req, res, next)
    await checkPermission('seller')(req, res, next)

    findCollectionStub.resolves(null)

    await productController.listCollectionProducts(req, res)

    expect(res.status).to.be.calledWith(400)
    expect(res.json).to.be.calledWith({
      message: 'Invalid collection id',
    })
  })

  it('----should return 500 if collection brings error', async () => {
    const page = 1
    const limit = 1
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.params = { collectionId: 'f3692b5b-446f-4adc-ac5f-c6a640947d84' }
    req.user = { userRole: 'seller', id: 1 }
    await isAuthenticated(req, res, next)
    await checkPermission('seller')(req, res, next)

    findCollectionStub.returns(new Error('This error'))
    findAllStub.returns([])

    await productController.listCollectionProducts(req, res)

    expect(res.status).to.be.calledWith(500)
    expect(res.json).to.be.called
  })

  it('new should return 500 if error occurs', async () => {
    const page = 1
    const limit = 1
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.params = { collectionId: 'f3692b5b-446f-4adc-ac5f-c6a640947d84' }
    req.user = { userRole: 'seller', id: 1 }
    const thisError = new Error('Error occured')

    findCollectionStub.resolves({})
    findAllStub.resolves(thisError)

    await isAuthenticated(req, res, next)
    await checkPermission('seller')(req, res, next)
    await productController.listCollectionProducts(req, res)

    expect(res.status).to.have.been.called
    expect(res.json).to.have.been.called
  })

  it('should return errom and error message', async () => {
    const page = 1
    const limit = 1
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.params = { collectionId: 'f3692b5b-446f-4adc-ac5f-c6a640947d84' }
    req.user = { userRole: 'seller', id: 1 }
    const thisError = new Error('Error occured')

    findCollectionStub.throws(new Error('Error finding collection'))

    await productController.listCollectionProducts(req, res)

    expect(res.status).to.be.calledWith(500)
    expect(res.json).to.be.calledWith({
      message: 'Internal server error',
      error: 'Error finding collection',
    })
  })

  it('should return 400 for invalid page or limit parameter (buyer)', async () => {
    const page = -10
    const limit = -21
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.params = { collectionId: 'f3692b5b-446f-4adc-ac5f-c6a640947d84' }
    req.user = { userRole: 'seller', id: 1 }

    await isAuthenticated(req, res, next)
    await checkPermission('seller')(req, res, next)
    await productController.listCollectionProducts(req, res)

    expect(res.status).to.be.calledWith(400)
    expect(res.json).to.be.calledWith({
      message: 'Invalid pagination parameters',
    })
  })
})


describe('List Collections', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let sandbox: sinon.SinonSandbox
  let findCollectionStub: sinon.SinonStub

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
    findCollectionStub = sinon.stub(Collection, 'findAll')

  })

  afterEach(() => {
    sinon.restore()
    sandbox.restore()
  })

  it('should get collections of a seller using default limit and page', async () => {
    const page = ''
    const limit = ''
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.params = { collectionId: 'f3692b5b-446f-4adc-ac5f-c6a640947d84' }
    req.user = { userRole: 'seller', id: 1 }
    // await isAuthenticated(req, res, next)
    // await checkPermission('seller')(req, res, next)

    const mockCollections = [
      {} as Collection,
      {} as Collection,
      {} as Collection,
    ]

    findCollectionStub.resolves(mockCollections)

    await productController.listAllCollections(req, res)

    expect(res.status).to.be.called
    expect(res.json).to.be.calledWith({
      message: 'Collections retrieved successfully',
      collections: mockCollections,
      pagination: { page: 1, limit: 5, totalPages: 1 },
    })
  })
  it('should get products from a sellers collection', async () => {
    const page = 1
    const limit = 1
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    const mockCollections = [
      {} as Collection,
      {} as Collection,
      {} as Collection,
    ]

    req.params = { collectionId: 'f3692b5b-446f-4adc-ac5f-c6a640947d84' }
    req.user = { userRole: 'seller', id: 1 }

    // await isAuthenticated(req, res, next)
    // await checkPermission('seller')(req, res, next)

    findCollectionStub.resolves(mockCollections)

    await productController.listAllCollections(req, res)

    expect(res.status).to.be.called
    expect(res.json).to.be.calledWith({
      message: 'Collections retrieved successfully',
      collections: mockCollections,
      pagination: { page: 1, limit: 1, totalPages: 3 },
    })
  })

  it('should return 400 if seller has no collection', async () => {
    const page = 1
    const limit = 1
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.params = { collectionId: 'f3692b5b-446f-4adc-ac5f-c6a640947d84' }
    req.user = { userRole: 'seller', id: 1 }
    await isAuthenticated(req, res, next)
    await checkPermission('seller')(req, res, next)

    findCollectionStub.resolves(null)

    await productController.listAllCollections(req, res)

    expect(res.status).to.be.calledWith(400)
    expect(res.json).to.be.calledWith({
      message: 'No collections available',
    })
  })

  it('should return 500 if collection brings error', async () => {
    const page = 1
    const limit = 1
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.params = { collectionId: 'f3692b5b-446f-4adc-ac5f-c6a640947d84' }
    req.user = { userRole: 'seller', id: 1 }
    await isAuthenticated(req, res, next)
    await checkPermission('seller')(req, res, next)

    findCollectionStub.returns(new Error('This error'))

    await productController.listAllCollections(req, res)

    expect(res.status).to.be.calledWith(500)
    expect(res.json).to.be.called
  })


  it('should return error and error message', async () => {
    const page = 1
    const limit = 1
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.params = { collectionId: 'f3692b5b-446f-4adc-ac5f-c6a640947d84' }
    req.user = { userRole: 'seller', id: 1 }
    const thisError = new Error('Error occured')

    findCollectionStub.throws(new Error('Error finding collection'))

    await productController.listAllCollections(req, res)

    expect(res.status).to.be.calledWith(500)
    expect(res.json).to.be.calledWith({
      message: 'Internal server error',
      error: 'Error finding collection',
    })
  })

  it('should return 400 for invalid page or limit parameter', async () => {
    const page = -10
    const limit = -21
    req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { page, limit },
    } as unknown as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    req.params = { collectionId: 'f3692b5b-446f-4adc-ac5f-c6a640947d84' }
    req.user = { userRole: 'seller', id: 1 }

    await isAuthenticated(req, res, next)
    await checkPermission('seller')(req, res, next)
    await productController.listAllCollections(req, res)

    expect(res.status).to.be.calledWith(400)
    expect(res.json).to.be.calledWith({
      message: 'Invalid pagination parameters',
    })
  })
})
