import chai from 'chai';
import chaiHttp from 'chai-http';
import dotenv from 'dotenv';
import sinon from 'sinon';
import passport from '../src/config/passport';
import { app } from '../index';
import LoginController from '../src/controllers/LoginController';
import { Request, Response } from 'express';
import { SinonStub, SinonSpy } from 'sinon';

dotenv.config();
const { expect } = chai;
chai.use(chaiHttp);
const { FRONTEND_URL } = process.env;

const mockUser = {
  id: 'user-id',
  status: 'active',
  verified: true,
  userRole: 'buyer',
};

interface PassportCallback<TUser> {
  (error: Error | null, user: TUser | null): void;
}

interface MockResponse extends Response {
  status: SinonStub;
  json: SinonSpy;
  redirect: SinonSpy;
}
describe('loginWithGoogle Controller', () => {
  let passportAuthenticateStub: SinonStub;

  before(() => {
    passportAuthenticateStub = sinon.stub(passport, 'authenticate');
  });

  after(() => {
    passportAuthenticateStub.restore();
  });
  const req = {} as Request;
  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.spy(),
    redirect: sinon.spy() as SinonSpy<any[], any>
  } as unknown as MockResponse;

  const next = sinon.spy();
  it('should redirect to admin page with token when user role is ADMIN', async () => {
    const adminUser = {
      id: 'user_id',
      username: 'adminuser',
      email: 'admin@example.com',
      userRole: 'ADMIN',
      verified: true,
    };

    passportAuthenticateStub.callsFake((strategy, callback) => {
      callback(null, adminUser);
    });

    await LoginController.loginWithGoogle(req, res, next);
    
    expect(res.redirect.calledWith(`${FRONTEND_URL}/admin?token=admin-token`));
  });

  it('should successfully login with Google and redirect with token', async () => {
    const user = { id: 'user_id', username: 'testuser', email: 'test@example.com', userRole: 'BUYER', verified: true };

    passportAuthenticateStub.callsFake((strategy, callback) => {
      callback(null, user);
    });

    await LoginController.loginWithGoogle(req, res, next);

    expect(res.redirect.calledWith(`${FRONTEND_URL}/login?token=buyer-token`));
  });

  it('should return a 500 status code if an internal server error occurs', (done) => {
    passportAuthenticateStub.callsFake(
      (strategy, callback: PassportCallback<object>) => {
        callback(new Error('Internal Server Error'), null);
      },
    );

    chai
      .request(app)
      .get('/users/google/callback')
      .end((err, res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property('error', 'Internal Server Error');
        done();
      });
  });

  it('should return a 401 status code if authentication fails', (done) => {
    passportAuthenticateStub.callsFake(
      (strategy, callback: PassportCallback<object>) => {
        callback(null, null);
      },
    );

    chai
      .request(app)
      .get('/users/google/callback')
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property('error', 'Authentication failed');
        done();
      });
  });

  it('should return a 401 status code if user is inactive', (done) => {
    const inactiveUser = { ...mockUser, status: 'inactive' };
    passportAuthenticateStub.callsFake(
      (strategy, callback: PassportCallback<object>) => {
        callback(null, inactiveUser);
      },
    );

    chai
      .request(app)
      .get('/users/google/callback')
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property('message', 'User is disabled');
        done();
      });
  });
  it('should handle pending verification', async () => {
    const pendingUser = { ...mockUser, verified: false, email: "test@example.com" };

    passportAuthenticateStub.callsFake(
      (strategy, callback: PassportCallback<object>) => {
        callback(null, pendingUser);
      },
    );

    await LoginController.loginWithGoogle(req, res, next);

    expect(res.status.calledWith(200));
    expect(res.json.calledWith({ message: 'A verification email has been sent' }));
  });

  it('should return a 500 status code if sending verification email fails', async () => {
    const pendingUser = { ...mockUser, verified: false, email: "test@example.com" };
    passportAuthenticateStub.callsFake(
      (strategy, callback: PassportCallback<object>) => {
        callback(null, pendingUser);
      },
    );

    await LoginController.loginWithGoogle(req, res, next);

    expect(res.status.calledWith(500));
    expect(res.json.calledWith({ message: 'Internal server error' }));
  });

  it('should handle seller OTP verification', async () => {
    const sellerUser = { ...mockUser, userRole: 'seller', email: "test@example.com" };

    passportAuthenticateStub.callsFake(
      (strategy, callback: PassportCallback<object>) => {
        callback(null, sellerUser);
      },
    );

    await LoginController.loginWithGoogle(req, res, next);

    expect(res.redirect.calledWith(`${FRONTEND_URL}/verify-otp?email=test@example.com`));
  });

  it('should return a 500 status code if sending OTP email fails', async () => {
    const sellerUser = { ...mockUser, userRole: 'seller', email: "test@example.com" };

    passportAuthenticateStub.callsFake(
      (strategy, callback: PassportCallback<object>) => {
        callback(null, sellerUser);
      },
    );

    await LoginController.loginWithGoogle(req, res, next);

    expect(res.status.calledWith(500));
    expect(res.json.calledWith({ message: 'Internal server error' }));
  });

  it('should handle non-standard roles appropriately', async () => {
    const unknownRoleUser = { ...mockUser, userRole: 'unknown', email: "test@example.com" };

    passportAuthenticateStub.callsFake(
      (strategy, callback: PassportCallback<object>) => {
        callback(null, unknownRoleUser);
      },
    );

    await LoginController.loginWithGoogle(req, res, next);

    expect(res.redirect.calledWith(`${FRONTEND_URL}/login?token=unknown-role-token`));
  });
});
