import { expect } from 'chai'
import { passwordExpiry } from '../src/utils/emailTemplates/passwordExpiryTemplate'

describe('passwordExpiry function', () => {
  // Test case 1: Testing with a valid username
  it('should return an email message with the username inserted', () => {
    const username = 'testuser';
    const expectedOutput = `
     <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin:10px">
      <h2 style="">Hello ${username},</h2>
      <p>Your Password on e-commerce website has been expired, Reach out to our website and reset your password</p>
      <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
      <p>Best regards,</p>
      <p>Bitcrafters Andela Team</p>
        </div>`;
    const result = passwordExpiry(username);
    expect(result).to.equal(expectedOutput);
  });

  // Test case 2: Testing with an empty username
  it('should return an email message with empty username if username is not provided', () => {
    const expectedOutput = `
     <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin:10px">
      <h2 style="">Hello ,</h2>
      <p>Your Password on e-commerce website has been expired, Reach out to our website and reset your password</p>
      <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
      <p>Best regards,</p>
      <p>Bitcrafters Andela Team</p>
        </div>`;
    const result = passwordExpiry('');
    expect(result).to.equal(expectedOutput);
  });
});