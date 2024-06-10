import chai, { request } from 'chai';
import chaiHttp from 'chai-http';
import sinon, { SinonSpy, SinonStub, stub } from 'sinon';
import { Request, Response } from 'express';
import ProductController from '../src/controllers/productController';
import Product from '../src/database/models/productModel';
import { app } from '../index';
import chaiAsPromised from 'chai-as-promised';
import { ParamsDictionary } from 'express-serve-static-core';
import Collection from '../src/database/models/collectionModel';
import User from '../src/database/models/userModel'
import cloudinaryUpload from '../src/utils/cloudinary';
import productController from '../src/controllers/productController';
chai.use(chaiHttp);
const { expect } = chai;

describe('ProductController.getProducts', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let status: sinon.SinonStub;
    let json: sinon.SinonStub;

    beforeEach(() => {
        req = {};
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        status = res.status as sinon.SinonStub;
        json = res.json as sinon.SinonStub;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return products for the signed in user', async () => {
        req.user = { id: 1 };
        const mockProducts = [
            sinon.createStubInstance(Product),
            sinon.createStubInstance(Product)
        ];

        sinon.stub(Product, 'findAll').resolves(mockProducts as any);

        await ProductController.getProducts(req as Request, res as Response);

        expect(status.calledWith(200)).to.be.true;
        expect(json.calledWith(mockProducts)).to.be.true;
    });

    it('should return 500 on server error', async () => {
        req.user = { id: 1 };

        sinon.stub(Product, 'findAll').rejects(new Error('Database Error'));

        await ProductController.getProducts(req as Request, res as Response);

        expect(status.calledWith(500)).to.be.true;
        expect(json.calledWith({ message: 'Internal Server error' })).to.be.true;
    });
});

describe('ProductController.updateProduct', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let status: sinon.SinonStub;
    let json: sinon.SinonStub;

    beforeEach(() => {
        req = { params: { id: '1' }, body: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        status = res.status as sinon.SinonStub;
        json = res.json as sinon.SinonStub;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return 403 if user does not have permission to update the product', async () => {
        const mockProduct = { id: 1, sellerId: 2, productStatus: 'available', update: sinon.stub() };
        req.user = { id: 1 };

        sinon.stub(Product, 'findByPk').resolves(mockProduct as any);

        await ProductController.updateProduct(req as Request, res as Response);

        expect(status.calledWith(403)).to.be.true;
        expect(json.calledWith({ message: 'You do not have permission to update this product' })).to.be.true;
    });

    it('should return 400 if product is unavailable', async () => {
        const mockProduct = { id: 1, sellerId: 1, productStatus: 'unavailable', update: sinon.stub() };
        req.user = { id: 1 };

        sinon.stub(Product, 'findByPk').resolves(mockProduct as any);

        await ProductController.updateProduct(req as Request, res as Response);

        expect(status.calledWith(400)).to.be.true;
        expect(json.calledWith({ message: 'Product is not available' })).to.be.true;
    });

    it('should update product and return 200', async () => {
        const mockProduct = { id: 1, sellerId: 1, productStatus: 'available', update: sinon.stub().resolves({ id: 1, name: 'UpdatedProduct' }) };
        req.user = { id: 1 };
        req.body = { name: 'UpdatedProduct', price: 100, category: 'Category1', bonus: 10, sku: 'SKU1', quantity: 10, expiryDate: '2024-12-31' };

        sinon.stub(Product, 'findByPk').resolves(mockProduct as any);

        await ProductController.updateProduct(req as Request, res as Response);

        expect(status.calledWith(200)).to.be.true;
        expect(json.calledWith({ message: 'Product updated successfully', data: { id: 1, name: 'UpdatedProduct' } })).to.be.true;
    });

    it('should return 500 on server error', async () => {
        req.user = { id: 1 };

        sinon.stub(Product, 'findByPk').rejects(new Error('Database Error'));

        await ProductController.updateProduct(req as Request, res as Response);

        expect(status.calledWith(500)).to.be.true;
        expect(json.calledWith({ message: 'Internal server error', error: 'Database Error' })).to.be.true;
    });
});

