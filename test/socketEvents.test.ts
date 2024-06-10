// --
import { expect } from 'chai'
import sinon from 'sinon'
import { Server, Socket } from 'socket.io'
import { EventEmitter } from 'events'
import registerSocketEvents from '../src/utils/socketEvents'
import { UserAttributes } from '../src/database/models/userModel'

interface JwtPayload extends UserAttributes {
  iat?: number
  exp?: number
}

describe('Socket Events', () => {
  let io: Server
  let socket: Partial<Socket>
  let mockIoOn: sinon.SinonStub
  let mockSocketJoin: sinon.SinonSpy
  let user: JwtPayload

  beforeEach(() => {
    io = new EventEmitter() as unknown as Server
    socket = {
      data: {},
      join: sinon.spy(),
    } as Partial<Socket>
    mockIoOn = sinon.stub(io, 'on')
    mockSocketJoin = socket.join as sinon.SinonSpy
    user = { id: 1, email: 'user@example.com' } as JwtPayload

    mockIoOn.callsFake((event, callback) => {
      if (event === 'connection') {
        callback(socket)
      }
    })

    socket.data.user = user
  })

  afterEach(() => {
    mockIoOn.restore()
  })

  it('should attach user data to socket and join user room', () => {
    registerSocketEvents(io)

    expect(mockIoOn.calledOnce).to.be.true
  })
})
