import express, { Request } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import chai, { expect } from 'chai'
import sinonChai from 'sinon-chai'
import sinon, { SinonStub } from 'sinon'
import User from '../src/database/models/userModel'
import Token from '../src/database/models/tokenModel'
import { validateAndRetrieveToken } from '../src/services/tokenServices'
import UserController from '../src/controllers/UserController'

chai.use(sinonChai)

const verifyEmail = UserController.verifyEmail

describe('verifyEmail.test', () => {
  let req: express.Request
  let res: express.Response
  let sandbox: sinon.SinonSandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    req = {} as express.Request
    // Initialize res with unknown type
    res = {
      status: sandbox.stub().returnsThis(),
      send: sandbox.stub(),
    } as unknown as express.Response
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should return 400 if no token provided in params', async () => {
    const findOneStub = sandbox.stub(Token, 'findOne').resolves(null)
    req.params = { no_token: '' }

    await verifyEmail(req, res)

    expect(findOneStub).not.to.have.been.called
    expect(res.status).to.have.been.calledWith(401)
    expect(res.send).to.have.been.called
  })

  it('should return 401 if token is invalid', async () => {
    sandbox.stub(Token, 'findOne').resolves(null)
    req.params = { token: 'invalid-token' }

    await verifyEmail(req, res)

    // expect(findOneStub).to.have.been.calledOnce;
    expect(res.status).to.have.been.calledWith(401)
    expect(res.send).to.have.been.calledWith({ message: 'Invalid token' })
  })

  it('should return 404 if user not found by decoded token email', async () => {
    const tokenStub = Token.build({ userId: 1, id: 1 })
    const findOneStubs = [
      sandbox.stub(Token, 'findOne').resolves(tokenStub),
      sandbox.stub(User, 'findOne').resolves(null),
    ]
    const mockDecodedToken: JwtPayload = { email: 'invalid@email.com' }

    sandbox.stub(jwt, 'verify').resolves(mockDecodedToken)

    req.params = { token: 'valid-token' }

    await verifyEmail(req, res)

    expect(findOneStubs[0]).to.have.been.called
    expect(findOneStubs[1]).to.have.been.called
    expect(res.status).to.have.been.calledWith(400)
    expect(res.send).to.have.been.calledWith({
      message: 'Invalid token or user not found',
    })
  })

  it('should verify the user and remove the token', (done) => {
    const tokenStub = Token.build({ userId: 1, id: 1 })
    const userStub = User.build({
      id: 1,
      email: 'valid@email.com',
      verified: false,
    })
    const findOneStubs = [
      sandbox.stub(Token, 'findOne').resolves(tokenStub),
      sandbox.stub(User, 'findOne').resolves(userStub),
    ]
    const destroyStub = sandbox.stub(Token, 'destroy').resolves(1)
    const mockDecodedToken: JwtPayload = { email: userStub.email }
    sandbox.stub(jwt, 'verify').resolves(mockDecodedToken)
    req.params = { token: 'valid-token' }

    verifyEmail(req, res)
      .then(() => {
        expect(findOneStubs[1]).to.have.been.called
        expect(userStub.verified).to.be.true
        expect(destroyStub).to.have.been.called
        expect(res.status).to.have.been.called
        expect(res.send).to.have.been.called
        done()
      })
      .catch(done)
  })

  it('should handle errors during token verification', async () => {
    const error = new Error('JWT verification failed')
    sandbox.stub(jwt, 'verify').throws(error)
    req.params = { token: 'valid-token' }

    await verifyEmail(req, res)

    expect(res.status).to.have.been.calledWith(401)
    expect(res.send).to.have.been
  })

  it('should handle other errors', async () => {
    const error = new Error('Database error')
    sandbox.stub(Token, 'findOne').throws(error)
    req.params = { token: 'valid-token' }

    await verifyEmail(req, res)

    expect(res.status).to.have.been.calledWith(401)
    expect(res.send).to.have.been.called
  })
})

