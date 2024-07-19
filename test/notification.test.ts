import { expect } from 'chai'
import sinon from 'sinon'
import { Request, Response } from 'express'
import Notification from '../src/database/models/notificationModel'
import NotificationController from '../src/controllers/NotificationController'
import isAuthenticated from '../src/middlewares/authenticationMiddleware'
import { NextFunction } from 'express-serve-static-core'

describe('NotificationController', () => {
  describe('getNotifications', () => {
    let req: Request
    let res: Response
    let next:NextFunction
    let statusStub: sinon.SinonStub
    let jsonStub: sinon.SinonStub
    let findAllStub: sinon.SinonStub

    beforeEach(() => {
      req = {
        user: {
          id: 1,
        },
      } as Request
      statusStub = sinon.stub()
      jsonStub = sinon.stub()
      res = {
        status: statusStub,
        json: jsonStub,
      } as unknown as Response
      statusStub.returns(res)
      findAllStub = sinon.stub(Notification, 'findAll')
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should get all notifications for loogedin user with limit and page', async () => {
      const page = ''
      const limit = ''
      req = {
        headers: { authorization: 'Bearer valid_token' },
        query: { page, limit },
      } as unknown as Request
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      } as unknown as Response
  
      req.user = { userRole: 'admin', id: 1 }
      await isAuthenticated(req, res, next)
      const mockNotifications = [
        { id: 1, userId: 1, message: 'Test notification' },
        { id: 2, userId: 2, message: 'Test notification' },
      ]
  
      findAllStub.resolves(mockNotifications)
  
      await NotificationController.getNotifications(req, res)
  
      expect(res.status).to.be.calledWith(200)
      expect(res.json).to.be.calledWith({
        message: 'Notifications retrieved successfully',
        notifications: mockNotifications,
        pagination: { page: 1, limit: 5, totalPages: 1 },
      })
    })

    it('should handle errors', async () => {
      const error = new Error('Test error')
      findAllStub.rejects(error)

      await NotificationController.getNotifications(
        req as Request,
        res as Response,
      )

      expect(findAllStub.calledOnce).to.be.not.true
      expect(statusStub.calledWith(500)).to.be.true
      expect(jsonStub.calledWith({ message: 'Internal server error' })).to.be
        .true
    })
  })
})
