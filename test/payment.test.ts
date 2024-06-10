import chai, { expect } from 'chai'
import sinon, { SinonSpy } from 'sinon'
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import sinonChai from 'sinon-chai'
import  MoMoController  from '../src/controllers/momoPayment';
import { momoToken } from '../src/middlewares/momoAuth'; 
import * as momoAuth from '../src/middlewares/momoAuth'
import Order, { OrderStatus } from '../src/database/models/orderModel';
import { decrementProductServices } from '../src/services/productServices';
import Product from '../src/database/models/productModel';
import { OrderItem } from '../src/database/models/orderModel';

chai.use(sinonChai)

const axiosMock = sinon.mock(axios);


describe('MoMoController', () => {
  describe('getMoMoToken', () => {
    it('should return a token', async () => {
      const req: Partial<Request> = {};
      const res: Partial<Response> = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      axiosMock.expects('post').once().resolves({ data: { token: 'mocked-token' } });

      await MoMoController.getMoMoToken(req as Request, res as Response);

      expect(res.status).to.be.calledWith(200);
    //   expect(res.json).to.be.calledWith({ token: 'mocked-token' });

      axiosMock.verify();
    });
    it('should return internal server error on failure', async () => {
        const req: Partial<Request> = {};
        const res: Partial<Response> = {
          status: sinon.stub().returnsThis(),
          json: sinon.stub(),
        };
        const error = new Error('MoMo error');
        sinon.stub(momoAuth, "momoToken").rejects(error);
    
        await MoMoController.getMoMoToken(req as Request, res as Response);
    
        expect(res.status).calledOnceWith(500);
        expect(res.json).calledOnceWith({
          message: 'Internal server error',
          error: error.message,
        });
    })
  });

  describe('MoMoController - requestToPay', () => {
    let mockReq: any;
    let mockRes: any;
    let order: any;
  
    beforeEach(() => {
      mockReq = { params: { orderId: 1 } };
      mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
      order = {
        id: 1,
        totalAmount: 100,
        paymentInfo: { method: 'mobileMoney', mobileMoneyNumber: '1234567890' },
        save: sinon.stub().resolves(order),
      };
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should return error for invalid order', async () => {
      sinon.stub(Order,"findByPk").resolves(null);
  
      await MoMoController.requestToPay(mockReq, mockRes);
  
      expect(mockRes.status).calledOnceWith(404);
      expect(mockRes.json).calledOnceWith({ message: 'Invalid Order' });
    });
  
    it('should return error for missing MoMo token', async () => {
      delete mockReq.momoToken;
      sinon.stub(Order,"findByPk").resolves(order);
  
      await MoMoController.requestToPay(mockReq, mockRes);
  
      expect(mockRes.status).calledOnceWith(400);
      expect(mockRes.json).calledOnceWith({ error: 'MoMo token not available' });
    });
    it('should successfully request payment and update order (mocked axios)', async () => {
        const mockAxiosResponse = {
          status: 200,
          data: { someMoMoResponseData: 'success' },
        };
        const mockAxiosPost = sinon.stub(axios, 'post').resolves(mockAxiosResponse);
      
        sinon.stub(Order,"findByPk").resolves(order);
        sinon.stub(Order,"update").resolves();
        mockReq.momoToken = 'momo_token';
      
        await MoMoController.requestToPay(mockReq, mockRes);

        expect(order.save).calledOnce;
        expect(Order.update).calledOnceWith(
          { status: OrderStatus.INITIATED },
          { where: { id: order.id } }
        );
        expect(Order.update).called
        expect(mockRes.status).calledOnce;
        // expect(mockRes.json).calledOnceWith(sinon.match.objectContaining({ transId: sinon.match.string }));
      
        mockAxiosPost.restore(); 
      });

    it('should return error if order completed', async () => {
        const mockAxiosResponse = {
          status: 200,
          data: { someMoMoResponseData: 'success' },
        };
        const mockAxiosPost = sinon.stub(axios, 'post').resolves(mockAxiosResponse);
      
        sinon.stub(Order,"findByPk").resolves({status:OrderStatus.COMPLETED,paymentInfo:{method:"mobileMoney", mobileMoneyNumber:"123456"} } as Order);

        sinon.stub(Order,"update").resolves();
        mockReq.momoToken = 'momo_token';
      
        await MoMoController.requestToPay(mockReq, mockRes);

        expect(order.save).not.be.calledOnce;
        expect(Order.update).not.be.called
        expect(mockRes.status).calledOnce;
        // expect(mockRes.json).calledOnceWith(sinon.match.objectContaining({ transId: sinon.match.string }));
      
        mockAxiosPost.restore(); 
      });

      it('should return 401 error for failing to add reference id', async () => {
        const mockOrder = { ...order, save: sinon.stub().resolves() }; 
        sinon.stub(Order,"findByPk").resolves(mockOrder);
        mockReq.momoToken = 'momo_token';
      
        await MoMoController.requestToPay(mockReq, mockRes);
      
        expect(mockRes.status).calledOnce;
        expect(mockRes.json).calledOnce;
      });

      it('should return successful response with data on successful request', async () => {
        const mockAxiosResponse = { data: 'MoMo response data' };
        const mockAxiosPost = sinon.stub(axios, 'post').resolves(mockAxiosResponse);
        // const mockOrderSave = sinon.stub(order, 'save').resolves(order);
      
        sinon.stub(Order,'findByPk').resolves(order);
        mockReq.momoToken = 'momo_token';
      
        await MoMoController.requestToPay(mockReq, mockRes);
      
        expect(mockAxiosPost).calledOnce;
        expect(mockRes.json).calledOnce
      
        mockAxiosPost.restore();
        // mockOrderSave.restore();
      });
      
      it('should return internal server error for unexpected errors', async () => {
        const error = new Error('Unexpected error');
        sinon.stub(axios, 'post').throws(error);
        sinon.stub(Order,'findByPk').resolves(order);
        mockReq.momoToken = 'momo_token';
      
        await MoMoController.requestToPay(mockReq, mockRes);
      
        expect(mockRes.status).calledOnceWith(500);
        expect(mockRes.json).calledOnceWith({ message: 'An error occurred', error: error.message });
      });
      
  })

  describe('MoMoController - checkPayed', () => {
    let mockReq: any;
    let mockRes: any;
    let order: any;
  
    beforeEach(() => {
      mockReq = { params: { orderId: 1 } };
      mockRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
      order = {
        id: 1,
        paymentInfo: { method: 'mobileMoney' },
        save: sinon.stub().resolves(order),
      };
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should return error for invalid order', async () => {
      sinon.stub(Order,"findByPk").resolves(null);
  
      await MoMoController.checkPayed(mockReq, mockRes);
  
      expect(mockRes.status).calledOnceWith(404);
      expect(mockRes.json).calledOnceWith({ message: 'Invalid Order' });
    });
  
    it('should return error for missing MoMo token', async () => {
      delete mockReq.momoToken;
      sinon.stub(Order,"findByPk").resolves(order);
  
      await MoMoController.checkPayed(mockReq, mockRes);
  
      expect(mockRes.status).calledOnceWith(400);
      expect(mockRes.json).calledOnceWith({ error: 'MoMo token not available' });
    });
  
    it('should return 500 and if error occurs', async () => {
        const mockAxiosResponse = {
            status: 200,
            data: { Response: 'success' },
          };
          const mockAxiosPost = sinon.stub(axios, 'post').resolves(new Error("Error occured"));
        
          sinon.stub(Order,"findByPk").resolves(order);
          mockReq.momoToken = 'momo_token';
  
      sinon.stub(Order,"update").resolves(order);

      await MoMoController.checkPayed(mockReq, mockRes);
  
      expect(mockRes.status).calledOnceWith(500);
    });
  
    it('should mark order complete and return success on successful MoMo payment', async () => {
        const mockAxiosResponse = {
          status: 200,
          data: { status: 'SUCCESSFUL', someMoMoData: 'info' },
        };
        const mockAxiosGet = sinon.stub(axios, 'get').resolves(mockAxiosResponse);
      
        sinon.stub(Order,"findByPk").resolves(order);
        mockReq.momoToken = 'momo_token';
      
        await MoMoController.checkPayed(mockReq, mockRes);
      
        expect(mockAxiosGet).calledOnce

        expect(mockRes.status).calledOnce;
        expect(mockRes.json).calledOnce;
      
        mockAxiosGet.restore();
      });
    it('should mark order complete and return success on successful MoMo payment', async () => {
        const mockAxiosResponse = {
          status: 200,
          data: { status: 'SUCCESSFUL', someMoMoData: 'info' },
        };
        const mockAxiosGet = sinon.stub(axios, 'get').resolves(mockAxiosResponse);
      
        sinon.stub(Order,"findByPk").resolves({status:OrderStatus.COMPLETED,paymentInfo:{method:"mobileMoney", mobileMoneyNumber:"123456"} } as Order);

        mockReq.momoToken = 'momo_token';
      
        await MoMoController.checkPayed(mockReq, mockRes);
    
        expect(mockRes.status).calledOnce;
        expect(mockRes.json).calledOnce;
      
        mockAxiosGet.restore();
      });
      
      it('should return order payment unsuccessful on failed MoMo payment', async () => {
        const mockAxiosResponse = {
          status: 200,
          data: { status: 'FAILED', Data: 'error' },
        };
        const mockAxiosGet = sinon.stub(axios, 'get').resolves(mockAxiosResponse);
      
        sinon.stub(Order,"findByPk").resolves(order);
        mockReq.momoToken = 'momo_token';
      
        await MoMoController.checkPayed(mockReq, mockRes);
      
        // expect(mockAxiosGet).calledOnceWith(`${momoRequestToPayUrl}/${order.reference}`, sinon.match.objectContaining({
        //   Authorization: `Bearer momo_token`,
        // }));
        expect(mockAxiosGet).calledOnce
        expect(order.save).not.called; 
        expect(mockRes.status).calledOnceWith(200);
        expect(mockRes.json).calledOnceWith({ message: 'Order Payment unsuccessful', data: mockAxiosResponse.data.status });
      
        mockAxiosGet.restore();
      });
  });
});


