import { expect } from 'chai'
import {
  verificationsEmailTemplate,
  successfulCreationTemplate,
} from '../src/utils/emailTemplates'

describe('verificationsEmailTemplate', () => {
  it('should return the correct email template', () => {
    const username = 'John Doe'

    const baseUrl = 'https://example.com/verify?token=abc123'

    const actualTemplate = verificationsEmailTemplate(username, baseUrl)

    expect(actualTemplate).to.be.a('string')
  })
})

describe('successfulCreationTemplate', () => {
  it('should return a string', () => {
    const actualTemplate = successfulCreationTemplate()

    expect(actualTemplate).to.be.a('string')
  })
})
