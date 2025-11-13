import mongoose from 'mongoose'
import Conversation from '~/models/Conversation'
import Message from '~/models/Message'
import User from '~/models/User'

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL as string, {
      dbName: 'chat-app'
    })
  } catch (error) {
    console.error(error)
  }
}

export const clearDataUsers = async () => {
  try {
    const result = await User.deleteMany({})
    return result.deletedCount
  } catch (error) {
    console.error(error)
  }
}

export const clearConversationAndMessage = async () => {
  try {
    await Message.deleteMany({})
    const result = await Conversation.deleteMany({})
    return result.deletedCount
  } catch (error) {
    console.error(error)
  }
}