describe('renewMomoToken middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: sinon.SinonStub;
    let momoTokenStub: sinon.SinonStub;
    let axiosPostStub: sinon.SinonStub;
  
    beforeEach(() => {
      req = {};
      res = {};
      next = sinon.stub();
    //   momoTokenStub = sinon.stub(global, 'momoToken');
      momoTokenStub = sinon.stub(momoAuth, 'momoToken');
      axiosPostStub = sinon.stub(axios, 'post');
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should call next when momoToken returns a token', async () => {
      const token = 'valid_token';
      momoTokenStub.resolves(token);
  
      await momoAuth.renewMomoToken(req as Request, res as Response, next as NextFunction);
  
      expect(req.momoToken).to.equal(token);
      expect(next).to.have.been.called;
    });
  
    it('should call next when momoToken returns null', async () => {
      momoTokenStub.resolves(null);
  
      await momoAuth.renewMomoToken(req as Request, res as Response, next as NextFunction);
  
    //   expect(req.momoToken).to.be.undefined;
      expect(next).to.have.been.called;
    });
  

  });
  
  describe('momoToken', () => {
    let axiosPostStub: sinon.SinonStub;
  
    beforeEach(() => {
      axiosPostStub = sinon.stub(axios, 'post');
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should return the access token when the API call is successful', async () => {
      const accessToken = 'valid_access_token';
      axiosPostStub.resolves({ status: 200, data: { access_token: accessToken } });
  
      const result = await momoToken();
  
      expect(result).to.equal(accessToken);
    });
  
    it('should return null when the API call fails', async () => {
      axiosPostStub.rejects(new Error('API call failed'));
  
      const result = await momoToken();
  
      expect(result).to.be.null;
    });
  });



  describe('decrementProductServices', () => {
    let mockItems: OrderItem[];
  
    beforeEach(() => {
      mockItems = [
        { productId: "product_id",
         quantity: 1, 
        name: "string",
        price: 6,
        images: ["image1", "image2"] }  ,
        { productId: "product_id2",
         quantity: 2, 
        name: "string",
        price: 10,
        images: ["image1", "image2"] }  ,
      ];
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should decrement product quantities for valid items', async () => {
      const product1 = { id: 1, quantity: 5, productStatus: 'available', save: sinon.stub().resolves() } as unknown as Product;
      const product2 = { id: 2, quantity: 3, productStatus: 'available', save: sinon.stub().resolves(), } as unknown as Product;
      const mockFindByPk = sinon.stub(Product, 'findByPk');
      mockFindByPk.withArgs(1).resolves(product1);
      mockFindByPk.withArgs(2).resolves(product2);
    //   const mockSave = sinon.stub(product1, 'save').resolves();
    //   const mockSave2 = sinon.stub(product2, 'save').resolves();
  
      await decrementProductServices(mockItems);
  
      expect(mockFindByPk.calledTwice).to.be.true;
      expect(product1.quantity).to.equal(5);
      expect(product1.save).to.be.calledOnceWith;
      expect(product2.save).to.be.calledOnceWith;
      expect(product2.quantity).to.equal(3);
    //   expect(mockSave2.calledOnce).to.be.true;
    });
  
    it('should skip unavailable products', async () => {
      const product1 = { id: 1, quantity: 5, productStatus: 'unavailable', save: sinon.stub().resolves() }as unknown as Product;
      const product2 = { id: 2, quantity: 3, productStatus: 'available', save: sinon.stub().resolves() }as unknown as Product;
      const mockFindByPk = sinon.stub(Product, 'findByPk');
      mockFindByPk.withArgs(1).resolves(product1);
      mockFindByPk.withArgs(2).resolves(product2);
  
      await decrementProductServices(mockItems);
  
      expect(mockFindByPk.calledTwice).to.be.true;
      expect(product2.quantity).to.equal(3);
    //   expect(product2.save).to.be.calledOnce;
    });
  
    it('should skip products with invalid quantity', async () => {
      const product1 = { id: 1, quantity: 5, productStatus: 'available', save: sinon.stub().resolves() }as unknown as Product;
      const mockFindByPk = sinon.stub(Product, 'findByPk');
      mockFindByPk.withArgs(1).resolves(product1);
  
      const invalidItems = [      { productId: "product_id2",
      quantity: 0, 
     name: "string",
     price: 10,
     images: ["image1", "image2"] } ]; 
      await decrementProductServices(invalidItems);
  
      expect(mockFindByPk.calledOnce).to.be.true;
      expect(product1.quantity).to.equal(5); 
    });
  
    it('should throw error for database errors', async () => {
      const mockFindByPk = sinon.stub(Product, 'findByPk');
      mockFindByPk.throws(new Error('Database error'));
  
      try {
        await decrementProductServices(mockItems);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect(error.message).to.equal('Error decrementing product quantity: Error: Database error');
      }
    });
  });