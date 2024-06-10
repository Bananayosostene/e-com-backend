import { expect } from 'chai'
import sinon from 'sinon'
import { Request, Response } from 'express'
import Notification from '../src/database/models/notificationModel'
import NotificationController from '../src/controllers/NotificationController'

describe('NotificationController', () => {
  describe('getNotifications', () => {
    let req: Partial<Request>
    let res: Partial<Response>
    let statusStub: sinon.SinonStub
    let jsonStub: sinon.SinonStub
    let findAllStub: sinon.SinonStub

    beforeEach(() => {
      req = {
        user: {
          id: 1,
        },
      }
      statusStub = sinon.stub()
      jsonStub = sinon.stub()
      res = {
        status: statusStub,
        json: jsonStub,
      }
      statusStub.returns(res)
      findAllStub = sinon.stub(Notification, 'findAll')
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should return notifications for the authenticated user', async () => {
      const mockNotifications = [
        { id: 1, userId: 1, message: 'Test notification' },
      ]
      findAllStub.resolves(mockNotifications)

      await NotificationController.getNotifications(
        req as Request,
        res as Response,
      )

      expect(findAllStub.calledOnce).to.be.true
      expect(
        findAllStub.calledWith({
          where: { userId: 1 },
          order: [['createdAt', 'DESC']],
        }),
      ).to.be.true
      expect(statusStub.calledWith(200)).to.be.true
      expect(jsonStub.calledWith({ data: mockNotifications })).to.be.true
    })

    it('should handle errors', async () => {
      const error = new Error('Test error')
      findAllStub.rejects(error)

      await NotificationController.getNotifications(
        req as Request,
        res as Response,
      )

      expect(findAllStub.calledOnce).to.be.true
      expect(statusStub.calledWith(500)).to.be.true
      expect(jsonStub.calledWith({ message: 'Internal server error' })).to.be
        .true
    })
  })
})
