import mongoose from 'mongoose'
import Conversation from '~/models/Conversation'
import Message from '~/models/Message'
import User from '~/models/User'

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL as string, {
      dbName: 'chat-app'
    })
    console.log(process.env.DB_URL as string)
    console.log('Kết nối thành công')
  } catch (error) {
    console.log(process.env.DB_URL as string)
    console.error(error)
    process.exit(1)
  }
}

export const clearDataUsers = async () => {
  try {
    const result = await User.deleteMany({})

    console.log('============================================')
    console.log('✅ Xóa dữ liệu thành công')
    console.log(`Số lượng tài khoản đã xóa: ${result.deletedCount}`)
    console.log('============================================')

    return result.deletedCount
  } catch (error) {
    console.error('❌ Lỗi khi xóa dữ liệu users:', error)
    throw error
  }
}

export const clearConversationAndMessage = async () => {
  try {
    await Message.deleteMany({})
    const result = await Conversation.deleteMany({})

    console.log('============================================')
    console.log('✅ Xóa dữ liệu thành công')
    console.log(`Số lượng cuộc trò chuyện đã xóa: ${result.deletedCount}`)
    console.log('============================================')

    return result.deletedCount
  } catch (error) {
    console.error('❌ Lỗi khi xóa dữ liệu users:', error)
    throw error
  }
}
