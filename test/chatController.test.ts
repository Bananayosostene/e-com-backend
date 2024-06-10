import { expect } from 'chai'
import sinon from 'sinon'
import Chat from '../src/database/models/chatModel'
import {
  saveChatMessage,
  getPastMessages,
} from '../src/controllers/chatController'

describe('Chat Controller', () => {
  let chatCreateStub: sinon.SinonStub
  let chatFindAllStub: sinon.SinonStub

  beforeEach(() => {
    chatCreateStub = sinon.stub(Chat, 'create')
    chatFindAllStub = sinon.stub(Chat, 'findAll')
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('saveChatMessage', () => {
    it('should save a chat message', async () => {
      const user = { id: 1, username: 'testuser' }
      const message = 'Hello World'

      const mockChatMessage = {
        userId: user.id,
        username: user.username,
        message,
      }
      chatCreateStub.resolves(mockChatMessage)

      const result = await saveChatMessage(user, message)

      expect(chatCreateStub.calledOnce).to.be.true
      expect(chatCreateStub.calledWithExactly(mockChatMessage)).to.be.true
      expect(result).to.deep.equal(mockChatMessage)
    })
  })

  describe('getPastMessages', () => {
    it('should return past chat messages', async () => {
      const mockMessages = [
        { userId: 1, username: 'testuser1', message: 'Hello World 1' },
        { userId: 2, username: 'testuser2', message: 'Hello World 2' },
      ]

      chatFindAllStub.resolves(mockMessages)

      const result = await getPastMessages()

      expect(chatFindAllStub.calledOnce).to.be.true
      expect(
        chatFindAllStub.calledWith({
          limit: 50,
          order: [['createdAt', 'DESC']],
        }),
      ).to.be.true
      expect(result).to.deep.equal(mockMessages)
    })
  })
})
