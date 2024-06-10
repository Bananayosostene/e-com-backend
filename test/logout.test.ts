
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import { Request, Response } from 'express';
import LoginController from '../src/controllers/LoginController'
import redisClient from '../src/utils/redisConfiguration'; 
import cartControler from '../src/controllers/cartController'; 
import Cart from '../src/database/models/cartModel'; 
import Product from '../src/database/models/productModel';
import { CartItem } from './../src/database/models/cartModel';
import cron from 'node-cron';
import { Op } from 'sequelize';
import productExpiryCron from '../src/controllers/productExpiryCronJob'; 
import notifyProductExpiry from '../src/utils/productExpiryNotify'; 
import logger from '../src/utils/logger'; 
import { CRON_TIME } from '../src/config';
import Order, { OrderStatus } from '../src/database/models/orderModel'; 
import OrderService from '../src/services/orderService'; 

describe('LoginController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let redisExistsStub: sinon.SinonStub;
  let redisDelStub: sinon.SinonStub;

  beforeEach(() => {
    req = {
      user: { id: 1 },
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
      removeHeader: sinon.stub(),
    };
    redisExistsStub = sinon.stub(redisClient, 'exists');
    redisDelStub = sinon.stub(redisClient, 'del');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('logOut', () => {
    it('should logout successfully if token exists', async () => {
      redisExistsStub.resolves(1); // Simulate token exists
      redisDelStub.resolves(1); // Simulate successful deletion

      await LoginController.logOut(req as Request, res as Response);

      expect(redisExistsStub).to.be.calledWith('user:1');
      expect(redisDelStub).to.be.calledWith('user:1');
      expect(res.removeHeader).to.be.calledWith('authorization');
      expect(res.status).to.be.calledWith(200);
      expect(res.json).to.be.calledWith({ message: 'Logout successfully' });
    });

    it('should return 401 if token does not exist', async () => {
      redisExistsStub.resolves(0); // Simulate token does not exist

      await LoginController.logOut(req as Request, res as Response);

      expect(redisExistsStub).to.be.calledWith('user:1');
      expect(redisDelStub).not.to.be.called;
      expect(res.status).to.be.calledWith(401);
      expect(res.json).to.be.calledWith({ message: 'Already logged out' });
    });

    // it('should handle errors', async () => {
    //   redisExistsStub.rejects(new Error('Redis error'));

    //   await LoginController.logOut(req as Request, res as Response);

    //   expect(res.status).to.be.calledWith(500);
    //   expect(res.json).to.be.calledWithMatch({ message: 'Internal server error' });
    // });
  });
});


// ======================= PRODUCT CRON JOB ====================================


  describe('productExpiryCron', () => {
    let cronScheduleStub: sinon.SinonStub;
    let productFindAllStub: sinon.SinonStub;
    let productUpdateStub: sinon.SinonStub;
    let notifyProductExpiryStub: sinon.SinonStub;
    let loggerStub: sinon.SinonStub;
  
    beforeEach(() => {
      cronScheduleStub = sinon.stub(cron, 'schedule');
      productFindAllStub = sinon.stub(Product, 'findAll');
      productUpdateStub = sinon.stub(Product.prototype, 'update');
    //   notifyProductExpiryStub = sinon.stub(notifyProductExpiry, 'default');
      loggerStub = sinon.stub(logger, 'log');
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should schedule a cron job with the correct time', () => {
      productExpiryCron();
  
      expect(cronScheduleStub).to.be.calledOnce;
      expect(cronScheduleStub.firstCall.args[0]).to.equal(CRON_TIME);
    });
  
  
    it('should mark products as expired and notify if they are not already expired', async () => {
      const mockProduct = {
        expired: false,
        update: productUpdateStub,
      };
      productFindAllStub.resolves([mockProduct]);
  
      productExpiryCron();
      const cronCallback = cronScheduleStub.firstCall.args[1];
  
      await cronCallback();
  
      expect(productFindAllStub).to.be.calledWith({
        where: { expiryDate: { [Op.lt]: sinon.match.date } },
      });
      expect(productUpdateStub).to.be.calledTwice;
    });
  
  });

//   =================================== change Order status ==================================

describe('OrderService.updateOrderStatus', () => {
    let findByPkStub: sinon.SinonStub;
    let saveStub: sinon.SinonStub;
  
    beforeEach(() => {
      findByPkStub = sinon.stub(Order, 'findByPk');
      saveStub = sinon.stub(Order.prototype, 'save');
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should return null if the order does not exist', async () => {
      findByPkStub.resolves(null);
  
      const result = await OrderService.updateOrderStatus('non-existent-id', OrderStatus.PENDING);
  
      expect(result).to.be.null;
      expect(findByPkStub).to.be.calledOnceWith('non-existent-id');
    });
  
    it('should update the order status and save the order', async () => {
      const mockOrder = {
        id: 'order-id',
        status: OrderStatus.PENDING,
        save: saveStub,
        deliveryInfo:{
            deliveryDate:new Date()
        }
      } as unknown as Order;
      findByPkStub.resolves(mockOrder);
  
      const result = await OrderService.updateOrderStatus('order-id', OrderStatus.COMPLETED);
  
      expect(result).to.equal(mockOrder);
      expect(mockOrder.status).to.equal(OrderStatus.COMPLETED);
      expect(saveStub).to.be.calledOnce;
    });
  
    it('should update the order status to COMPLETED and set the delivery date', async () => {
      const mockOrder = {
        id: 'order-id',
        status: OrderStatus.PENDING,
        deliveryInfo: { deliveryDate: '' },
        save: saveStub,
      };
      findByPkStub.resolves(mockOrder);
  
      const result = await OrderService.updateOrderStatus('order-id', OrderStatus.COMPLETED);
  
      expect(result).to.equal(mockOrder);
      expect(mockOrder.status).to.equal(OrderStatus.COMPLETED);
      const expectedDeliveryDate = new Date();
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 10);
      expect(mockOrder.deliveryInfo.deliveryDate).to.equal(expectedDeliveryDate.toISOString().split('T')[0]);
      expect(saveStub).to.be.calledOnce;
    });
  });