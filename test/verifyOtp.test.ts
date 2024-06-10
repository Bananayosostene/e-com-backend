/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from 'chai'
import { Request, Response } from 'express'
import sinon from 'sinon'
import redisClient from '../src/utils/redisConfiguration'
import twofaVerifyOtp from '../src/controllers/UserController'
import LoginController from '../src/controllers/LoginController'

describe('2FA For sellers', () => {
  let req: Partial<Request>
  let res: Partial<Response>

  beforeEach(() => {
    req = {
      body: {
        otp: '1234',
      },
      params: {
        email: 'myseller@gmail.com',
      },
    }

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    }
  })

  describe('2FA For Sellers', () => {
    it('should return 404 if OTP token not found in Redis', async () => {
      sinon.stub(redisClient, 'get').resolves(null)

      await twofaVerifyOtp.twofaVerifyOtp(req as Request, res as Response)

      expect((res.status as sinon.SinonStub).calledWith(404)).to.be.true
      expect(
        (res.json as sinon.SinonStub).calledWith({
          message: 'OTP token not found',
        }),
      ).to.be.true

      sinon.restore()
    })

    it('should return 406 if OTP is invalid', async () => {
      sinon.stub(redisClient, 'get').resolves('9876=token123')

      await twofaVerifyOtp.twofaVerifyOtp(req as Request, res as Response)

      expect((res.status as sinon.SinonStub).calledWith(406)).to.be.true
      expect(
        (res.json as sinon.SinonStub).calledWith({
          message: 'Invalid One Time Password',
        }),
      ).to.be.true

      sinon.restore()
    })

    it('should return 200 if OTP is valid', async () => {
      sinon.stub(redisClient, 'get').resolves('1234=token123')
      sinon.stub(redisClient, 'del').resolves()

      await twofaVerifyOtp.twofaVerifyOtp(req as Request, res as Response)

      expect((res.status as sinon.SinonStub).calledWith(200)).to.be.true
      expect(
        (res.json as sinon.SinonStub).calledWith({
          jwt: 'token123',
          message: 'Login successful',
        }),
      ).to.be.true

      sinon.restore()
    })
  })
  it('should return 500 if an error occurs', async () => {
    sinon.stub(redisClient, 'get').throws(new Error('Simulated error'))

    await twofaVerifyOtp.twofaVerifyOtp(req as Request, res as Response)
    expect((res.status as sinon.SinonStub).calledWith(500)).to.be.true
    expect(
      (res.json as sinon.SinonStub).calledWith({
        message: 'Internal server error',
      }),
    ).to.be.true
    sinon.restore()
  })
})
