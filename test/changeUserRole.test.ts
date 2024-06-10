import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import jwt from 'jsonwebtoken'
import express, { Request, Response, NextFunction } from 'express'
import User from '../src/database/models/userModel'
import UserController from '../src/controllers/UserController'
import isAuthenticated, {
  checkPermission,
} from '../src/middlewares/authenticationMiddleware'

chai.use(sinonChai)

const changeUserRole = UserController.changeUserRole
describe('changeUserRole', () => {
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
      send: sinon.stub(),
      locals: {},
    } as unknown as Response
    next = sinon.spy()
    findOneStub = sinon.stub(User, 'findOne')
    updateStub = sinon.stub()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should return 400 if userId or newRole is missing', async () => {
    req.params = { userId: '1' }
    req.body = {}
    req.headers.authorization = 'Bearer valid_token'
    req.user = { userRole: 'admin' }
    await isAuthenticated(req, res, next)
    await checkPermission('admin')(req, res, next)

    await changeUserRole(req, res)

    expect(res.status).to.have.been.calledWith(400)
    expect(res.json).to.have.been.calledWith({ message: 'Bad request' })
  })

  it('should update the user role and return 201', async () => {
    const existingUser = { id: 1, update: updateStub }
    req.params = { userId: '1' }
    req.body = { newRole: 'seller' }
    req.headers.authorization = 'Bearer valid_token'
    req.user = { userRole: 'admin' }
    await isAuthenticated(req, res, next)
    await checkPermission('admin')(req, res, next)
    findOneStub.resolves(existingUser)

    await changeUserRole(req, res)

    expect(findOneStub).to.have.been.called
    expect(updateStub).to.have.been.calledWith({ userRole: 'seller' })
    expect(res.status).to.have.been.calledWith(200)
    expect(res.json).to.have.been.calledWith({
      message: 'User role has been updated.',
      existingUser,
    })
  })

  it('should return 404 if the user is not found', async () => {
    req.params = { userId: '1' }
    req.body = { newRole: 'admin' }
    findOneStub.resolves(null)

    await isAuthenticated(req, res, next)
    await checkPermission('admin')(req, res, next)

    await changeUserRole(req, res)

    expect(findOneStub).to.have.been.called
    expect(res.status).to.have.been.calledWith(404)
    expect(res.json).to.have.been.calledWith({ message: 'User not found' })
  })

  it('should return 400 if userId or newRole is missing', async () => {
    req.params = { userId: '1' }
    req.body = {}

    req.headers.authorization = 'Bearer valid_token'
    req.user = { userRole: 'admin' }
    await isAuthenticated(req, res, next)
    await checkPermission('admin')(req, res, next)

    await changeUserRole(req, res)

    expect(res.status).to.have.been.calledWith(400)
    expect(res.json).to.have.been.calledWith({ message: 'Bad request' })
  })

  it('should return 400 if the provided newRole is invalid', async () => {
    req.params = { userId: '1' }
    req.body = { newRole: 'invalid-role' }
    req.headers.authorization = 'Bearer valid_token'
    req.user = { userRole: 'admin' }
    await isAuthenticated(req, res, next)
    await checkPermission('admin')(req, res, next)

    try {
      await changeUserRole(req, res)
    } catch (err) {
      expect(err).to.be.an.instanceOf(Error)
      expect(err.message).to.equal('Invalid user role invalid-role')
    }
  })



  it('should return 401 if no token is found', async () => {
    req.headers.authorization = undefined

    await isAuthenticated(req, res, next)

    expect(res.status).to.have.been.calledWith(401)
    expect(res.json).to.have.been.calledWith({
      message: 'Please Login',
    })
    expect(next).to.not.have.been.called
  })

  it('should return 401 if token is invalid', async () => {
    sinon
      .stub(jwt, 'verify')
      .callsFake(() => {})
      .returns(null)

    await isAuthenticated(req, res, next)

    expect(res.status).to.have.been.calledWith(401)
    expect(res.json).to.have.been.calledWith({
      message: 'Please Login',
    })
    expect(next).to.not.have.been.called
  })

  it('should return 500 if an internal error occurs', async () => {
    sinon
      .stub(jwt, 'verify')
      .callsFake(() => {})
      .returns(null)

    sinon.stub(console, 'error').callsFake(() => {})

    await isAuthenticated(req, res, next)

    expect(res.status).to.have.been.calledWith(401)
    expect(res.json).to.have.been.calledWith({
      message: 'Please Login',
    })
    expect(next).to.not.have.been.called
  })

  it('should handle errors', async () => {
    req.params = { userId: '1' }
    req.body = { newRole: 'buyer' }

    req.headers.authorization = 'Bearer valid_token'
    req.user = { id: 1, email: 'test@example.com', userRole: 'admin' }
    findOneStub.resolves({
      id: 1,
      email: 'test@example.com',
      userRole: 'admin',
    })

    updateStub.throws(new Error('Error Occured'))
    await changeUserRole(req, res)

    expect(res.status).to.have.been.calledWith(400)
    expect(res.json).to.have.been.called
  })

  it('if no role was given', async () => {
    req.params = { userId: '1' }
    req.body = {}

    req.headers.authorization = 'Bearer valid_token'
    req.user = { id: 1, email: 'test@example.com', userRole: 'admin' }
    findOneStub.resolves({
      id: 1,
      email: 'test@example.com',
      userRole: 'admin',
    })

    updateStub.throws(new Error('Error Occured'))
    await changeUserRole(req, res)

    expect(res.status).to.have.been.calledWith(400)
    expect(res.json).to.have.been.calledWith({ message: 'Bad request' })
  })

  it('if invalid role role was given', async () => {
    const newRole = 'invalid'
    req.params = { userId: '1' }
    req.body = { newRole }

    req.headers.authorization = 'Bearer valid_token'
    req.user = { id: 1, email: 'test@example.com', userRole: 'admin' }
    findOneStub.resolves({
      id: 1,
      email: 'test@example.com',
      userRole: 'admin',
    })

    updateStub.throws(new Error('Error Occured'))
    await changeUserRole(req, res)

    expect(res.status).to.have.been.calledWith(400)
    expect(res.json).to.be.have.been.called
  })
})

