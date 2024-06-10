import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import express, { Request, Response, NextFunction } from 'express'
import Collection from '../src/database/models/collectionModel'
import productController from '../src/controllers/productController'
import eventEmitter from '../src/services/notificationServices'
chai.use(sinonChai)

const createCollection = productController.createCollection

describe('ProductController', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let findOneStub: sinon.SinonStub
  let createStub: sinon.SinonStub
  let eventEmitterSpy: sinon.SinonSpy

  beforeEach(() => {
    req = express.request as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response
    next = sinon.spy()
    findOneStub = sinon.stub(Collection, 'findOne')
    createStub = sinon.stub(Collection, 'create')
    eventEmitterSpy = sinon.spy(eventEmitter, 'emit')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should create collection successfully', async () => {
    req.body = {
      name: 'Test Collection',
      description: 'Test Description',
    }
    req.user = { id: 123 }

    const createdCollection = {
      id: 'collectionId',
      name: 'Test Collection',
      description: 'Test Description',
      sellerId: 123,
    }
    findOneStub.resolves(null)
    createStub.resolves(createdCollection)

    await createCollection(req, res)

    expect(createStub).to.have.been.calledWith({
      name: 'Test Collection',
      description: 'Test Description',
      sellerId: 123,
    })
    expect(eventEmitterSpy).to.have.been.calledWith(
      'collection:created',
      createdCollection,
    )
    expect(res.status).to.have.been.calledWith(201)
    expect(res.json).to.have.been.calledWith({
      message: 'Collection created successfully',
      collection: createdCollection,
    })
  })
})
