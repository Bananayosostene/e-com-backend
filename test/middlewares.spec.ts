import chai, { expect } from 'chai'
import sinon, { SinonSpy } from 'sinon'
import sinonChai from 'sinon-chai'
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import isAuthenticated from '../src/middlewares/authenticationMiddleware'
import { JWT_SECRET, JWT_EXPIRE_TIME } from '../src/config'
import * as userServiceHelpers from '../src/services/userServices'
import * as tokenHelpers from '../src/utils/jwt'
import User, { UserRole } from '../src/database/models/userModel'
import { Socket } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'
import socketAuthMiddleware from '../src/middlewares/socketMiddleware'
import { UserAttributes } from '../src/database/models/userModel'
import checkCartMiddleware from '../src/middlewares/checkCartMiddleware'
import Cart from '../src/database/models/cartModel'
import redisClient from '../src/utils/redisConfiguration'

chai.use(sinonChai)

describe('isAuthenticated function', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let jwtVerifyStub: sinon.SinonStub
  let getUserByIdStub: sinon.SinonStub
  let decodeTokenStub: sinon.SinonStub
   let redisGetStub: sinon.SinonStub
  let sandbox: sinon.SinonSandbox

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer validToken',
      },
    } as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
      locals: {},
    } as unknown as Response
    next = sinon.spy()
    jwtVerifyStub = sinon.stub(jwt, 'verify')
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sinon.restore()
    jwtVerifyStub.restore()
    sandbox.restore()
  })

  it('should return 401 "Please login" if no token', async () => {
    const data = { id: 1, email: 'test@example.com' }
    const myToken = jwt.sign(data, JWT_SECRET || 'USER-AUTH', {
      expiresIn: JWT_EXPIRE_TIME,
    })
    const mockDecoded = { userId: 1, username: 'testuser' }
    req.headers = {}
    jwtVerifyStub.returns(mockDecoded)

    jwtVerifyStub.callsFake((token, secret, callback) => {
      token = myToken
      const mockDecoded1 = { id: 1, email: 'test@example.com' }
      res.locals.decoded = mockDecoded1
      req.user = mockDecoded1
      callback(null, mockDecoded1)
    })
    await isAuthenticated(req, res, next)

    expect(jwtVerifyStub).to.not.be.calledOnceWith(myToken, JWT_SECRET)
    expect(res.status).to.have.been.calledWith(401)
    expect(next).to.not.be.calledOnce
  })

 it('--1-- should call next() with valid token', async () => {
    const data = { id: 1, email: 'test@example.com' }
    const myToken = jwt.sign(data, JWT_SECRET, {
      expiresIn: JWT_EXPIRE_TIME,
    })
    req.headers = { authorization: `Bearer ${myToken}` }

    jwtVerifyStub.callsFake((token, secret, callback) => {
      callback(null, { id: 1, email: 'test@example.com' })
    })

    decodeTokenStub = sandbox
      .stub(tokenHelpers, 'decodeToken')
      .resolves({ id: 1, email: 'test@example.com' })
    getUserByIdStub = sandbox
      .stub(userServiceHelpers, 'getUserById')
      .resolves({ id: 1, email: 'test@example.com' } as User)
    redisGetStub = sandbox
      .stub(redisClient, 'get')
      .resolves(myToken)

    await isAuthenticated(req, res, next)

    expect(decodeTokenStub).to.have.been.called
    expect(getUserByIdStub).to.have.been.called
    expect(redisGetStub).to.have.been.calledWith(`user:1`)
    expect(res.locals.decoded).to.have.property('id').equals(1)
    expect(req.user).to.deep.equal({ id: 1, email: 'test@example.com' })
    expect(next).to.have.been.calledOnce
  })

  it('--2 should call next() with valid token', async () => {
    const mockToken = 'valid.jwt.token'
    req.headers = { authorization: `Bearer ${mockToken}` }

    jwtVerifyStub.callsFake((token, secret, callback) => {
      callback(null, { id: 1, email: 'test@example.com' })
    })

    decodeTokenStub = sandbox
      .stub(tokenHelpers, 'decodeToken')
      .resolves({ id: 1, email: 'test@example.com' })
    getUserByIdStub = sandbox
      .stub(userServiceHelpers, 'getUserById')
      .resolves({ id: 1, email: 'test@example.com' } as User)
    redisGetStub = sandbox
      .stub(redisClient, 'get')
      .resolves(mockToken)

    await isAuthenticated(req, res, next)

    expect(decodeTokenStub).to.have.been.called
    expect(getUserByIdStub).to.have.been.called
    expect(redisGetStub).to.have.been.calledWith(`user:1`)
    expect(res.locals.decoded).to.have.property('id').equals(1)
    expect(req.user).to.deep.equal({ id: 1, email: 'test@example.com' })
    expect(next).to.have.been.calledOnce
  })

  it('should return 500 Internal Server Error if an unexpected error occurs', async () => {
    const req = {
      headers: {
        authorization: 'Bearer validToken',
      },
    }
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      locals: {},
    }

    jwtVerifyStub.throws(new Error('Invalid token'))
    await isAuthenticated(req as Request, res as unknown as Response, next)

    expect(jwtVerifyStub).to.have.been.calledWith('validToken', JWT_SECRET)
    expect(res.status).to.have.been.calledWith(500)
    expect(res.json).to.have.been.calledWith({
      message: 'Internal server down',
      error: 'Invalid token',
    })
    expect(next).not.to.have.been.called
  })

  it('should handle missing JWT_SECRET environment variable', () => {
    const req = {
      headers: {
        authorization: 'Bearer <token>',
      },
    }
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    }

    delete process.env.JWT_SECRET

    isAuthenticated(req as Request, res as unknown as Response, next)

    expect(res.status).to.not.have.been.called
    expect(res.json).to.not.have.been.calledOnce
  })

  it('should handle invalid JWT_SECRET environment variable', () => {
    const req = {
      headers: {
        authorization: 'Bearer <token>',
      },
    }
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    }

    process.env.JWT_SECRET = 'invalid-secret'

    isAuthenticated(req as Request, res as unknown as Response, next)

    expect(res.status).to.not.have.been.called
    expect(res.json).to.not.have.been.calledWith({
      message: 'Internal server down',
    })
  })
  it('should return 401 if no authorization header is present', async () => {
    const req: Request = { headers: {} } as Request
    const res: Response = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    } as unknown as Response

    await isAuthenticated(req, res, next)

    expect(res.status).to.have.been.calledWith(401)
    expect(res.json).to.have.been.calledWith({ message: 'Please Login' })
    expect(next).not.to.have.been.called
  })

  it('should return 401 for empty token', async () => {
    const req: Request = {
      headers: { authorization: 'uu' },
    } as Request
    const res: Response = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    } as unknown as Response

    await isAuthenticated(req, res, next)

    expect(res.status).to.have.been.calledWith(401)
    expect(res.json).to.have.been.calledWith({
      message: 'no access token found',
    })
    expect(next).not.to.have.been.called
  })

  it('should return 500 for invalid token', async () => {
    const req: Request = {
      headers: { authorization: 'Bearer invalid.token' },
    } as Request
    const res: Response = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    } as unknown as Response

    jwtVerifyStub.callsFake((token, secret, callback) => {
      callback(new Error('Invalid token'))
    })

    await isAuthenticated(req, res, next)

    expect(jwtVerifyStub).to.have.been.calledOnce
    expect(res.status).to.have.been.calledWith(500)
    expect(res.json).to.have.been.called
    expect(next).not.to.have.been.called

    sandbox.restore()
  })

  it('should extract token from valid authorization header', async () => {
    const req: Request = {
      headers: { authorization: 'Bearer valid_token' },
    } as Request
    const res: Response = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    } as unknown as Response

    const token = req.headers.authorization?.split(' ')[1]
    await isAuthenticated(req, res, next)

    expect(token).to.be.a('string')
  })

  it('should handle missing authorization header', async () => {
    const req: Request = { headers: {} } as Request
    const res: Response = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    } as unknown as Response

    await isAuthenticated(req, res, next)

    expect(res.status).to.have.been.calledWith(401)
    expect(res.json).to.have.been.calledWith({ message: 'Please Login' })
    expect(next).not.to.have.been.called
  })
  it('should handle missing authorization header', async () => {
    const req: Request = {
      headers: { authorization: 'Bearer1' },
    } as Request
    const res: Response = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    } as unknown as Response

    const token = req.headers.authorization?.split(' ')[1]

    await isAuthenticated(req, res, next)

    expect(token).to.be.undefined
    expect(res.status).to.have.been.calledWith(401)
    expect(res.json).to.have.been.calledWith({
      message: 'no access token found',
    })
    expect(next).not.to.have.been.called
  })

  it('should allow authenticated seller with valid OTP token', async () => {
    const user:any = {
      id: 1,
      email: 'seller@example.com',
      userRole: UserRole.SELLER,
    }
    const otpToken = 'validOTP=123456'
    const token = '123456'

    req.headers = { authorization: `Bearer ${token}` }

    jwtVerifyStub.callsFake((token, secret, callback) => {
      callback(null, user)
    })

    decodeTokenStub = sandbox.stub(tokenHelpers, 'decodeToken').resolves(user)

    getUserByIdStub = sandbox
      .stub(userServiceHelpers, 'getUserById')
      .resolves(user)

    redisGetStub = sandbox
      .stub(redisClient, 'get')
      .withArgs(user.email)
      .resolves(otpToken)

    await isAuthenticated(req, res, next)

    expect(decodeTokenStub).to.have.been.called
    expect(getUserByIdStub).to.have.been.called
    expect(redisGetStub).to.have.been.calledWith(user.email)
    expect(req.user).to.deep.equal(user)
    expect(res.locals.decoded).to.deep.equal(user)
    expect(next).to.have.been.calledOnce
  })


   it('should return 401 if token in Redis does not exist', async () => {
    const data = { id: 1, email: 'test@example.com' }
    const myToken = jwt.sign(data, JWT_SECRET, {
      expiresIn: JWT_EXPIRE_TIME,
    })
    const mockDecoded = { id: 1, email: 'test@example.com' }

    req.headers = { authorization: `Bearer ${myToken}` }
    jwtVerifyStub.returns(mockDecoded)

    decodeTokenStub = sandbox
      .stub(tokenHelpers, 'decodeToken')
      .resolves(mockDecoded)
    getUserByIdStub = sandbox
      .stub(userServiceHelpers, 'getUserById')
      .resolves({ id: 1, email: 'test@example.com' } as User)
    redisGetStub = sandbox.stub(redisClient, 'get').resolves(null)

    await isAuthenticated(req, res, next)

    expect(redisGetStub).to.have.been.calledWith(`user:${mockDecoded.id}`)
    expect(res.status).to.have.been.calledWith(401)
    expect(res.json).to.have.been.calledWith({ message: 'Please login again' })
    expect(next).not.to.have.been.called
  })

  it('should return 401 if token in Redis does not match provided token', async () => {
    const data = { id: 1, email: 'test@example.com' }
    const myToken = jwt.sign(data, JWT_SECRET, {
      expiresIn: JWT_EXPIRE_TIME,
    })
    const mockDecoded = { id: 1, email: 'test@example.com' }

    req.headers = { authorization: `Bearer ${myToken}` }
    jwtVerifyStub.returns(mockDecoded)

    decodeTokenStub = sandbox
      .stub(tokenHelpers, 'decodeToken')
      .resolves(mockDecoded)
    getUserByIdStub = sandbox
      .stub(userServiceHelpers, 'getUserById')
      .resolves({ id: 1, email: 'test@example.com' } as User)
    redisGetStub = sandbox.stub(redisClient, 'get').resolves('differentToken')

    await isAuthenticated(req, res, next)

    expect(redisGetStub).to.have.been.calledWith(`user:${mockDecoded.id}`)
    expect(res.status).to.have.been.calledWith(401)
    expect(res.json).to.have.been.calledWith({ message: 'Please login again' })
    expect(next).not.to.have.been.called
  })

  afterEach(() => {
    sandbox.restore()
  })
})

