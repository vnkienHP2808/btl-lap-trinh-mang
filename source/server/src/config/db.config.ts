import mongoose from 'mongoose'
import Conversation from '~/models/Conversation'
import Message from '~/models/Message'
import User from '~/models/User'

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL as string, {
      dbName: 'chat-app'
    })
    console.log('Kết nối thành công')
  } catch (error) {
    console.error(error)
  }
}

export const clearDataUsers = async () => {
  const result = await User.deleteMany({})
  return result.deletedCount
}

export const clearConversationAndMessage = async () => {
  await Message.deleteMany({})
  const result = await Conversation.deleteMany({})
  return result.deletedCount
}
