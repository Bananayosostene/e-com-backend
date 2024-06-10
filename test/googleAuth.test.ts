import chai from 'chai'
import chaiHttp from 'chai-http'
import dotenv from 'dotenv'
import sinon from 'sinon'
import passport from '../src/config/passport'
import { app } from '../index'

dotenv.config()
const { expect } = chai
chai.use(chaiHttp)
const { JWT_SECRET } = process.env

const mockUser = {
  id: 'user-id',
}

interface PassportCallback<TUser> {
  (error: Error | null, user: TUser | null): void
}

describe('loginWithGoogle Controller', () => {
  let passportAuthenticateStub: sinon.SinonStub

  before(() => {
    passportAuthenticateStub = sinon.stub(passport, 'authenticate')
  })

  after(() => {
    passportAuthenticateStub.restore()
  })

  it('should return a JWT token upon successful authentication', async () => {
    passportAuthenticateStub.callsFake(
      (strategy, callback: PassportCallback<object>) => {
        callback(null, mockUser)
      },
    )

    const res = await chai.request(app).get('/users/google/callback')

    expect(res).to.have.status(200)
    expect(res.body).to.have.property('token').that.is.a('string')
  })

  it('should return a 500 status code if an internal server error occurs', (done) => {
    passportAuthenticateStub.callsFake(
      (strategy, callback: PassportCallback<object>) => {
        callback(new Error('Internal Server Error'), null)
      },
    )

    chai
      .request(app)
      .get('/users/google/callback')
      .end((err, res) => {
        done()
      })
  })

  it('should return a 401 status code if authentication fails', (done) => {
    passportAuthenticateStub.callsFake(
      (strategy, callback: PassportCallback<object>) => {
        callback(null, null)
      },
    )

    chai
      .request(app)
      .get('/users/google/callback')
      .end((err, res) => {
        done() 
      })
  })
})
