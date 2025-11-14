/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server, Socket } from 'socket.io'
import Message from '~/models/Message'
import User from '~/models/User'
import Conversation from '~/models/Conversation'
import fs from 'fs'
import path from 'path'

/**
 * Hàm xử lý toàn bộ các sự kiện liên quan đến tin nhắn (chat)
 * @param io: Server - Đối tượng Socket.io server
 * @param socket: Socket - Đối tượng Socket đại diện cho kết nối của một client
 *
 */
export const messageHandler = (io: Server, socket: Socket) => {
  /**
   * Sự kiện gửi tin nhắn
   * - Client phát sự kiện 'send-message' khi người dùng gửi tin nhắn cho người khác
   * - Dữ liệu gồm: {receiverUsername, content, type, media}
   * - Sau khi xử lý, server phản hồi lại qua callback (thành công hoặc lỗi). Callback ở đây hiểu đơn giản là 1 cái hàm được truyền từ ngoài (Client) vào. Cái này sẽ sử lý theo từng trường hợp cụ thể
   * =============================================
   * Ví dụ Callback:
   *  ======= (Client)
   * socket.emit('send-message', data, (response) => {
   *  if (response.success) {
   *   // Gửi thành công
   *  } else {
   *  // Gửi thất bại
   * }
   * })
   * Thì cái hàm ở trong on('send-message', ...) này chính là phần callback
   * 
   * Trên Server lắng nghe sự kiện send-message, lúc nó xử lý xong gọi hàm này => Client sẽ chạy cái hàm đấy
   * ======= (Server)
   * socket.on('send-message', async (data, callback) => {
   * // data: dữ liệu client gửi lên
   * // callback: một hàm client gửi kèm để nhận phản hồi
   * // xử lý xong...
   * callback({
    success: true,
    message: 'Tin nhắn đã được lưu!'
    })
   })
   */
  socket.on('send-message', async (data, callback) => {
    try {
      // Lấy thông tin người gửi từ socket
      const { receiverUsername, content, type = 'text', media = null } = data
      console.log(data)
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
       * 2. Tạo message mới trong conversation
       */
      let conversation = await Conversation.findOne({
        participants: { $all: [userId, receiver._id] }
      })

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [userId, receiver._id]
        })
      }

      const messageData: any = {
        conversationId: conversation._id,
        senderId: userId,
        type,
        content,
        timestamp: new Date()
      }

      if (media && Object.keys(media).length > 0) {
        messageData.media = media
      }

      const message = await Message.create(messageData)

      /**
       * 3. Cập nhật message cuối cùng (lastMessageId) trong conversation
       */
      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessageId: message._id
      })

      /**
       * 4. Populate thông tin người gửi (username, status)
       */
      await message.populate('senderId', 'username status')

      /**
       * 5. Gửi tin nhắn đến tất cả client trong phòng tương ứng (cả người nhận và người gửi)
       *     - Mỗi cuộc hội thoại tương ứng với 1 room có id = conversation._id
       */
      io.to(conversation._id.toString()).emit('receive-message', {
        message,
        conversationId: conversation._id
      })
      console.log('phát đi sự kiện nhận tin nhắn')

      /**
       * 6. Gọi callback trả về kết quả cho client đã gửi
       */
      callback({
        success: true,
        message,
        conversationId: conversation._id
      })
    } catch (error: any) {
      console.error(error)
      callback({ success: false, error: error.message })
    }
  })

  const fileUploads = new Map<
    string,
    {
      metadata: any
      chunks: Map<number, string>
      receivedChunks: number
    }
  >()

  // 1. Nhận metadata
  socket.on('file-metadata', async (metadata, callback) => {
    try {
      const { fileId, originalName, size, mimeType, totalChunks, receiverUsername } = metadata

      console.log('Nhận metadata:')
      console.log('- File ID:', fileId)
      console.log('- Name:', originalName)
      console.log('- Size:', size)
      console.log('- Total chunks:', totalChunks)

      // Kiểm tra người nhận
      const receiver = await User.findOne({ username: receiverUsername })
      if (!receiver) {
        return callback({
          success: false,
          error: 'Không tìm thấy người nhận'
        })
      }

      // Lưu metadata vào map
      fileUploads.set(fileId, {
        metadata: {
          originalName,
          size,
          mimeType,
          totalChunks,
          receiverUsername,
          senderId: socket.data.userId
        },
        chunks: new Map(),
        receivedChunks: 0
      })

      callback({ success: true })
    } catch (error: any) {
      console.error(error)
      callback({ success: false, error: error.message })
    }
  })

  // 2. Nhận từng chunk
  socket.on('file-chunk', async (chunkData, callback) => {
    try {
      const { fileId, chunkIndex, data } = chunkData

      const upload = fileUploads.get(fileId)
      if (!upload) {
        return callback({
          success: false,
          error: 'File upload không tồn tại'
        })
      }

      // Lưu chunk
      upload.chunks.set(chunkIndex, data)
      upload.receivedChunks++

      console.log(`Received chunk ${chunkIndex + 1}/${upload.metadata.totalChunks} for file ${fileId}`)

      callback({ success: true })
    } catch (error: any) {
      console.error(error)
      callback({ success: false, error: error.message })
    }
  })

  // 3. Hoàn tất upload - merge chunks
  socket.on('file-upload-complete', async (data, callback) => {
    try {
      const { fileId, receiverUsername } = data
      const userId = socket.data.userId

      const upload = fileUploads.get(fileId)
      if (!upload) {
        return callback({
          success: false,
          error: 'File upload không tồn tại'
        })
      }

      console.log('Gộp các chunk cho file:', fileId)

      // Kiểm tra đủ chunks chưa
      if (upload.receivedChunks !== upload.metadata.totalChunks) {
        return callback({
          success: false,
          error: `Thiếu chunks: nhận ${upload.receivedChunks}/${upload.metadata.totalChunks}`
        })
      }

      // Merge chunks
      const uploadDir = path.join(process.cwd(), 'uploads')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const fileName = `${Date.now()}_${upload.metadata.originalName}`
      const filePath = path.join(uploadDir, fileName)

      // Gộp các chunks theo thứ tự
      const writeStream = fs.createWriteStream(filePath)

      for (let i = 0; i < upload.metadata.totalChunks; i++) {
        const chunkData = upload.chunks.get(i)
        if (!chunkData) {
          throw new Error(`Missing chunk ${i}`)
        }

        // Ghi chunk vào file
        const buffer = Buffer.from(chunkData, 'base64')
        writeStream.write(buffer)
      }

      writeStream.end()

      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', () => resolve())
        writeStream.on('error', reject)
      })

      console.log('File sau khi gộp thành công:', filePath)

      // Xóa khỏi map
      fileUploads.delete(fileId)

      // Tạo message như cũ
      const receiver = await User.findOne({ username: receiverUsername })
      if (!receiver) {
        return callback({
          success: false,
          error: 'Không tìm thấy người nhận'
        })
      }

      let conversation = await Conversation.findOne({
        participants: { $all: [userId, receiver._id] }
      })

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [userId, receiver._id]
        })
      }

      const message = await Message.create({
        conversationId: conversation._id,
        senderId: userId,
        type: 'file',
        content: upload.metadata.originalName,
        media: {
          fileName: fileName,
          originalName: upload.metadata.originalName,
          size: upload.metadata.size,
          mimeType: upload.metadata.mimeType,
          url: `/uploads/${fileName}`
        },
        timestamp: new Date()
      })

      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessageId: message._id
      })

      await message.populate('senderId', 'username status')

      io.to(conversation._id.toString()).emit('receive-message', {
        message,
        conversationId: conversation._id
      })

      callback({
        success: true,
        message,
        conversationId: conversation._id
      })
    } catch (error: any) {
      console.error(error)

      // Cleanup nếu có lỗi
      fileUploads.delete(data.fileId)

      callback({ success: false, error: error.message })
    }
  })

  // Cleanup khi socket disconnect
  socket.on('disconnect', () => {
    // Xóa các file upload chưa hoàn thành của user này
    for (const [fileId, upload] of fileUploads.entries()) {
      if (upload.metadata.senderId === socket.data.userId) {
        fileUploads.delete(fileId)
      }
    }
  })
}