describe('removeImages', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusStub: SinonStub;
  let jsonStub: SinonStub;
  let findByPkStub: SinonStub;
  let updateStub: SinonStub;

  beforeEach(() => {
    req = {
      body: { images: ['image1.jpg', 'image2.jpg'] },
      params: { id: '1' }
    };
    statusStub = stub();
    jsonStub = stub();
    res = {
      status: statusStub.returns({ json: jsonStub })
    };
    findByPkStub = stub(Product, 'findByPk');
    updateStub = stub();
  });

  afterEach(() => {
    findByPkStub.restore();
  });

  it('should return 404 if product is not found', async () => {
    findByPkStub.resolves(null);

    await productController.removeImages(req as Request, res as Response);

    expect(statusStub.calledWith(404)).to.be.true;
    expect(jsonStub.calledWith({ message: 'Product not found' })).to.be.true;
  });

  it('should return 400 if no images were removed', async () => {
    findByPkStub.resolves({ images: ['image3.jpg'], update: updateStub } as any);

    await productController.removeImages(req as Request, res as Response);

    expect(statusStub.calledWith(400)).to.be.true;
    expect(jsonStub.calledWith({ message: 'No images were removed', imagesToRemove: ['image1.jpg', 'image2.jpg'] })).to.be.true;
  });

  it('should remove images and return 200 if images were removed', async () => {
    findByPkStub.resolves({ images: ['image1.jpg', 'image3.jpg'], update: updateStub } as any);
    updateStub.resolves();

    await productController.removeImages(req as Request, res as Response);

    expect(statusStub.calledWith(200)).to.be.true;
    expect(jsonStub.calledWith({ message: 'Images removed successfully', imagesRemaining: ['image3.jpg'] })).to.be.true;
    expect(updateStub.calledWith({ images: ['image3.jpg'] })).to.be.true;
  });

  it('should return 500 if there is a server error', async () => {
    findByPkStub.throws(new Error('Internal server error'));

    await productController.removeImages(req as Request, res as Response);

    expect(statusStub.calledWith(500)).to.be.true;
    expect(jsonStub.calledWith({ message: 'Internal server error', error: 'Internal server error' })).to.be.true;
  });
});

describe('addImages', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusStub: SinonStub;
  let jsonStub: SinonStub;
  let findByPkStub: SinonStub;
  let updateStub: SinonStub;

  beforeEach(() => {
    req = {
      files: [
        { originalname: 'image1.jpg', buffer: Buffer.from('') } as Express.Multer.File,
        { originalname: 'image2.jpg', buffer: Buffer.from('') } as Express.Multer.File
      ],
      params: { id: '1' }
    };
    statusStub = stub();
    jsonStub = stub();
    res = {
      status: statusStub.returns({ json: jsonStub })
    };
    findByPkStub = stub(Product, 'findByPk');
    updateStub = stub();
  });

  afterEach(() => {
    findByPkStub.restore();
  });

  it('should return 404 if product is not found', async () => {
    findByPkStub.resolves(null);

    await productController.addImages(req as Request, res as Response);

    expect(statusStub.calledWith(404)).to.be.true;
    expect(jsonStub.calledWith({ message: 'Product not found' })).to.be.true;
  });

  it('should upload images and return 200 if images are added successfully', async () => {
    const product = { images: ['existingImage.jpg'], update: updateStub } as any;
    findByPkStub.resolves(product);
    await productController.addImages(req as Request, res as Response);
  });

  it('should return 500 if there is a server error', async () => {
    findByPkStub.throws(new Error('Internal server error'));

    await productController.addImages(req as Request, res as Response);

    expect(statusStub.calledWith(500)).to.be.true;
    expect(jsonStub.calledWith({ message: 'Internal Server Error', error: 'Internal server error' })).to.be.true;
  });
});