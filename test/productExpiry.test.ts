import { expect } from 'chai';
import sinon, { SinonSandbox } from 'sinon';
import cron from 'node-cron';
import { Op } from 'sequelize';
import Product from '../src/database/models/productModel';
import User from '../src/database/models/userModel';
import notifyProductExpiry from '../src/utils/productExpiryNotify';
import logger from '../src/utils/logger';
import productExpiryCron from '../src/controllers/productExpiryCronJob';
import { CRON_TIME } from '../src/config/index'

describe('productExpiryCron', () => {
  let cronScheduleStub: sinon.SinonStub;
  let productFindAllStub: sinon.SinonStub;
  let productUpdateStub: sinon.SinonStub;
  let notifyProductExpiryStub: sinon.SinonStub;
  let loggerStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    cronScheduleStub = sinon.stub(cron, 'schedule');
    productFindAllStub = sinon.stub(Product, 'findAll');
    productUpdateStub = sinon.stub(Product, 'update');
    notifyProductExpiryStub = sinon.stub(notifyProductExpiry) as any;
    loggerStub = sinon.stub(logger, 'log');
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    cronScheduleStub.restore();
    productFindAllStub.restore();
    productUpdateStub.restore();
  // notifyProductExpiryStub.restore();
    loggerStub.restore();
    sandbox.restore();
  });

  it('should schedule a cron job with the correct CRON_TIME', async () => {
    const product = {
      name: 'Test Product',
      sellerId: 1,
      expiryDate: new Date(),
    };

    productExpiryCron();
    notifyProductExpiry(product as any);

    expect(cronScheduleStub.calledOnce).to.be.true;
    expect(productUpdateStub.called).to.be.false;
    expect(cronScheduleStub.firstCall.args[0]).to.equal(CRON_TIME);
    expect(notifyProductExpiryStub.called).to.be.undefined;
  });
});

describe('notifyProductExpiry', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should send email notification for expired product', async () => {
    const product = {
      name: 'Test Product',
      sellerId: 1,
      expiryDate: new Date(),
    };

    const seller = {
      id: 1,
      name: 'Test Seller',
      email: 'test@example.com',
    };

    sandbox.stub(User, 'findOne').resolves(seller as any);

    await notifyProductExpiry(product as any);

    const sendEmailStub = sinon.stub().resolves();
  }).timeout(10000);

  it('should log error if seller is not found', async () => {
    const product = {
      name: 'Test Product',
      sellerId: 1,
      expiryDate: new Date(),
    };

    sandbox.stub(User, 'findOne').resolves(null);
    const consoleErrorStub = sandbox.stub(console, 'error');

    await notifyProductExpiry(product as any);

    expect(consoleErrorStub.calledOnce).to.be.true;
    expect(
      consoleErrorStub.calledWith(
        `Seller not found for product ${product.name}`
      )
    ).to.be.true;
  });
});
