import 'dotenv/config'
import express from 'express'
import { clearConversationAndMessage, clearDataUsers, connectDB } from './config/db.config'
import cors from 'cors'
import http from 'http'
import { userRouter } from './routes/user.routes'
import { conversationRouter } from './routes/conversation.routes'
import { messageRouter } from './routes/message.routes'
import { createSocketServer } from './config/socket.config'
import { setupSocket } from './sockets'
import { setupApp } from './config/app.config'
import { fixIndex } from './scripts/fixIndex'
import mongoose from 'mongoose'

const PORT = process.env.PORT || 5000
const app = express()

// setup express app
setupApp(app)

// Đăng ký routes
app.use('/api/user', userRouter)
app.use('/api/message', messageRouter)
app.use('/api/conversations', conversationRouter)

const server = http.createServer(app)
const io = createSocketServer(server)

//set up server socket
setupSocket(io)

const startServer = async () => {
  await connectDB()
  // await fixIndex()
  // await clearDataUsers()
  // await clearConversationAndMessage()
  // await mongoose.connection.dropDatabase()
  server.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`))
}

startServer()
