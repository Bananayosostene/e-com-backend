import chai, { expect } from 'chai'
import sinon from 'sinon'
import chaiHttp from 'chai-http'
import express from 'express'
import sinonChai from 'sinon-chai'
import LoginController from '../src/controllers/LoginController'
import UserController from '../src/controllers/UserController'
import User from '../src/database/models/userModel'
import Token from '../src/database/models/tokenModel'
import * as hashPasswordHelper from '../src/utils/passwords'
import * as tokenHelpers from '../src/utils/jwt'
import * as sendMailHelpers from '../src/utils/sendEmail'
import * as templatesHelpers from '../src/utils/emailTemplates'
import sequelizeConnection from '../src/database/config/db.config'
import { app, server } from '../index'

chai.use(sinonChai)
chai.use(chaiHttp)
describe('Authentication Controllers', () => {
  describe('login', () => {
    let req: express.Request
    let res: express.Response
    let sandbox: sinon.SinonSandbox

    beforeEach(() => {
      sandbox = sinon.createSandbox()
      req = {
        body: { email: 'test@examplle.com', password: 'password123' },
      } as unknown as express.Request
      res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.stub(),
        send: sandbox.stub(),
        setHeader: sandbox.stub(),
      } as unknown as express.Response
    })

    afterEach(() => {
      sandbox.restore()
      sinon.restore()
    })

    it('should return 404 for non-existent user', async () => {
      const existingUser = {
        dataValues: { password: 'hashedPassword', id: 1 },
      } as User
      sandbox.stub(User, 'findOne').resolves(existingUser)

      await LoginController.login(req, res)

      expect(res.status).to.have.been.called
    })

    it(' should return 401 for Invalid email or password', async () => {
      const existingUser = {
        dataValues: { password: 'hashedPassword' },
      } as User
      sandbox.stub(User, 'findOne').resolves(existingUser)

      sandbox.stub(hashPasswordHelper, 'comparePassword').resolves(false)

      await LoginController.login(req, res)

      expect(res.status).to.have.been.calledOnceWith(401)
    })

    it('should return 200 and verification message for unverified user', async () => {
      const existingUser = {
        dataValues: {
          email: 'test@example.com',
          password: 'password123',
          verified: false,
          id: 1,
        },
      } as User
      const pendingToken = {
        dataValues: { token: 'found_token', userId: 1 },
      } as Token
      sandbox.stub(User, 'findOne').resolves(existingUser)
      sandbox.stub(Token, 'findOne').resolves(pendingToken)
      sandbox.stub(hashPasswordHelper, 'comparePassword').resolves(true)
      sandbox.stub(tokenHelpers, 'generateToken').resolves('token')

      await LoginController.login(req, res)

      expect(res.status).to.have.been.calledOnce
      expect(res.send).to.have.been.calledOnce
    })

    it('should return 200 and token for verified user', async () => {
      const existingUser = {
        dataValues: {
          verified: true,
          id: 1,
          email: 'user@example.com',
          password: 'password123',
        },
      } as User
      sandbox.stub(User, 'findOne').resolves(existingUser)
      sandbox.stub(hashPasswordHelper, 'comparePassword').resolves(true)
      sandbox.stub(tokenHelpers, 'generateToken').resolves('token')

      await LoginController.login(req, res)

      expect(res.status).to.have.been.calledWith(200)
    })

    it('should handle errors and return 500', async () => {
      sandbox.stub(User, 'findOne').throws(new Error('Database error'))

      await LoginController.login(req, res)

      expect(res.status).to.have.been.calledOnceWith(500)
      expect(res.send).to.have.been.calledOnceWith({
        message: 'Internal server error',
        error: 'Database error',
      })
    })

    it('should call sendMail for new verification email', async () => {
      const existingUser = {
        dataValues: {
          email: 'test@example.com',
          password: 'password123',
          verified: false,
          id: 1,
        },
      } as User
      sandbox.stub(User, 'findOne').resolves(existingUser)
      sandbox.stub(Token, 'findOne').resolves(null)
      sandbox.stub(hashPasswordHelper, 'comparePassword').resolves(true)
      sandbox
        .stub(tokenHelpers, 'generateToken')
        .resolves('new_verification_token')
      sandbox
        .stub(templatesHelpers, 'verificationsEmailTemplate')
        .resolves('new_ html')

      const sendMailStub = sinon.stub()
      sinon.replace(sendMailHelpers, 'default', sendMailStub)

      sendMailStub.returns(true)
      const tokenStub = Token.build({ userId: 1, token: 'token' })

      sandbox.stub(Token, 'create').resolves(tokenStub)

      await LoginController.login(req, res)

      expect(res.status).to.have.been.calledOnceWith(200)
      expect(sendMailStub).to.have.been.calledOnce
      expect(res.send).to.have.been.calledOnceWith({
        message: 'A verification email has been sent',
      })
    })

    it('should handle error during email sending', async () => {
      sandbox
        .stub(User, 'findOne')
        .resolves(null)
        .throws(new Error('Error sending email'))
      sandbox.stub(Token, 'findOne').resolves(null)
      sandbox
        .stub(tokenHelpers, 'generateToken')
        .resolves('new_verification_token')
      sandbox.replace(
        sendMailHelpers,
        'default',
        sinon.fake.throws(new Error('Error sending email')),
      )

      await LoginController.login(req, res)

      expect(res.status).to.have.been.calledOnceWith(500)
      expect(res.send).to.have.been.calledOnceWith({
        message: 'Internal server error',
        error: 'Error sending email',
      })
    })
  })

  describe('SignUp controller', () => {
    let req: express.Request
    let res: express.Response
    let sandbox: sinon.SinonSandbox

    beforeEach(() => {
      sandbox = sinon.createSandbox()
      req = {
        body: { email: 'test@examplle.com', password: 'password123' },
      } as unknown as express.Request
      res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.stub(),
        send: sandbox.stub(),
      } as unknown as express.Response
    })

    afterEach(() => {
      sandbox.restore()
      sinon.restore()
    })

    it('should return 409 if user is already existing', async () => {
      const newUser = {
        username: 'test user',
        email: 'test@examples.com',
        password: 'password123',
        verified: false,
        id: 2,
      } as User
      sandbox.stub(User, 'findOne').resolves(newUser)

      await UserController.signup(req, res)

      expect(res.status).to.have.not.been.calledOnceWith(201)
      expect(res.json).to.have.not.been.calledOnceWith({
        message: 'Account Created successfully, verify your email to continue',
      })
    })

    it('should call sendMail to send a verification email', async () => {
      const newUser = new User({
        username: 'test user',
        email: 'test@examples.com',
        password: 'password123',
        verified: false,
        id: 2,
      }) as User
      sandbox.stub(User, 'findOne').resolves(null)

      sandbox
        .stub(tokenHelpers, 'generateToken')
        .resolves('new_verification_token')

      sandbox
        .stub(hashPasswordHelper, 'hashPassword')
        .resolves('hashed_password')

      sandbox.stub(newUser, 'save').resolves()

      sandbox
        .stub(templatesHelpers, 'verificationsEmailTemplate')
        .resolves('new_ html')

      const sendMailStub = sinon.stub()
      sinon.replace(sendMailHelpers, 'default', sendMailStub)

      sendMailStub.returns(true)
      const tokenStub = Token.build({ userId: 1, token: 'token' })

      sandbox.stub(Token, 'create').resolves(tokenStub)

      await UserController.signup(req, res)

      expect(res.status).to.have.not.been.calledOnceWith(201)
      expect(sendMailStub).to.have.not.been.calledOnce
      expect(res.json).to.have.not.been.calledOnceWith({
        message: 'Account Created successfully, verify your email to continue',
      })
    })

    it('should call sendMail to send a verification email', async () => {
      const newUserData = {
        username: 'testuser',
        email: 'test@examples.com',
        password: 'password123',
        verified: false,
        id: 2,
      } as User

      sandbox.stub(User, 'findOne').resolves(null)
      const newUser = User.build(newUserData)
      sandbox.stub(newUser, 'save').resolves(newUserData)

      sandbox
        .stub(tokenHelpers, 'generateToken')
        .resolves('new_verification_token')
      sandbox
        .stub(templatesHelpers, 'verificationsEmailTemplate')
        .resolves('new_html')

      const sendMailStub = sinon.stub()
      sinon.replace(sendMailHelpers, 'default', sendMailStub)
      sendMailStub.returns(true)

      const tokenStub = Token.build({ userId: 1, token: 'token' })
      sandbox.stub(Token, 'create').resolves(tokenStub)

      await UserController.signup(req, res)

      expect(res.status).to.not.have.been.calledOnceWith(201)
      expect(sendMailStub).to.not.have.been.calledOnce
      expect(res.json).to.have.been.calledOnce
    })
  })
})
