import Chat from '../database/models/chatModel'
import { UserAttributes } from '../database/models/userModel'

export const saveChatMessage = async (
  user: UserAttributes,
  message: string,
) => {
  const chart = await Chat.create({
    userId: user.id,
    username: user.username,
    message,
  })

  return chart
}

export const getPastMessages = async (limit = 50) => {
  return await Chat.findAll({
    limit,
    order: [['createdAt', 'DESC']],
  })
}
