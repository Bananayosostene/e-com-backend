import { expect } from 'chai'
import sinon from 'sinon'
import passport from 'passport'
import User from '../src/database/models/userModel'
import { googleOAuthCallback } from '../src/config/passport'

describe('Passport Configuration', () => {
  describe('Google OAuth Strategy', () => {
    let requestMock: unknown
    let doneSpy: sinon.SinonSpy
    let findOneStub: sinon.SinonStub
    let createStub: sinon.SinonStub
    let findByPkStub: sinon.SinonStub

    beforeEach(() => {
      requestMock = {}
      doneSpy = sinon.spy()
      findOneStub = sinon.stub(User, 'findOne')
      createStub = sinon.stub(User, 'create')
      findByPkStub = sinon.stub(User, 'findByPk')
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should handle case when email is not found in the Google profile', async () => {
      await googleOAuthCallback(
        requestMock,
        'accessToken',
        'refreshToken',
        {
          emails: [],
          provider: '',
          id: '',
          displayName: '',
        },
        doneSpy,
      )

      expect(doneSpy.calledWithMatch(sinon.match.instanceOf(Error))).to.be.true
    })

    it('should authenticate existing user', async () => {
      const existingUser = { id: '1', email: 'existing@example.com' }
      findOneStub.resolves(existingUser)

      await googleOAuthCallback(
        requestMock,
        'accessToken',
        'refreshToken',
        {
          emails: [{ value: 'existing@example.com' }],
          provider: '',
          id: '',
          displayName: '',
        },
        doneSpy,
      )

      expect(doneSpy.calledWith(null, existingUser)).to.be.true
    })

    it('should create a new user if not exists', async () => {
      const newUser = {
        id: '2',
        email: 'new@example.com',
        username: 'New User',
      }
      findOneStub.resolves(null)
      createStub.resolves(newUser)

      await googleOAuthCallback(
        requestMock,
        'accessToken',
        'refreshToken',
        {
          emails: [{ value: 'new@example.com' }],
          name: {
            givenName: 'New',
            familyName: '',
          },
          provider: '',
          id: '',
          displayName: '',
        },
        doneSpy,
      )

      expect(createStub.calledOnce).to.be.true
      expect(doneSpy.calledWith(null, newUser)).to.be.true
    })
    it('should handle errors gracefully', async () => {
      const errorMessage = 'An error occurred'
      const error = new Error(errorMessage)
      findOneStub.rejects(error)

      await googleOAuthCallback(
        requestMock,
        'accessToken',
        'refreshToken',
        {
          emails: [{ value: 'test@example.com' }],
          provider: '',
          id: '',
          displayName: '',
        },
        doneSpy,
      )

      expect(doneSpy.calledWith(error)).to.be.true
    })
  })

  let findByPkStub: sinon.SinonStub
  describe('Serialization and Deserialization', () => {
    beforeEach(() => {
      findByPkStub = sinon.stub(User, 'findByPk')
    })
    afterEach(() => {
      sinon.restore()
    })

    it('should serialize user by id', () => {
      const user = { id: 1 }
      const doneSpy = sinon.spy()
      passport.serializeUser(user, doneSpy)

      expect(doneSpy.calledWith(null, '1')).to.be.false
    })

    it('should deserialize user by id', async () => {
      const user = { id: 1 }
      const doneSpy = sinon.spy()
      findByPkStub.resolves(user)

      await passport.deserializeUser('1', doneSpy)

      expect(doneSpy.calledWith(null, user)).to.be.true
    })
  })
})
