import chai from 'chai'
import chaiHttp from 'chai-http'
import bcrypt from 'bcryptjs'
import { app, server } from '../index'
import sequelizeConnection from '../src/database/config/db.config'
import User from '../src/database/models/userModel'
import redisClient from '../src/utils/redisConfiguration'

chai.should()
chai.use(chaiHttp)
const { expect } = chai

let token: string

const existingUser = {
  username: 'Test',
  email: 'topvery@gmail.com',
  password: '',
}
const notVerifiedUser = {
  username: 'Unverified',
  email: 'nottverified@gmail.com',
  password: '12345678',
}
const verifiedUser = {
  email: 'user7@gmail.com',
  password: 'user12345',
}

before(async function setup() {
  this.timeout(100000)
  await sequelizeConnection.authenticate()
  existingUser.password = await bcrypt.hash('Testing123', 10)
  const user = await User.findOne({ where: { email: existingUser.email } })
  if (!user) {
    await User.create(existingUser)
  }
})

describe('Login Controller', () => {
  it('Should return a 400 status code indicating bad request with invalid request body', (done) => {
    chai
      .request(app)
      .post('/users/login')
      .send({ email: 'invalidemail@example.com' })
      .end((err, res) => {
        expect(res).to.have.status(400)
        done()
      })
  })

  it('Should return a 401 status code indicating invalid email with non-existing email', (done) => {
    chai
      .request(app)
      .post('/users/login')
      .send({ email: 'nonexisting@example.com', password: 'password' })
      .end((err, res) => {
        expect(res).to.have.status(404)
        done()
      })
  })
  it('Should return a 401 status code indicating invalid password with existing email and incorrect password', (done) => {
    chai
      .request(app)
      .post('/users/login')
      .send({ email: existingUser.email, password: 'incorrectpassword' })
      .end((err, res) => {
        expect(res).to.have.status(401)
        done()
      })
  })

  it('Should return a 200 status code indicating successful login with correct email and password', (done) => {
    chai
      .request(app)
      .post('/users/login')
      .send({ email: existingUser.email, password: '12345678' })
      .end((err, res) => {
        expect(res).to.have.status(200)
        done()
      })
  })

  it('should return 401 if user is not verified', async () => {
    const res = await chai.request(app).post('/users/login').send({
      email: notVerifiedUser.email,
      password: notVerifiedUser.password,
    })
    expect(res).to.have.status
  })
})
