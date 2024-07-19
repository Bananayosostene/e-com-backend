import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import {
    getAllorders,
    getorder,
    updateproductorder,
    getSingleUserOrder,
    getUserOrders,
  } from '../src/controllers/orderController'
import User from '../src/database/models/userModel';
import Order from '../src/database/models/orderModel';
import moment from 'moment';
import { Op } from 'sequelize';
import ProductController from '../src/controllers/productController';
import  Product  from '../src/database/models/productModel';
import * as productUtils from '../src/services/productServices';

describe('Order Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    req = {
      user: { id: '123' } as unknown as User,
      params: {}
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getUserOrders', () => {
    it('should return 200 and orders when user has orders', async () => {
      const mockOrders = [{ id: '1', userId: '123' }, { id: '2', userId: '123' }] as unknown as Order;
      sandbox.stub(Order, 'findAll').resolves(mockOrders as any);

      await getUserOrders(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        message: 'Orders retrieved successful',
        orders: mockOrders
      });
    });

    it('should return 404 when user has no orders', async () => {
      sandbox.stub(Order, 'findAll').resolves(null);

      await getUserOrders(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.json).to.have.been.calledWith({ message: 'User has no orders' });
    });

    it('should return 500 when there is a server error', async () => {
      sandbox.stub(Order, 'findAll').rejects(new Error('Database error'));

      await getUserOrders(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith('Database error');
    });
  });

  describe('getSingleUserOrder', () => {
    beforeEach(() => {
      req.params = { orderId: '1' };
    });

    it('should return 200 and order when order exists', async () => {
      const mockOrder = { id: '1', userId: '123' };
      sandbox.stub(Order, 'findOne').resolves(mockOrder as any);

      await getSingleUserOrder(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        message: 'Order retrieved successful',
        order: mockOrder
      });
    });

    it('should return 404 when order does not exist', async () => {
      sandbox.stub(Order, 'findOne').resolves(null);

      await getSingleUserOrder(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.json).to.have.been.calledWith({ message: 'User has no orders' });
    });

    it('should return 500 when there is a server error', async () => {
      sandbox.stub(Order, 'findOne').rejects(new Error('Database error'));

      await getSingleUserOrder(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith('Database error');
    });
  });
});



// **********************************



describe('ProductController', () => {
  describe('listUserProducts', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
      req = {
        query: {}
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return products with default pagination', async () => {
      const mockProducts = [{ id: 1, name: 'Product 1' }, { id: 2, name: 'Product 2' }];
      sandbox.stub(productUtils, 'getProductCount').resolves(10);
      sandbox.stub(Product, 'findAll').resolves(mockProducts as any);

      await ProductController.listUserProducts(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        message: 'Products retrieved successfully',
        products: mockProducts,
        pagination: { limit: 5, page: 1, totalPages: 2 }
      });
    });

    it('should return products with custom pagination', async () => {
      req.query = { page: '2', limit: '3' };
      const mockProducts = [{ id: 4, name: 'Product 4' }, { id: 5, name: 'Product 5' }, { id: 6, name: 'Product 6' }];
      sandbox.stub(productUtils, 'getProductCount').resolves(10);
      sandbox.stub(Product, 'findAll').resolves(mockProducts as any);

      await ProductController.listUserProducts(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        message: 'Products retrieved successfully',
        products: mockProducts,
        pagination: { limit: 3, page: 2, totalPages: 4 }
      });
    });

    it('should return 400 for invalid pagination parameters', async () => {
      req.query = { page: '-1', limit: 'invalid' };

      await ProductController.listUserProducts(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(400);
      expect(res.json).to.have.been.calledWith({ message: 'Invalid pagination parameters' });
    });

    it('should return 500 for internal server error', async () => {
      sandbox.stub(productUtils, 'getProductCount').throws(new Error('Database error'));

      await ProductController.listUserProducts(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith({
        message: 'Internal server error',
        error: 'Database error'
      });
    });

    it('should query products with correct parameters', async () => {
      const findAllStub = sandbox.stub(Product, 'findAll').resolves([]);
      sandbox.stub(productUtils, 'getProductCount').resolves(0);

      await ProductController.listUserProducts(req as Request, res as Response);

      const currentDate = moment().format('YYYY-MM-DD HH:mm:ssZ');
      expect(findAllStub).to.have.been.calledWith({
        where: {
          productStatus: 'available',
          expiryDate: {
            [Op.gt]: currentDate,
          },
        },
        offset: 0,
        limit: 5,
      });
    });
  });
});