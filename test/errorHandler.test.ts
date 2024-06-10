import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { Request, Response, NextFunction } from 'express'
import {
  ErrorHandler,
  notFoundHandler,
  ErrorType,
} from '../src/utils/errorHandler'

chai.use(sinonChai)

describe('notFoundHandler', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let sandbox: sinon.SinonSandbox

  beforeEach(() => {
    req = {
      headers: {},
    } as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
      locals: {},
    } as unknown as Response
    next = sinon.spy()
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sinon.restore()
    sandbox.restore()
  })
  it('should respond with a 404 status and "Route does not exist" message', () => {
    req = {} as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response

    notFoundHandler(req, res)

    expect(res.status).to.be.called
    expect(res.status).to.be.calledWith(404)

    expect(res.json).to.be.calledOnce
    expect(res.json).to.be.calledWith('Route does not exist')
  })
})

describe('ErrorHandler', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let sandbox: sinon.SinonSandbox

  beforeEach(() => {
    req = {
      headers: {},
    } as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
      locals: {},
    } as unknown as Response
    next = sinon.spy()
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sinon.restore()
    sandbox.restore()
  })

  it('should respond with a 500 status and "Internal Server Error" message for generic errors', () => {
    const err = new Error('Some unexpected error happened')

    ErrorHandler(err, req, res, next)

    expect(res.status).to.be.called
    expect(res.status).to.be.calledWith(500)

    expect(res.json).to.be.calledOnce
    expect(res.json).to.be.calledWith({
      code: 500,
      message: 'Some unexpected error happened',
      error: err,
    })
  })

  it('should respond with the provided status code and message if available', () => {
    const err = new Error('Validation error') as ErrorType
    err.statusCode = 400
    err.message = 'Validation failed'

    ErrorHandler(err, req, res, next as unknown as NextFunction)
    expect(res.status).to.be.called
    expect(res.status).to.be.calledWith(400)

    expect(res.json).to.be.calledOnce
    expect(res.json).to.be.calledWith({
      code: 400,
      message: 'Validation failed',
      error: err,
    })
  })
})
