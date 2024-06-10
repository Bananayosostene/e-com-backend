import { expect } from 'chai';
import Order, { OrderStatus } from '../src/database/models/orderModel';
import { Request, Response, NextFunction } from 'express';
import { checkProductPurchased } from '../src/middlewares/productMiddleware';
import sinon, { SinonStub } from 'sinon';

describe('checkProductPurchased Middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let findOneStub: SinonStub;

    beforeEach(() => {
        req = {
            params: { productId: '1' },
            user: { id: 1 }
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis()
        };
        next = sinon.spy();
        findOneStub = sinon.stub(Order, 'findOne');
    });

    afterEach(() => {
        sinon.restore();
    });


    it('should return 404 if the product has not been purchased', async () => {
        const order = {
            items: [{ productId: 2 }],
            status: OrderStatus.COMPLETED
        };
        findOneStub.resolves(order);

        await checkProductPurchased(req as Request, res as Response, next);

        expect(res.status).to.have.been.calledWith(404);
        expect(res.json).to.have.been.calledWith({ message: 'Product not found or not purchased successfully' });
    });

    it('should return 500 if an error occurs', async () => {
        findOneStub.rejects(new Error('Database error'));

        await checkProductPurchased(req as Request, res as Response, next);

        expect(res.status).to.have.been.calledWith(500);
        expect(res.json).to.have.been.calledWith({ message: 'Internal Server Error' });
    });
});
