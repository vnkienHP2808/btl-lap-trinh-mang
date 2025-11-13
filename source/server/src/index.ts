import 'dotenv/config'
import express from 'express'
import { clearDataUsers, connectDB } from './config/db.config'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import { userRouter } from './routes/user.routes'
import { conversationRouter } from './routes/conversation.routes'
import { messageRouter } from './routes/message.routes'
import jwt, { JwtPayload } from 'jsonwebtoken'
import Message from './models/Message'
import User from './models/User'
import Conversation from './models/Conversation'

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

const io = new Server(server, {
  cors: {
    origin: process.env.ALLOW_ORIGIN, // hoặc process.env.ALLOW_ORIGIN
    methods: ['GET', 'POST'],
    credentials: true
  }
})

app.use(
  cors({
    origin: process.env.ALLOW_ORIGIN
  })
)
app.use(express.json())

// Đăng ký routes
app.use('/api/user', userRouter)
app.use('/api/message', messageRouter)
app.use('/api/conversations', conversationRouter)

// Socket.IO Authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload

    const user = await User.findOne({ username: decoded.username })
    if (!user) {
      return next(new Error('User not found'))
    }

    socket.data.username = decoded.username
    socket.data.userId = user._id.toString()
    next()
  } catch {
    next(new Error('Authentication error'))
  }
})

// Socket Connection
io.on('connection', async (socket) => {
  const username = socket.data.username
  const userId = socket.data.userId

  console.log(`User connected: ${username}`)

  // Update status online
  await User.findById(userId).updateOne({
    status: 'online',
    lastSeen: new Date()
  })

  // Join conversations
  socket.on('join-conversations', async (conversationIds: string[]) => {
    conversationIds.forEach((id) => {
      socket.join(id)
    })
    console.log(`${username} joined ${conversationIds.length} conversations`)
  })

  // Send message
  socket.on('send-message', async (data, callback) => {
    try {
      const { receiverUsername, content, type = 'text', media = [] } = data

      // Tìm receiver bằng username
      const receiver = await User.findOne({ username: receiverUsername })
      if (!receiver) {
        return callback({
          success: false,
          error: 'Receiver not found'
        })
      }

      // Tìm hoặc tạo conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [userId, receiver._id] }
      })

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [userId, receiver._id]
        })
      }

      // Tạo message
      const message = await Message.create({
        conversationId: conversation._id,
        senderId: userId,
        type,
        content,
        media,
        timestamp: new Date()
      })

      // Update lastMessageId
      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessageId: message._id
      })

      // Populate sender info
      await message.populate('senderId', 'username status')

      // Emit tới room
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
      console.error('Error sending message:', error)
      callback({ success: false, error: error.message })
    }
  })

  // Disconnect
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${username}`)

    // Update status offline
    await User.findById(userId).updateOne({
      status: 'offline',
      lastSeen: new Date()
    })
  })
})

const startServer = async () => {
  await connectDB()
  // await clearDataUsers()
  server.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`))
}

startServer()
