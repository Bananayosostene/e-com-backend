import { expect } from 'chai';
import statusDisactivation from '../src/utils/emailTemplates/enableUserTemplate';

describe('statusDisactivation', () => {
  it('should return a string containing the user name', () => {
    const userName = 'John Doe';
    const result = statusDisactivation(userName);
    
    expect(result).to.be.a('string');
    expect(result).to.include(`Dear ${userName},`);
  });

  it('should contain the correct HTML structure', () => {
    const userName = 'Jane Smith';
    const result = statusDisactivation(userName);
    
    const expectedHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin:10px">
        <h2 style="">Dear ${userName},</h2>
        <p>We are happy to tell you that you have been enabled to use our e-commerce bitcrafters website</p>
        <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
        <p>Best regards,</p>
        <p>Bitcrafters Andela Team</p>
      </div>
    `;
    
    expect(result.replace(/\s+/g, '')).to.equal(expectedHtml.replace(/\s+/g, ''));
  });
});