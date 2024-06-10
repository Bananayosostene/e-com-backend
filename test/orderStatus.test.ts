import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import Order, { OrderStatus } from '../src/database/models/orderModel';
import { getorder, updateproductorder } from '../src/controllers/orderController';
import OrderService from '../src/services/orderService';
import eventEmitter from '../src/services/notificationServices';

describe('updateproductorder', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusStub: sinon.SinonStub;
  let jsonStub: sinon.SinonStub;


  beforeEach(() => {
    req = {
      params: { orderId: '1' },
      body: { status: 'shipped' }
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };

    statusStub = res.status as sinon.SinonStub;
    jsonStub = res.json as sinon.SinonStub;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 404 if order is not found', async () => {
    sinon.stub(Order, 'findByPk').resolves(null);

    await updateproductorder(req as Request, res as Response);

    expect(statusStub.calledOnceWith(404)).to.be.true;
    expect(jsonStub.calledOnceWith({ message: 'Order not found' })).to.be.true;
  });

  it('should update the order status and return 200', async () => {
    const orderMock = { userId: 'user1', update: sinon.stub() } as unknown as  Order;
    sinon.stub(Order, 'findByPk').resolves(orderMock);
    const updateOrderStatusStub = sinon.stub(OrderService, 'updateOrderStatus').resolves();
    const emitStub = sinon.stub(eventEmitter, 'emit');

    await updateproductorder(req as Request, res as Response);

    expect(updateOrderStatusStub.calledOnce).to.be.true;
    expect(emitStub.calledOnceWith('order:updatedStatus', orderMock)).to.be.true;
    expect(statusStub.calledOnceWith(200)).to.be.true;
  });

  it('should return 500 if there is an error', async () => {
    const error = new Error('Something went wrong');
    sinon.stub(Order, 'findByPk').throws(error);

    await updateproductorder(req as Request, res as Response);

    expect(statusStub.calledOnceWith(500)).to.be.true;
    expect(jsonStub.calledOnceWith('Something went wrong')).to.be.true;
  });
});

describe('getorder', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusStub: sinon.SinonStub;
  let jsonStub: sinon.SinonStub;
  let findByPkStub: sinon.SinonStub;
  

  beforeEach(() => {
    req = {
      user: { id: 1}
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };

    statusStub = res.status as sinon.SinonStub;
    jsonStub = res.json as sinon.SinonStub;
    findByPkStub = sinon.stub(Order, 'findByPk')
    
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 404 if order is not found', async () => {
    sinon.stub(Order, 'findOne').resolves(null);

    await getorder(req as Request, res as Response);

    expect(statusStub.calledOnceWith(404)).to.be.true;
    expect(jsonStub.calledOnceWith({ message: 'Order not found' })).to.be.true;
  });

  it('should return 200 and the order if found', async () => {
    const orderMock = { id: 'order1', userId: 1 } as unknown as Order;
    sinon.stub(Order, 'findOne').resolves(orderMock);

    await getorder(req as Request, res as Response);

    expect(statusStub.calledOnceWith(200)).to.be.true;
    expect(jsonStub.calledOnceWith({ message: 'Order retrieved successful', order: orderMock })).to.be.true;
  });

  it('should return 500 if there is an error', async () => {
    const error = new Error('Something went wrong');
    sinon.stub(Order, 'findOne').throws(error);

    await getorder(req as Request, res as Response);

    expect(statusStub.calledOnceWith(500)).to.be.true;
    expect(jsonStub.calledOnceWith('Something went wrong')).to.be.true;
  });
  it('Orderservice should process the payment and update the order status successfully', async () => {
    req.params = { orderId: 'orderId' }
    req.body = { currency: 'usd', paymentMethodId: 'pm_card_visa' }
    req.user = { id: 123 }

    const order = {
      id: 'orderId',
      userId: 123,
      totalAmount: 100,
      status: OrderStatus.PENDING,
      orderNumber: 'ECB123456',
      expectedDeliveryDate: new Date(),
      save: sinon.stub().resolves(),
    }

    findByPkStub.resolves(order)
    await OrderService.updateOrderStatus('orderId', OrderStatus.PENDING)
    const expectedDeliveryDate = new Date()
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 10)

    expect(order.status).to.equal(OrderStatus.PENDING)
    expect(order.save).to.have.been.calledOnce
  })
});
