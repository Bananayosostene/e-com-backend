import chai, { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import sinonChai from 'sinon-chai';
import { Request, Response } from 'express';
import adminController from '../src/controllers/adminController';
import User from '../src/database/models/userModel';
import disableUserTemplate from '../src/utils/emailTemplates/disableUserTemplate';
import enableUserTemplate from '../src/utils/emailTemplates/enableUserTemplate'
chai.use(sinonChai);

describe('Admin Controller', () => {
  describe('getAllUsers', () => {
    let req: Request;
    let res: Response;
    let findAllStub: SinonStub;
    let mockUsers: { id: number, name: string }[];

    before(() => {
      mockUsers = [{ id: 1, name: 'Test1' }, { id: 2, name: 'Test2' }];
    });

    beforeEach(() => {
      req = {} as Request;
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis(),
      } as unknown as Response;

      findAllStub = sinon.stub(User, 'findAll');
    });

    afterEach(() => {
      findAllStub.restore();
    });

    it('should return a status code of 200 if it gets all users', async () => {
      findAllStub.resolves(mockUsers as any);
      await adminController.getAllUsers(req, res);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith(mockUsers);
    });

    it('should return a status code of 500 for an internal server error', async () => {
      findAllStub.rejects(new Error('Database Error'));
      await adminController.getAllUsers(req, res);

      expect(res.status).to.have.been.calledWith(500);
    });
  });

  describe('updateStatus', () => {
    let req: Request;
    let res: Response;
    let findByPkStub: SinonStub;
    let saveStub: SinonStub;

    beforeEach(() => {
      req = {
        params: {},
        body: {},
      } as Request;

      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis(),
      } as unknown as Response;

      findByPkStub = sinon.stub(User, 'findByPk');
      saveStub = sinon.stub();
    });

    afterEach(() => {
      findByPkStub.restore();
      saveStub.reset();
    });

    it('should return 400 if newStatus is not provided', async () => {
      req.params.userId = '1';
      req.body = {};

      await adminController.updateStatus(req, res);

      expect(res.status).to.have.been.calledWith(400);
      expect(res.json).to.have.been.calledWith({ message: 'New status is required' });
    });

    it('should return 400 if description is missing when deactivating user', async () => {
      req.params.userId = '1';
      req.body = { newStatus: 'inactive' };

      await adminController.updateStatus(req, res);

      expect(res.status).to.have.been.calledWith(400);
      expect(res.json).to.have.been.calledWith({ message: 'Description is required for deactivation' });
    });

    it('should return 404 if user is not found', async () => {
      req.params.userId = '1';
      req.body = { newStatus: 'active' };
      findByPkStub.resolves(null);

      await adminController.updateStatus(req, res);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.json).to.have.been.calledWith({ message: 'User not found' });
    });

    it('should return 400 if user is already in the desired status', async () => {
      const user = { id: 1, status: 'active', save: saveStub } as any;
      req.params.userId = '1';
      req.body = { newStatus: 'active' };
      findByPkStub.resolves(user);

      await adminController.updateStatus(req, res);

      expect(res.status).to.have.been.calledWith(400);
      expect(res.json).to.have.been.calledWith({ message: 'User is already active' });
    });

    it('should update status and send email if everything is correct', async () => {
      const user = { id: 1, username: 'testuser', email: 'test@example.com', status: 'active', save: saveStub } as any;
      req.params.userId = '1';
      req.body = { newStatus: 'inactive', description: 'Violation of terms' };
      findByPkStub.resolves(user);

      await adminController.updateStatus(req, res);

      expect(user.status).to.equal('inactive');
      expect(saveStub).to.have.been.called;
    });

    it('should return 500 for internal server error', async () => {
      req.params.userId = '1';
      req.body = { newStatus: 'inactive', description: 'Violation of terms' };
      findByPkStub.rejects(new Error('Database Error'));

      await adminController.updateStatus(req, res);

      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith({ message: 'Internal server error', error: 'Database Error' });
    });
  });
});
