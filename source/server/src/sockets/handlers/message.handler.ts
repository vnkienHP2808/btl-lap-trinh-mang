import { Server, Socket } from 'socket.io'
import User from '~/models/User'
import Conversation from '~/models/Conversation'
import Message from '~/models/Message'

/**
 * Hàm xử lý toàn bộ các sự kiện liên quan đến tin nhắn (chat)
 */
export const messageHandler = (io: Server, socket: Socket) => {
  /**
   * Sự kiện gửi tin nhắn
   * - Client phát sự kiện 'send-message' khi người dùng gửi tin nhắn cho người khác
   * - Dữ liệu gồm: receiverUsername, content, type, media
   * - Sau khi xử lý, server phản hồi lại qua callback (thành công hoặc lỗi)
   */
  socket.on('send-message', async (data, callback) => {
    try {
      // Lấy thông tin người gửi từ socket
      const { receiverUsername, content, type = 'text', media = [] } = data
      const userId = socket.data.userId
      const username = socket.data.username

      /**
       * 1. Kiểm tra người nhận có tồn tại hay không
       */
      const receiver = await User.findOne({ username: receiverUsername })
      if (!receiver) {
        return callback({
          success: false,
          error: 'Không tìm thấy người nhận'
        })
      }

      /**
       * 2. Kiểm tra xem giữa 2 người đã có cuộc hội thoại chưa
       *    - Nếu chưa, tạo mới 1 conversation
       */
      let conversation = await Conversation.findOne({
        participants: { $all: [userId, receiver._id] }
      })

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [userId, receiver._id]
        })
      }

      /**
       * 3. Tạo message mới trong conversation
       */
      const message = await Message.create({
        conversationId: conversation._id,
        senderId: userId,
        type,
        content,
        media,
        timestamp: new Date()
      })

      /**
       * 4. Cập nhật message cuối cùng (lastMessageId) trong conversation
       */
      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessageId: message._id
      })

      /**
       * 5. Populate thông tin người gửi (username, status)
       */
      await message.populate('senderId', 'username status')

      /**
       * 6. Gửi tin nhắn đến tất cả client trong phòng tương ứng (cả người nhận và người gửi)
       *     - Mỗi cuộc hội thoại tương ứng với 1 room có id = conversation._id
       */
      io.to(conversation._id.toString()).emit('receive-message', {
        message,
        conversationId: conversation._id
      })

      /**
       * 7. Gọi callback trả về kết quả cho client đã gửi
       */
      callback({
        success: true,
        message,
        conversationId: conversation._id
      })
    } catch (error: any) {
      console.error('🚨 Lỗi khi gửi tin nhắn:', error)
      callback({ success: false, error: error.message })
    }
  })
}