// =======socket socketAuthMiddleware=======================================
describe('socketAuthMiddleware', () => {
  let socket: Partial<Socket>
  let next: sinon.SinonSpy
  let jwtVerifyStub: sinon.SinonStub

  beforeEach(() => {
    socket = {
      handshake: {
        auth: {
          token: 'valid.token.here',
        },
        headers: undefined,
        time: '',
        address: '',
        xdomain: false,
        secure: false,
        issued: 0,
        url: '',
        query: undefined,
      },
      data: {},
    }
    next = sinon.spy()
    jwtVerifyStub = sinon.stub(jwt, 'verify')
  })

  afterEach(() => {
    jwtVerifyStub.restore()
  })

  it('should call next with an error if no token is provided', () => {
    socket.handshake.auth.token = ''

    socketAuthMiddleware(socket as Socket, next)

    expect(next.calledOnce).to.be.true
    const error = next.firstCall.args[0] as ExtendedError
    expect(error).to.be.instanceOf(Error)
    expect(error.message).to.equal('Authentication error')
    expect(error.data).to.deep.equal({ message: 'No token provided' })
  })

  it('should call next with an error if token verification fails', () => {
    jwtVerifyStub.callsFake((token, secret, callback) => {
      callback(new Error('Token verification failed'), null)
    })

    socketAuthMiddleware(socket as Socket, next)

    expect(next.calledOnce).to.be.true
    const error = next.firstCall.args[0] as ExtendedError
    expect(error).to.be.instanceOf(Error)
    expect(error.message).to.equal('Authentication error')
    expect(error.data).to.deep.equal({
      message: 'Failed to authenticate token',
    })
  })

  it('should call next with an error if decoded token is not an object', () => {
    jwtVerifyStub.callsFake((token, secret, callback) => {
      callback(null, 'invalid-decoded-token')
    })

    socketAuthMiddleware(socket as Socket, next)

    expect(next.calledOnce).to.be.true
    const error = next.firstCall.args[0] as ExtendedError
    expect(error).to.be.instanceOf(Error)
    expect(error.message).to.equal('Authentication error')
    expect(error.data).to.deep.equal({
      message: 'Failed to authenticate token',
    })
  })

  it('should call next without error and attach decoded token to socket data', () => {
    const decoded: Partial<UserAttributes> = {
      id: 1,
      email: 'user@example.com',
    }
    jwtVerifyStub.callsFake((token, secret, callback) => {
      callback(null, decoded)
    })

    socketAuthMiddleware(socket as Socket, next)

    expect(next.calledOnce).to.be.true
    expect(next.firstCall.args[0]).to.be.undefined
    expect(socket.data.user).to.deep.equal(decoded)
  })
})