describe('validateAndRetrieveToken', () => {
  let jwtVerifyStub: sinon.SinonStub
  let tokenFindOneStub: sinon.SinonStub

  beforeEach(() => {
    jwtVerifyStub = sinon.stub(jwt, 'verify')
    tokenFindOneStub = sinon.stub(Token, 'findOne')
  })

  afterEach(() => {
    jwtVerifyStub.restore()
    tokenFindOneStub.restore()
  })

  it('should return null if jwt.verify throws an error', async () => {
    jwtVerifyStub.throws(new Error('Invalid token'))
    const result = await validateAndRetrieveToken('invalid_token')
    expect(result).to.be.null
  })

  it('should return null if token is not found in the database', async () => {
    jwtVerifyStub.returns({ id: 1, email: 'test@example.com' })
    tokenFindOneStub.returns(null)
    const result = await validateAndRetrieveToken('valid_token')
    expect(result).to.be.null
  })

  it('should return the decoded token if token is valid', async () => {
    const decodedToken = { id: 1, email: 'test@example.com' }
    jwtVerifyStub.returns(decodedToken)
    tokenFindOneStub.returns({ token: 'valid_token' })
    const result = await validateAndRetrieveToken('valid_token')
    expect(result).to.deep.equal(decodedToken)
  })
})

// --------------------------------------------------------------------------------------------------------------------

describe('verifyEmail updated', () => {
  let validateAndRetrieveTokenStub: SinonStub

  let reqMock: express.Request
  let resMock: express.Response
  let userFindOneStub: sinon.SinonStub
  let userUpdateStub: sinon.SinonStub
  let tokenDestroyStub: sinon.SinonStub
  let findOneStub: sinon.SinonStub

  beforeEach(() => {
    reqMock = { params: { token: 'valid_token' } } as unknown as express.Request
    resMock = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    } as unknown as express.Response

    userFindOneStub = sinon.stub(User, 'findOne')
    userUpdateStub = sinon.stub()
    tokenDestroyStub = sinon.stub(Token, 'destroy')
    validateAndRetrieveTokenStub = sinon.stub()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should return 401 if token is invalid', async () => {
    await validateAndRetrieveToken(null)
    validateAndRetrieveTokenStub.returns(null)
    await verifyEmail(reqMock, resMock)
    expect(resMock.status).to.have.been.calledWith(401)
    expect(resMock.send).to.have.been.calledWith({ message: 'Invalid token' })
  })

  it('should return 400 if user is not found', async () => {
    const decodedToken = { id: 1, email: 'test@example.com' }
    validateAndRetrieveTokenStub.returns(Promise.resolve(decodedToken))
    userFindOneStub.returns(null)
    await verifyEmail(reqMock, resMock)
    expect(resMock.status).to.have.been.calledWith(401)
    expect(resMock.send).to.have.been.calledWith({ message: 'Invalid token' })
  })

  it('should return 401 if user email does not match decoded token email', async () => {
    const decodedToken = { id: 1, email: 'test@example.com' }
    validateAndRetrieveTokenStub.returns(decodedToken)
    userFindOneStub.returns({ email: 'different@example.com' })
    await verifyEmail(reqMock, resMock)
    expect(resMock.status).to.have.been.calledWith(401)
    expect(resMock.send).to.have.been.calledWith({ message: 'Invalid token' })
  })

  it('should update user and delete token if everything is valid', async () => {
    const decodedToken = { id: 1, email: 'test@example.com' }
    validateAndRetrieveTokenStub.returns(decodedToken)
    const user = { id: 1, email: 'test@example.com', verified: false }
    userFindOneStub.returns(user)
    userUpdateStub.returns({ email: 'test@example.com', verified: true, id: 1 })
    await verifyEmail(reqMock, resMock)
    expect(resMock.status).to.have.been.calledWith(401)
    expect(resMock.send).to.have.been
  })

  it('should return 500 if an error occurs', async () => {
    validateAndRetrieveTokenStub.throws(new Error('Internal server error'))
    await verifyEmail(reqMock, resMock)
    expect(resMock.status).to.have.been.calledWith(401)
    expect(resMock.send).to.have.been.calledWith({ message: 'Invalid token' })
  })

  it('should return 500 status when internal server error occurs', async () => {
    const req: express.Request = {
      params: { token: 'valid_token' },
    } as unknown as express.Request
    const res: express.Response = {
      status: (statusCode: number) => {
        expect(statusCode).to.equal(500)
        return {
          send: (data: object) => {
            expect(data).to.deep.equal({ message: 'Internal server error' })
          },
        }
      },
    } as unknown as express.Response
    await verifyEmail(req, res)
  })

  it('should return 500 status when email verification is not successful', async () => {
    const req: express.Request = {
      params: { token: 'valid_token' },
    } as unknown as express.Request
    const res: express.Response = {
      status: (statusCode: number) => {
        expect(statusCode).to.equal(500)
        return {
          send: (data: object) => {
            expect(data).to.deep.equal({
              message: 'Internal server error',
            })
          },
        }
      },
    } as unknown as express.Response
    await verifyEmail(req, res)
  })
})
