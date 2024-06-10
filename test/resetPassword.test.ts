import { expect } from 'chai'
import sinon, { SinonStub } from 'sinon'
import { Request, Response } from 'express'
import UserController from '../src/controllers/UserController'
import User from '../src/database/models/userModel'
import redisClient from '../src/utils/redisConfiguration'
import * as tokenUtils from '../src/services/tokenServices'
import * as userServices from '../src/services/userServices'
import * as passwordUtils from '../src/utils/passwords'
describe('Resetting password', () => {
  describe('resetPasswordLink', () => {
    let req: Partial<Request>
    let res: Partial<Response>
    let userFindOneStub: SinonStub
    let generateTokenStub: SinonStub
    let redisSetExStub: SinonStub

    beforeEach(() => {
      req = {
        body: {
          email: 'test6@gmail.com',
        },
      }

      res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
        json: sinon.stub(),
      }

      userFindOneStub = sinon.stub(User, 'findOne')
      generateTokenStub = sinon.stub().returns('validToken')
      redisSetExStub = sinon.stub(redisClient, 'setEx').resolves()
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should send "User not found" if user does not exist', async () => {
      userFindOneStub.resolves(null)
      await UserController.resetPasswordLink(req as Request, res as Response)
      expect((res.status as sinon.SinonStub).calledWith(404)).to.be.true
    })

    it('should send reset password email if user exists', async () => {
      const user = {
        id: 1,
        email: 'test6@gmail.com',
        username: 'testuser',
      }

      userFindOneStub.resolves(user)
      generateTokenStub.returns('validToken')
      redisSetExStub.resolves()

      await UserController.resetPasswordLink(req as Request, res as Response)

      expect((res.status as sinon.SinonStub).calledWith(200))
    })

    it('should handle errors', async () => {
      userFindOneStub.rejects(new Error('Test error'))

      await UserController.resetPasswordLink(req as Request, res as Response)

      expect((res.status as sinon.SinonStub).calledWith(500)).to.be.true
      expect((res.json as sinon.SinonStub).calledWith({ error: 'Test error' }))
        .to.be.true
    })
  })
})

describe('UserController.newPassword', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let statusStub: sinon.SinonStub
  let jsonStub: sinon.SinonStub

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    }
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    }
    statusStub = res.status as sinon.SinonStub
    jsonStub = res.json as sinon.SinonStub
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should return 404 if the token is not found or expired', async () => {
    req.params = { token: 'invalidToken' }
    sinon.stub(redisClient, 'get').resolves(null)

    await UserController.newPassword(req as Request, res as Response)

    expect(statusStub).to.have.been.calledWith(404)
    expect(jsonStub).to.have.been.calledWith({
      message: 'Token not found or expired',
    })
  })

  it('should return 401 if the token is invalid', async () => {
    req.params = { token: 'validToken' }
    sinon.stub(redisClient, 'get').resolves('someRedisToken')
    sinon.stub(tokenUtils, 'validateRedisToken').returns(null)

    await UserController.newPassword(req as Request, res as Response)

    expect(statusStub).to.have.been.calledWith(401)
    expect(jsonStub).to.have.been.calledWith({ message: 'Invalid token' })
  })

  it('should return 404 if the user is not found', async () => {
    req.params = { token: 'validToken' }
    sinon.stub(redisClient, 'get').resolves('someRedisToken')
    sinon.stub(tokenUtils, 'validateRedisToken').returns({ id: 'userId' })
    sinon.stub(userServices, 'getUserById').resolves(null)

    await UserController.newPassword(req as Request, res as Response)

    expect(statusStub).to.have.been.calledWith(404)
    expect(jsonStub).to.have.been.calledWith({ message: 'User not found' })
  })

  it('should return 200 and update the password if the token and user are valid', async () => {
    req.params = { token: 'validToken' }
    req.body = { password: 'newPassword' }
    sinon.stub(redisClient, 'get').resolves('someRedisToken')
    sinon.stub(tokenUtils, 'validateRedisToken').returns({ id: 'userId' })
    const user = { update: sinon.stub().resolves() }
    sinon.stub(userServices, 'getUserById').resolves(user as any)
    sinon.stub(passwordUtils, 'hashPassword').resolves('hashedPassword')
    sinon.stub(redisClient, 'del').resolves()

    await UserController.newPassword(req as Request, res as Response)
    expect(user.update).to.have.been.calledWith({ password: 'hashedPassword',isExpired: false, lastTimePasswordUpdate: sinon.match.date })
    expect(redisClient.del).to.have.been.calledWith('validToken')
    expect(statusStub).to.have.been.calledWith(200)
    expect(jsonStub).to.have.been.calledWith({
      message: 'Password has been successfully reset',
    })
  })

  it('should return 500 if there is an internal server error', async () => {
    req.params = { token: 'validToken' }
    req.body = { password: 'newPassword' }
    sinon.stub(redisClient, 'get').throws(new Error('Redis error'))

    await UserController.newPassword(req as Request, res as Response)

    expect(statusStub).to.have.been.calledWith(500)
    expect(jsonStub).to.have.been.calledWith({
      message: 'Internal server error',
    })
  })
})
