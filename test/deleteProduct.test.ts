import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import ProductController from '../src/controllers/productController';
import * as productService from '../src/services/productServices';


describe('deleteProduct', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let getProductByIdStub: sinon.SinonStub;
  let deleteProductByIdStub: sinon.SinonStub;

  beforeEach(() => {
    req = {
      params: { itemId: '1' },
      user: { id: 1 }
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };

    getProductByIdStub = sinon.stub(productService, 'getProductById');
    deleteProductByIdStub = sinon.stub(productService, 'deleteProductById');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should delete the product and return a success message', async () => {
    const product = { id: '1', name: 'Test Product' };

    getProductByIdStub.resolves(product);
    deleteProductByIdStub.resolves(1);

    await ProductController.deleteProduct(req as Request, res as Response);

    expect(getProductByIdStub.called);
    expect(deleteProductByIdStub.called);
    expect((res.status as sinon.SinonStub).calledOnceWith(200)).to.be.true;
  });

  it('should not call res.status(200) if result is 0', async () => {
    const product = { id: '1', name: 'Test Product' };

    getProductByIdStub.resolves(product);
    deleteProductByIdStub.resolves(0);

    await ProductController.deleteProduct(req as Request, res as Response);

    expect(getProductByIdStub.called);
    expect(deleteProductByIdStub.called);
    expect((res.status as sinon.SinonStub).calledOnceWith(200)).to.be.false;
  });

  it('should return a 410 status if the product is not found', async () => {
    getProductByIdStub.resolves(null);

    await ProductController.deleteProduct(req as Request, res as Response);

    expect(getProductByIdStub.called);
    expect(deleteProductByIdStub.notCalled).to.be.true;
    expect((res.status as sinon.SinonStub).calledOnceWith(404)).to.be.true;
    expect((res.json as sinon.SinonStub).calledOnceWith({ message: 'item not found' })).to.be.true;
  });

  it('should return a 500 status if an error occurs', async () => {
    getProductByIdStub.rejects(new Error('Something went wrong'));

    await ProductController.deleteProduct(req as Request, res as Response);

    expect(getProductByIdStub.called);
    expect(deleteProductByIdStub.notCalled).to.be.true;
    expect((res.status as sinon.SinonStub).calledOnceWith(500)).to.be.true;
    expect((res.json as sinon.SinonStub).calledOnce).to.be.true;
  });
});
