/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server, Socket } from 'socket.io'
import fs from 'fs'
import path from 'path'
import Conversation from '~/models/Conversation'
import User from '~/models/User'
import Message from '~/models/Message'
import getExtFromMime from '~/shared/utils/videoHandler'

/**
 * Chunked Video Upload via Socket.IO
 * Sự kiện:
 *  - 'video-metadata'         { fileId, originalName, size, mimeType, totalChunks, receiverUsername }
 *  - 'video-chunk'            { fileId, chunkIndex, totalChunks, data(ArrayBuffer|base64) }
 *  - 'video-upload-complete'  { fileId }
 */
export const uploadVideoHandler = (io: Server, socket: Socket) => {
  const videoUploads = new Map<
    string,
    {
      metadata: any
      receivedChunks: number
      totalChunks: number
      tempFilePath: string
      writeStream: fs.WriteStream | null
    }
  >()

  // 1) Nhận metadata & khởi tạo stream tạm
  socket.on('video-metadata', async (metadata: any, callback: (resp: any) => void) => {
    try {
      console.log('Nhận metadata video:')
      const { fileId, totalChunks, mimeType } = metadata || {}
      if (!fileId || typeof totalChunks !== 'number') {
        return callback({ success: false, error: 'Thiếu fileId/totalChunks' })
      }

      const tmpDir = path.join(process.cwd(), 'uploads', 'tmp', 'videos', fileId)
      fs.mkdirSync(tmpDir, { recursive: true })
      const tempFilePath = path.join(tmpDir, 'video.part' + getExtFromMime(mimeType))

      // mở write stream (ghi tuần tự)
      const writeStream = fs.createWriteStream(tempFilePath, { flags: 'a' })
      videoUploads.set(fileId, {
        metadata,
        receivedChunks: 0,
        totalChunks,
        tempFilePath,
        writeStream
      })

      return callback({ success: true })
    } catch (err: any) {
      console.error(err)
      return callback({ success: false, error: err.message })
    }
  })

  // 2) Nhận từng chunk
  socket.on(
    'video-chunk',
    async (
      payload: { fileId: string; chunkIndex: number; totalChunks: number; data: ArrayBuffer | string },
      callback: (resp: any) => void
    ) => {
      console.log('Nhận chunk video')
      try {
        const { fileId, data } = payload || {}
        const ctx = videoUploads.get(fileId)
        if (!ctx || !ctx.writeStream) {
          return callback({ success: false, error: 'Video upload không tồn tại' })
        }

        const buf = Buffer.isBuffer(data)
          ? (data as Buffer)
          : typeof data === 'string'
            ? Buffer.from(data, 'base64')
            : Buffer.from(new Uint8Array(data as ArrayBuffer))

        // ghi nối tiếp (yêu cầu client gửi tuần tự)
        ctx.writeStream.write(buf)
        ctx.receivedChunks += 1

        return callback({ success: true })
      } catch (err: any) {
        console.error(err)
        return callback({ success: false, error: err.message })
      }
    }
  )

  // 3) Hoàn tất: đóng stream, move sang thư mục final, tạo message
  socket.on('video-upload-complete', async ({ fileId }: { fileId: string }, callback: (resp: any) => void) => {
    try {
      console.log('Hoàn tất upload video:', fileId)
      const ctx = videoUploads.get(fileId)
      if (!ctx || !ctx.writeStream) {
        return callback({ success: false, error: 'Video upload không tồn tại' })
      }

      const { metadata, receivedChunks, totalChunks, tempFilePath, writeStream } = ctx
      if (receivedChunks !== totalChunks) {
        return callback({
          success: false,
          error: `Thiếu chunks: nhận ${receivedChunks}/${totalChunks}`
        })
      }

      // đóng stream
      await new Promise<void>((res, rej) => {
        writeStream.end(() => res())
        writeStream.on('error', (e) => rej(e))
      })

      // chuyển sang thư mục final
      const finalDir = path.join(process.cwd(), 'uploads', 'videos')
      fs.mkdirSync(finalDir, { recursive: true })
      const finalPath = path.join(finalDir, `${fileId}${getExtFromMime(metadata?.mimeType)}`)
      fs.renameSync(tempFilePath, finalPath)
      const url = `/uploads/videos/${path.basename(finalPath)}`

      // dọn map
      videoUploads.delete(fileId)

      // tạo message chat kiểu 'video'
      const senderId = socket.data.userId
      const receiver = await User.findOne({ username: metadata.receiverUsername })
      if (!receiver) return callback({ success: false, error: 'Không tìm thấy người nhận' })

      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiver._id] }
      })
      if (!conversation) {
        conversation = await Conversation.create({ participants: [senderId, receiver._id] })
      }

      const message = await Message.create({
        conversationId: conversation._id,
        senderId: senderId,
        type: 'video',
        content: finalPath, // hoặc URL public nếu có static/CDN
        media: {
          url: url,
          mimeType: metadata.mimeType,
          fileName: path.basename(finalPath),
          originalName: metadata.originalName,
          size: metadata.size
        }
      })

      await message.populate('senderId', 'username status')

      const roomId = String(conversation._id)
      io.to(roomId).emit('receive-message', { message, conversationId: conversation._id })

      return callback({ success: true, message, conversationId: conversation._id, path: finalPath })
    } catch (err: any) {
      return callback({ success: false, error: err.message })
    }
  })
}
