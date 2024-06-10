import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import { Request, Response } from 'express';
import { addReview, getAllReviews } from '../src/controllers/reviewsController';
import Product from '../src/database/models/productModel';
import Review from '../src/database/models/reviewsModel';

describe('addReview', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusStub: SinonStub;
  let jsonStub: SinonStub;
  let findByPkStub: sinon.SinonStub;
  let saveStub: sinon.SinonStub;
  let createStub: sinon.SinonStub;

  beforeEach(() => {
    req = {
      body: {
        rating: 5,
        feedback: 'Great product!',
      },
      params: {
        productId: '1',
      },
      user: {
        id: 1,
      },
    };

    res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      }
      statusStub = res.status as SinonStub
      jsonStub = res.json as SinonStub
    findByPkStub = sinon.stub(Product, 'findByPk');
    createStub = sinon.stub(Review, 'create');
    saveStub = sinon.stub(Review.prototype, 'save');
  });

  afterEach(() => {
    sinon.restore();
  });

/*   it('should add a review successfully', async () => {
    const reviewedProduct = { id: 1 };
    const savedReview = {
      buyerId: 1,
      productId: '1',
      rating: 5,
      feedback: 'Great product!',
      save: saveStub.resolves(),
    };
    await addReview(req as Request, res as Response);
    createStub.returns(savedReview);

    await addReview(req as Request, res as Response);

    expect(createStub).to.have.been.called
    expect(statusStub).to.have.been.calledOnceWith(200);
    expect(jsonStub).to.have.been.calledOnceWith({
      message: 'Review added success',
      review: savedReview,
    });
  }); */


  it('should handle errors', async () => {
    const error = new Error('Something went wrong');
    findByPkStub.rejects(error);

    await addReview(req as Request, res as Response);

    expect(statusStub).to.have.been.calledOnceWith(500);
  });
});

describe('getAllReviews', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let status: sinon.SinonStub;
    let json: sinon.SinonStub;
  
    beforeEach(() => {
      req = {
        params: {
          productId: '123',
        },
      };
  
      status = sinon.stub();
      json = sinon.stub();
  
      res = {
        status: status.returns({
          json,
        }),
      };
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should return 404 if product is not found', async () => {
      sinon.stub(Product, 'findByPk').resolves(null);
  
      await getAllReviews(req as Request, res as Response);
  
      expect(status.calledWith(404)).to.be.true;
      expect(json.calledWith({ message: 'Product not found' })).to.be.true;
    });
  
    it('should return 200 and all reviews if product is found', async () => {
      const mockProduct = { id: '123' };
      const mockReviews = [
        { id: '1', productId: '123', rating: 5, feedback: 'Great product!', createdAt: new Date() },
        { id: '2', productId: '123', rating: 4, feedback: 'Good product!', createdAt: new Date() },
      ];
  
      const findByPkStub = sinon.stub(Product, 'findByPk').resolves(mockProduct as any);
      const findAllStub = sinon.stub(Review, 'findAll').resolves(mockReviews as any);
  
      await getAllReviews(req as Request, res as Response);

  
      expect(status.calledWith(200)).to.be.true;
      expect(json.calledWith({
        message: 'Review got success',
        allReviews: mockReviews,
      })).to.be.true;
  
      expect(findAllStub.calledOnceWith({ where: { productId: '123' }, order: [['createdAt', 'ASC']] })).to.be.true;
    });
  
    it('should handle errors and return 500', async () => {
      sinon.stub(Product, 'findByPk').throws(new Error('Database error'));
  
      await getAllReviews(req as Request, res as Response);
  
      expect(status.calledWith(500)).to.be.true;
      expect(json.calledWith('Database error')).to.be.true;
    });
  });
