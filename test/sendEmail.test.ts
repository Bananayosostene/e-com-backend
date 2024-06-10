import { expect } from 'chai'
import nodemailer from 'nodemailer'
import sinon from 'sinon'
import sendMail from '../src/utils/sendEmail'

describe('sendMail function', () => {
  let mockTransport: sinon.SinonStub

  beforeEach(() => {
    mockTransport = sinon.stub().returns({
      sendMail: sinon.stub().resolves(),
    })
    sinon.replace(nodemailer, 'createTransport', mockTransport)
  })

  afterEach(() => {
    sinon.restore()
  })

  it('sends an email with a valid port number', async () => {
    process.env.NODEMAILER_EMAIL_PORT = '587'
    await sendMail(
      'test@example.com',
      'Test Email',
      '<h1>This is a test email</h1>',
    )
  })

  it('sends an email with an empty port number', async () => {
    process.env.NODEMAILER_EMAIL_PORT = ''
    await sendMail(
      'test@example.com',
      'Test Email',
      '<h1>This is a test email</h1>',
    )
    expect(mockTransport).to.be.called
  })

  it('sends an email with an invalid port number', async () => {
    process.env.NODEMAILER_EMAIL_PORT = 'invalid'
    await sendMail(
      'test@example.com',
      'Test Email',
      '<h1>This is a test email</h1>',
    )
    expect(mockTransport).to.be.called
  })

  it('throws an error when sending the email fails', async () => {
    const error = new Error('Failed to send email')
    mockTransport.returns({
      sendMail: sinon.stub().throws(error),
    })

    try {
      await sendMail(
        'test@example.com',
        'Test Email',
        '<h1>This is a test email</h1>',
      )
    } catch (err) {
      expect(err).to.be.an.instanceOf(Error)
      expect(err.message).to.be.a('string')
    }
  })
})
