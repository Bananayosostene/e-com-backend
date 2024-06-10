import { expect } from 'chai'
import bcrypt from 'bcrypt'
import { hashPassword, comparePassword } from '../src/utils/passwords'

describe('Password utility functions', () => {
  describe('hashPassword function', () => {
    it('should hash a password', async () => {
      const password = 'password123'
      const hashedPassword = await hashPassword(password)
      expect(hashedPassword).to.be.a('string')
      expect(hashedPassword).to.not.equal(password)
    })
    it('should use custom SLASH_ROUNDS ', async () => {
      process.env.SLAT_ROUND = '10'
      const password = 'password123'
      const hashedPassword = await hashPassword(password)
      expect(hashedPassword).to.be.a('string')
      expect(hashedPassword).to.not.equal(password)
      delete process.env.SLAT_ROUND
    })
    it('should use default slatRounds', async () => {
      delete process.env.SLAT_ROUND
      const password = 'password123'
      const hashedPassword = await hashPassword(password)
      expect(hashedPassword).to.be.a('string')
      expect(hashedPassword).to.not.equal(password)
    })
  })

  describe('comparePassword function', () => {
    it('should return true for matching passwords', async () => {
      const password = 'password123'
      const hashedPassword = await bcrypt.hash(password, 10)
      const result = await comparePassword(password, hashedPassword)
      expect(hashPassword).to.not.equal(password)
      expect(result).to.be.equal(true)
    })

    it('should return false for non-matching passwords', async () => {
      const password = 'password123'
      const incorrectPassword = 'wrongpassword'
      const hashedPassword = await bcrypt.hash(password, 10)
      const result = await comparePassword(incorrectPassword, hashedPassword)
      expect(result).to.be.equal(false)
    })
  })
})