describe('checkPermission function', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let findOneStub: sinon.SinonStub
  let sandbox: sinon.SinonSandbox

  beforeEach(() => {
    req = express.request as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
      send: sinon.stub(),
      locals: {},
      user: { id: 1 },
    } as unknown as Response
    next = sinon.spy()
    findOneStub = sinon.stub(User, 'findOne')
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sinon.restore()
    sandbox.restore()
  })

  it('should call next() if user role matches required role', async () => {
    req = { user: { id: 1, userRole: 'admin' } } as Request

    findOneStub.resolves({ id: 1, userRole: 'admin' })

    const middleware = checkPermission('admin')
    await middleware(req, res, next)

    expect(findOneStub).to.be.calledOnce
    expect(next).to.be.calledOnce
  })
  it('should return 401 if user role does not matches required role', async () => {
    req = { user: { id: 1, userRole: 'buyer' } } as Request

    findOneStub.resolves({ id: 1, userRole: 'buyer' })

    const middleware = checkPermission('admin')
    await middleware(req, res, next)

    expect(findOneStub).to.be.calledOnce
    expect(next).to.not.be.calledOnce
    expect(res.json).to.be.calledOnceWith({
      code: 401,
      message: 'Unauthorized',
    })
  })

  it('should return 401 if user role does not match required role', async () => {
    req.user = { id: 1, userRole: 'user' }
    const middleware = checkPermission('admino')
    await middleware(req, res, next)

    expect(findOneStub.calledOnceWith({ where: { id: 1 } })).to.be.true
    expect(res.status).to.be.called
    expect(res.json).to.be.calledOnceWith({
      code: 401,
      message: 'Unauthorized',
    })
    expect(next).to.not.be.called
  })

  it('should return 401 if user is not found', async () => {
    findOneStub.resolves({ id: 1 })
    const middleware = checkPermission('admin')
    await middleware(req, res, next)

    expect(findOneStub.calledOnceWith({ where: { id: req.user?.id } })).to.be
      .true
    expect(res.status).to.be.calledOnceWith(401)
    expect(res.json).to.be.calledOnceWith({
      code: 401,
      message: 'Unauthorized',
    })
    expect(next).to.not.be.called
  })

  it('should handle missing user in the database', async () => {
    const req = {
      user: {
        id: 1,
      },
    }
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    }

    findOneStub.resolves(null)

    await checkPermission('admin')(
      req as Request,
      res as unknown as Response,
      next,
    )

    expect(res.status).to.have.been.calledWith(401)
    expect(res.json).to.have.been.calledWith({
      code: 401,
      message: 'Unauthorized',
    })
  })
  it('should handle missing user in the database', async () => {
    const req = {
      user: {
        id: 1,
      },
    }
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    }

    findOneStub.resolves({
      id: 1,
      email: 'test@example.com',
      userRole: 'admin',
    })

    await checkPermission('admin')(
      req as Request,
      res as unknown as Response,
      next,
    )

    expect(next).to.have.been.called
    expect(res.json).to.not.have.been.calledWith({
      code: 401,
      message: 'Unauthorized',
    })
  })

  it('should call next middleware if the user exists and has the required role', async () => {
    const req = {
      user: { id: 1 },
    }
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    }

    findOneStub.resolves({
      id: 1,
      email: 'test@example.com',
      userRole: 'admin',
    })

    await checkPermission('admin')(
      req as Request,
      res as unknown as Response,
      next,
    )

    expect(findOneStub).to.have.been.calledWith({ where: { id: 1 } })
    expect(next).to.have.been.calledOnce
    expect(res.status).not.to.have.been.called
    expect(res.json).not.to.have.been.called
  })

  it('should return 401 Unauthorized if the user exists but does not have the required role', async () => {
    const req = {
      user: { id: 1, userRole: 'admin' },
    }
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    }

    findOneStub.resolves({
      id: 1,
      email: 'test@example.com',
      userRole: 'admino',
    })

    await checkPermission('admin')(
      req as Request,
      res as unknown as Response,
      next,
    )

    expect(findOneStub).to.have.been.calledWith({ where: { id: 1 } })
    expect(next).not.to.have.been.called
    expect(res.status).to.have.been.calledWith(401)
    expect(res.json).to.have.been.calledWith({
      code: 401,
      message: 'Unauthorized',
    })
  })
})
