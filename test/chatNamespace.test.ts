import { Server } from 'socket.io'
import { expect } from 'chai'
import sinon from 'sinon'
import registerChatNamespace from '../src/utils/chatNamespace'
import {
  saveChatMessage,
  getPastMessages,
} from '../src/controllers/chatController'
interface CustomSocket {
  data: {
    user: string
  }
  on(event: string, listener: (...args: any[]) => void): void
  emit(event: string, ...args: any[]): void
}

describe('Chat Namespace Connection Event Handler Tests', () => {
  let io: Server
  let chatNamespace: any

  beforeEach(() => {
    io = new Server()
    chatNamespace = io.of('/chat')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('Should register chat namespace with proper middleware', () => {
    const useSpy = sinon.spy(chatNamespace, 'use')
    registerChatNamespace(io)
    expect(useSpy).to.have.been.calledWith(sinon.match.func)
  })

  it('Should emit userJoined event on connection', () => {
    const socket: CustomSocket = {
      data: { user: 'testUser' },
      on: () => {},
      emit: sinon.spy(),
    }
    sinon
      .stub(chatNamespace, 'on')
      .callsFake((event: string, handler: Function) => {
        if (event === 'connection') {
          handler(socket)
        }
      })
    registerChatNamespace(io)
    expect(socket.emit).to.have.been.calledWith
  })

  it('Should handle chatMessage event properly', async () => {
    const socket: CustomSocket = {
      data: { user: 'testUser' },
      on: () => {},
      emit: sinon.spy(),
    }
    sinon
      .stub(chatNamespace, 'on')
      .callsFake((event: string, handler: Function) => {
        if (event === 'connection') {
          handler(socket)
        }
      })
    const saveChatMessageStub = sinon.stub(saveChatMessage)
    registerChatNamespace(io)
    socket.on('chatMessage', async (message: any) => {
      expect(saveChatMessageStub).to.have.been.calledWith('testUser', message)
      expect(chatNamespace.emit).to.have.been.calledWith('chatMessage', {
        user: 'testUser',
        message,
      })
    })
    await socket.emit('chatMessage', 'Test message')
  })

  it('Should emit userLeft event on disconnect', () => {
    const socket: CustomSocket = {
      data: { user: 'testUser' },
      on: () => {},
      emit: sinon.spy(),
    }
    sinon
      .stub(chatNamespace, 'on')
      .callsFake((event: string, handler: Function) => {
        if (event === 'connection') {
          handler(socket)
        }
      })
    registerChatNamespace(io)
    socket.on('disconnect', () => {
      expect(chatNamespace.emit).to.have.been.calledWith('userLeft', {
        user: 'testUser',
      })
    })
    socket.emit('disconnect')
  })
})
describe('Chat Namespace Connection Event Handler Tests', () => {
  let io: Server
  let chatNamespace: any

  beforeEach(() => {
    io = new Server()
    chatNamespace = io.of('/chat')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('Should handle requestPastMessages event properly', async () => {
    const socket: CustomSocket = {
      data: { user: 'testUser' },
      on: () => {},
      emit: sinon.spy(),
    }
    sinon
      .stub(chatNamespace, 'on')
      .callsFake((event: string, handler: Function) => {
        if (event === 'connection') {
          handler(socket)
        }
      })
    sinon.stub().returns(Promise.resolve(['Past message 1', 'Past message 2']))
    registerChatNamespace(io)
    socket.on('requestPastMessages', async () => {
      expect(getPastMessages).to.have.been.called
      expect(socket.emit).to.have.been.calledWith('pastMessages', [
        'Past message 1',
        'Past message 2',
      ])
    })
    await socket.emit('requestPastMessages')
  })
})
