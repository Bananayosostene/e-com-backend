import { Server } from 'socket.io'
import { CustomSocket } from './customSocketTypes'
import socketAuthMiddleware from '../middlewares/socketMiddleware'
import { saveChatMessage, getPastMessages } from '../controllers/chatController'

const registerChatNamespace = (io: Server) => {
  const chatNamespace = io.of('/chat')
  chatNamespace.use(socketAuthMiddleware)

  chatNamespace.on('connection', (socket: CustomSocket) => {
    const { user } = socket.data
    chatNamespace.emit('userJoined', { user })

    socket.on('chatMessage', async (message) => {
      await saveChatMessage(user, message)
      chatNamespace.emit('chatMessage', { user, message })
    })

    socket.on('requestPastMessages', async () => {
      const pastMessages = await getPastMessages()
      socket.emit('pastMessages', pastMessages)
    })

    socket.on('disconnect', () => {
      chatNamespace.emit('userLeft', { user })
    })
  })
}

export default registerChatNamespace
