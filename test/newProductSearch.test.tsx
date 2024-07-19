import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import ProductController from '../src/controllers/productController'; 
import  Product  from '../src/database/models/productModel'; 
import * as productService from '../src/services/productServices'
import productController from '../src/controllers/productController';
import searchController from 'controllers/searchController';

describe.only('ProductController', () => {
  describe('listSingleUserProduct', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
      req = {
        params: { productId: '1' },
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return product details with average rating when product is available', async () => {
      const mockProduct = {
        id: '1',
        productStatus: 'available',
        expiryDate: new Date(Date.now() + 86400000), // tomorrow
        quantity: 5,
        seller: { id: '1', username: 'seller1', email: 'seller1@example.com' },
        reviews: [
          { id: '1', rating: 4, buyerId: '2', feedback: 'Good', buyer: { id: '2', username: 'buyer1' } },
          { id: '2', rating: 5, buyerId: '3', feedback: 'Excellent', buyer: { id: '3', username: 'buyer2' } },
        ],
        toJSON: () => ({ ...mockProduct }),
      };
      
      sandbox.stub(Product, 'findByPk').resolves(mockProduct as any);

      await ProductController.listSingleUserProduct(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        status: 200,
        message: 'Product details retrieved successfully by buyer',
        item: {
          ...mockProduct,
          averageRating: 4.5,
        },
      });
    });

    it('should return 404 when product is not found', async () => {
      sandbox.stub(Product, 'findByPk').resolves(null);

      await ProductController.listSingleUserProduct(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.json).to.have.been.calledWith({
        status: 404,
        error: 'Product not found',
      });
    });

    it('should return 404 when product is unavailable', async () => {
      const mockProduct = {
        id: '1',
        productStatus: 'unavailable',
        expiryDate: new Date(Date.now() + 86400000),
        quantity: 5,
        toJSON: () => ({ ...mockProduct }),
      };
      
      sandbox.stub(Product, 'findByPk').resolves(mockProduct as any);

      await ProductController.listSingleUserProduct(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.json).to.have.been.calledWith({
        status: 404,
        error: 'Product is currently unavailable',
      });
    });

    it('should return 404 when product has expired', async () => {
      const mockProduct = {
        id: '1',
        productStatus: 'available',
        expiryDate: new Date(Date.now() - 86400000), // yesterday
        quantity: 5,
        toJSON: () => ({ ...mockProduct }),
      };
      
      sandbox.stub(Product, 'findByPk').resolves(mockProduct as any);

      await ProductController.listSingleUserProduct(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.json).to.have.been.calledWith({
        status: 404,
        error: 'Product has expired',
      });
    });

    it('should return 500 for internal server error', async () => {
      sandbox.stub(Product, 'findByPk').throws(new Error('Database error'));

      await ProductController.listSingleUserProduct(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith({
        status: 500,
        error: 'Internal server error',
      });
    });
  });
});


describe.only('ProductController', () => {
  describe('searchAllProducts', () => {
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

    it('should return available products that match search criteria', async () => {
      const mockProducts = [
        { id: '1', productStatus: 'available', expiryDate: new Date(Date.now() + 86400000) },
        { id: '2', productStatus: 'available', expiryDate: new Date(Date.now() + 86400000) }
      ];
      sandbox.stub(productService, 'searchProductsService').resolves(mockProducts as any);

      await searchController.searchAllProducts(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        status: 200,
        message: 'Product(s) retrieved successfully',
        items: mockProducts
      });
    });

    it('should return 404 when no products match the search criteria', async () => {
      sandbox.stub(productService, 'searchProductsService').resolves([]);

      await searchController.searchAllProducts(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.json).to.have.been.calledWith({
        message: 'No products match the search criteria'
      });
    });

    it('should return 404 when no available products match the search criteria', async () => {
      const mockProducts = [
        { id: '1', productStatus: 'unavailable', expiryDate: new Date(Date.now() + 86400000) },
        { id: '2', productStatus: 'available', expiryDate: new Date(Date.now() - 86400000) }
      ];
      sandbox.stub(productService, 'searchProductsService').resolves(mockProducts as any);

      await searchController.searchAllProducts(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.json).to.have.been.calledWith({
        status: 404,
        message: 'No available products match the search criteria'
      });
    });

    it('should return 500 for internal server error', async () => {
      sandbox.stub(productService, 'searchProductsService').throws(new Error('Database error'));

      await searchController.searchAllProducts(req as Request, res as Response);

      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith({
        message: 'Internal server error'
      });
    });

    it('should pass query parameters to searchProductsService', async () => {
      const searchStub = sandbox.stub(productService, 'searchProductsService').resolves([]);
      req.query = { name: 'test', category: 'electronics' };

      await searchController.searchAllProducts(req as Request, res as Response);

      expect(searchStub).to.have.been.calledWith(req.query);
    });
  });
});