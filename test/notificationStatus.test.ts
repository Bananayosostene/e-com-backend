import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import NotificationController from '../src/controllers/NotificationController';
import Notification from '../src/database/models/notificationModel';

describe('NotificationController.changeNotificationStatus', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let findOneStub: sinon.SinonStub;
  let updateStub: sinon.SinonStub;

  beforeEach(() => {
    req = {
      params: { notificationId: '1' }
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };

    findOneStub = sinon.stub(Notification, 'findOne');
    updateStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 404 if the notification is not found', async () => {
    findOneStub.resolves(null);

    await NotificationController.changeNotificationStatus(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(404);
    expect(res.json).to.have.been.calledWith({ message: 'Notification not found' });
  });

  it('should return 200 if the notification is now marked as read', async () => {
    const notification = { isRead: false, update: updateStub.resolves() };
    findOneStub.resolves(notification);

    await NotificationController.changeNotificationStatus(req as Request, res as Response);

    expect(notification.update).to.have.been.calledWith({ isRead: true });
    expect(res.status).to.have.been.calledWith(200);
    expect(res.json).to.have.been.calledWith({ message: 'Notification is now read' });
  });

  it('should return 200 if the notification is now marked as unread', async () => {
    const notification = { isRead: true, update: updateStub.resolves() };
    findOneStub.resolves(notification);

    await NotificationController.changeNotificationStatus(req as Request, res as Response);

    expect(notification.update).to.have.been.calledWith({ isRead: false });
    expect(res.status).to.have.been.calledWith(200);
    expect(res.json).to.have.been.calledWith({ message: 'Notification is now unread' });
  });

  it('should return 500 if there is a server error', async () => {
    findOneStub.rejects(new Error('Database error'));

    await NotificationController.changeNotificationStatus(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(500);
    expect(res.json).to.have.been.calledWith({
      message: 'Internal Server Error',
      error: 'Database error',
    });
  });
});

describe('NotificationController.getSingleNotification', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let findOneStub: sinon.SinonStub;
  let updateStub: sinon.SinonStub;

  beforeEach(() => {
    req = {
      params: { notificationId: '1' },
      user: { id: 1 }
    };

    res = {
      json: sinon.stub(),
      status: sinon.stub().returnsThis()
    };

    findOneStub = sinon.stub(Notification, 'findOne');
    updateStub = sinon.stub(Notification.prototype, 'update');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 404 if notification is not found', async () => {
    findOneStub.resolves(null);

    await NotificationController.getSingleNotification(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(404);
    expect(res.json).to.have.been.calledWith({ message: 'Notification not found' });
  });

  it('should return 200 and the notification if found and mark it as read if unread', async () => {
    const notification = { id: '1', userId: '1', isRead: false, update: updateStub.resolves() };
    findOneStub.resolves(notification);

    await NotificationController.getSingleNotification(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(200);
    expect(res.json).to.have.been.calledWith({ data: notification });
    expect(updateStub).to.have.been.calledWith({ isRead: true });
  });

  it('should return 200 and the notification if found and already read', async () => {
    const notification = { id: '1', userId: '1', isRead: true, update: updateStub.resolves() };
    findOneStub.resolves(notification);

    await NotificationController.getSingleNotification(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(200);
    expect(res.json).to.have.been.calledWith({ data: notification });
    expect(updateStub).to.not.have.been.called;
  });

  it('should return 500 on internal server error', async () => {
    findOneStub.rejects(new Error('Database error'));

    await NotificationController.getSingleNotification(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(500);
    expect(res.json).to.have.been.calledWith({
      message: 'Internal server error',
      error: 'Database error'
    });
  });
});

describe('NotificationController.changeAllNotificationStatus', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let findAllStub: sinon.SinonStub;
  let updateStub: sinon.SinonStub;

  beforeEach(() => {
    req = {
      user: { id: 1 }
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };

    findAllStub = sinon.stub(Notification, 'findAll');
    updateStub = sinon.stub(Notification.prototype, 'update');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 404 if no notifications are found', async () => {
    findAllStub.resolves([]);

    await NotificationController.changeAllNotificationStatus(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(404);
    expect(res.json).to.have.been.calledWith({ message: 'No notifications found' });
  });

  it('should return 200 if all notifications are now marked as read', async () => {
    const notifications = [
      { isRead: false, update: updateStub.resolves() },
      { isRead: false, update: updateStub.resolves() },
    ];
    findAllStub.resolves(notifications);

    await NotificationController.changeAllNotificationStatus(req as Request, res as Response);

    expect(updateStub).to.have.been.calledTwice;
    expect(res.status).to.have.been.calledWith(200);
    expect(res.json).to.have.been.calledWith({ message: 'All notifications are now read' });
  });

  it('should return 200 if all notifications are now marked as unread', async () => {
    const notifications = [
      { isRead: true, update: updateStub.resolves() },
      { isRead: true, update: updateStub.resolves() },
    ];
    findAllStub.resolves(notifications);

    await NotificationController.changeAllNotificationStatus(req as Request, res as Response);

    expect(updateStub).to.have.been.calledTwice;
    expect(res.status).to.have.been.calledWith(200);
    expect(res.json).to.have.been.calledWith({ message: 'All notifications are now unread' });
  });

  it('should return 500 if there is a server error', async () => {
    findAllStub.rejects(new Error('Database error'));

    await NotificationController.changeAllNotificationStatus(req as Request, res as Response);

    expect(res.status).to.have.been.calledWith(500);
    expect(res.json).to.have.been.calledWith({
      message: 'Internal Server Error',
      error: 'Database error',
    });
  });
});
