import { expect } from 'chai'
import sinon, { SinonStub } from 'sinon'
import { EventEmitter } from 'events'
import User from '../src/database/models/userModel'
import Notification from '../src/database/models/notificationModel'
import * as sendEmail from '../src/utils/sendEmail'
import eventEmitter from '../src/services/notificationServices'
import Order, { OrderItem } from '../src/database/models/orderModel'

const emitter = new EventEmitter()
describe('EventEmitter', () => {
  let findByPkStub: sinon.SinonStub
  let findAllStub: sinon.SinonStub
  let createNotificationStub: sinon.SinonStub
  let sendEmailStub: sinon.SinonStub

  beforeEach(() => {
    findByPkStub = sinon.stub(User, 'findByPk')
    findAllStub = sinon.stub(User, 'findAll')
    createNotificationStub = sinon.stub(Notification, 'create')
    sendEmailStub = sinon.stub(sendEmail, 'default')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should handle collection creation and send notifications', async () => {
    const user = { id: 1, email: 'test@example.com', username: 'testuser' }
    const collection = { id: '1', name: 'New Collection', sellerId: 1 }

    findByPkStub.resolves(user)
    findAllStub.resolves([user])
    createNotificationStub.resolves({})
    sendEmailStub.resolves()

    await eventEmitter.emit('collection:created', collection)

    expect(findByPkStub).to.have.been.calledWith(collection.sellerId)
    expect(findAllStub).to.have.been.called
  })

  it('should handle no other verified users for collection', async () => {
    const user = { id: 1, email: 'test@example.com', username: 'testuser' }
    const collection = { id: '1', name: 'New Collection', sellerId: 1 }

    findByPkStub.resolves(user)
    findAllStub.resolves([])
    createNotificationStub.resolves({})
    sendEmailStub.resolves()

    await eventEmitter.emit('collection:created', collection)

    expect(findByPkStub).to.have.been.calledWith(collection.sellerId)
    expect(findAllStub).to.have.been.called
  })

  it('should handle product creation and send notifications', async () => {
    const user = { id: 1, email: 'test@example.com', username: 'testuser' }
    const product = {
      id: '1',
      name: 'New Product',
      sellerId: 1,
      url: 'http://example.com',
    }

    findByPkStub.resolves(user)
    findAllStub.resolves([user])
    createNotificationStub.resolves({})
    sendEmailStub.resolves()

    await eventEmitter.emit('product:created', product)

    expect(findByPkStub).to.have.been.calledWith(product.sellerId)
    expect(findAllStub).to.have.been.called
  })

  it('should handle no other verified users for product', async () => {
    const user = { id: 1, email: 'test@example.com', username: 'testuser' }
    const product = {
      id: '1',
      name: 'New Product',
      sellerId: 1,
      url: 'http://example.com',
    }

    findByPkStub.resolves(user)
    findAllStub.resolves([])
    createNotificationStub.resolves({})
    sendEmailStub.resolves()

    await eventEmitter.emit('product:created', product)

    expect(findByPkStub).to.have.been.calledWith(product.sellerId)
    expect(findAllStub).to.have.been.called
  })
})

describe('Event Emitter - order:created', () => {
  let user: User
  let order: Order
  let notificationStub: sinon.SinonStub
  let sendEmailStub: sinon.SinonStub

  beforeEach(() => {
    user = {
      id: 1,
      username: 'JohnDoe',
      email: 'john@example.com',
    } as User

    order = {
      id: 'order-id',
      userId: user.id,
      items: [
        {
          name: 'Laptop Bags',
          quantity: 2,
          price: 18000,
        },
      ] as OrderItem[],
    } as Order

    notificationStub = sinon.stub(Notification, 'create').resolves()
    sendEmailStub = sinon.stub(sendEmail, 'default')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should create a notification and send an email when order is created', async () => {
    await eventEmitter.emit('order:created', { user, order })

    const productNames = order.items
      .map((item: OrderItem) => item.name)
      .join(', ')

    expect(notificationStub.calledOnce).to.be.true
    expect(
      notificationStub.calledWith({
        userId: user.id,
        productId: order.id,
        message: `Your order with name ${productNames} has been placed successfully.`,
      }),
    ).to.be.true

    const subject = 'Order Confirmation'
    const text = `Dear ${user.username}, your order with Name ${productNames} has been placed successfully.`

    expect(sendEmailStub.calledOnce).to.be.true
    expect(sendEmailStub.calledWith(user.email, subject, text)).to.be.true
  })
})
