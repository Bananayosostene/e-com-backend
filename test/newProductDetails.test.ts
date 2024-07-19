import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import { searchProductsService } from '../src/services/productServices';
import searchController from '../src/controllers/searchController';
import * as productService from '../src/services/productServices'
import ProductController from '../src/controllers/productController'; 
import Product from '../src/database/models/productModel';

describe('searchController.searchAllProducts', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let searchProductsServiceStub: sinon.SinonStub;

  beforeEach(() => {
    req = {
      query: {}
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    searchProductsServiceStub = sinon.stub(productService,"searchProductsService") as any;
    // sandbox.stub(productService, 'searchProductsService').resolves(mockProducts as any);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 404 if no products match the search criteria', async () => {
    searchProductsServiceStub.resolves([]);
    
    await searchController.searchAllProducts(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(404);
    expect(res.json).to.have.been.calledWith({ message: 'No products match the search criteria' });
  });

  it('should return 404 if no available products match the search criteria', async () => {
    const products = [
      { productStatus: 'unavailable', expiryDate: new Date(Date.now() + 100000) },
      { productStatus: 'available', expiryDate: new Date(Date.now() - 100000) }
    ];
    searchProductsServiceStub.resolves(products);
    
    await searchController.searchAllProducts(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(404);
    expect(res.json).to.have.been.calledWith({
      status: 404,
      message: 'No available products match the search criteria'
    });
  });

  it('should return 200 if available products match the search criteria', async () => {
    const currentDate = new Date();
    const products = [
      { productStatus: 'available', expiryDate: new Date(currentDate.getTime() + 100000) }
    ];
    searchProductsServiceStub.resolves(products);

    await searchController.searchAllProducts(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(200);
    expect(res.json).to.have.been.calledWith({
      status: 200,
      message: 'Product(s) retrieved successfully',
      items: products.filter(product => product.productStatus === 'available' && product.expiryDate > currentDate)
    });
  });

  it('should return 500 if an error occurs', async () => {
    searchProductsServiceStub.rejects(new Error('Test error'));
    
    await searchController.searchAllProducts(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(500);
    expect(res.json).to.have.been.calledWith({ message: 'Internal server error' });
  });
});


// -------------------------------



describe('ProductController.listSingleUserProduct', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let findByPkStub: sinon.SinonStub;

  beforeEach(() => {
    req = {
      params: {
        productId: '1'
      }
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    findByPkStub = sinon.stub(Product, 'findByPk');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 404 if the product is not found', async () => {
    findByPkStub.resolves(null);

    await ProductController.listSingleUserProduct(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(404);
    expect(res.json).to.have.been.calledWith({ status: 404, error: 'Product not found' });
  });

  it('should return 404 if the product is not available', async () => {
    const product = {
      productStatus: 'unavailable',
      expiryDate: new Date(Date.now() + 100000),
      reviews: <any>[],
      toJSON: () => ({})
    };
    findByPkStub.resolves(product);

    await ProductController.listSingleUserProduct(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(404);
    expect(res.json).to.have.been.calledWith({
      status: 404,
      error: 'Product is currently unavailable'
    });
  });

  it('should return 404 if the product has expired', async () => {
    const product = {
      productStatus: 'available',
      expiryDate: new Date(Date.now() - 100000),
      reviews: <any>[],
      toJSON: () => ({})
    };
    findByPkStub.resolves(product);

    await ProductController.listSingleUserProduct(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(404);
    expect(res.json).to.have.been.calledWith({
      status: 404,
      error: 'Product has expired'
    });
  });

  it('should return 200 if the product is available', async () => {
    const currentDate = new Date();
    const product = {
      productStatus: 'available',
      expiryDate: new Date(currentDate.getTime() + 100000),
      quantity: 1,
      reviews: [{ rating: 4 }, { rating: 5 }],
      toJSON: () => ({ id: 1, name: 'Product 1', reviews: [{ rating: 4 }, { rating: 5 }] })
    };
    findByPkStub.resolves(product);

    await ProductController.listSingleUserProduct(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(200);
    expect(res.json).to.have.been.calledWith({
      status: 200,
      message: 'Product details retrieved successfully by buyer',
      item: {
        id: 1,
        name: 'Product 1',
        reviews: [{ rating: 4 }, { rating: 5 }],
        averageRating: 4.5
      }
    });
  });

  it('should return 500 if an error occurs', async () => {
    findByPkStub.rejects(new Error('Test error'));

    await ProductController.listSingleUserProduct(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(500);
    expect(res.json).to.have.been.calledWith({ status: 500, error: 'Internal server error' });
  });
});