// ======checkCartMiddleware=======================================
describe('checkCartMiddleware', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: SinonSpy

  beforeEach(() => {
    req = {
      user: {
        id: 1,
      },
    }

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    } as unknown as Response

    next = sinon.spy() as SinonSpy
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should call next if an active cart is found', async () => {
    const cart = {
      id: 1,
      buyerId: req.user.id,
      status: 'active',
      items: [
        {
          productId: 'a56eb4af-8194-413a-a487-d9884300c033',
          name: 'Laptop Bags',
          quantity: 2,
          price: 18000,
        },
      ],
    } as any

    const findOneStub = sinon.stub(Cart, 'findOne').resolves(cart)

    await checkCartMiddleware(req as Request, res as Response, next)

    expect(findOneStub.calledOnce).to.be.true
    expect(next.calledOnce).to.be.true
    expect(next.calledWith()).to.be.true
  })

  it('should return 404 if no active cart is found', async () => {
    const findOneStub = sinon.stub(Cart, 'findOne').resolves(null)

    await checkCartMiddleware(req as Request, res as Response, next)

    expect(findOneStub.calledOnce).to.be.true
    expect(next.notCalled).to.be.true
  })

  it('should call next with an error if an exception occurs', async () => {
    const error = new Error('Database error')
    const findOneStub = sinon.stub(Cart, 'findOne').rejects(error)

    await checkCartMiddleware(req as Request, res as Response, next)

    expect(findOneStub.calledOnce).to.be.true
    expect(next.calledOnce).to.be.true
    expect(next.calledWith(error)).to.be.true
  })
})
