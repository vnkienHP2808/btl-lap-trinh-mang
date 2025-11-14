import 'dotenv/config'
import express from 'express'
import { connectDB } from './config/db.config'
import http from 'http'
import { userRouter } from './routes/user.routes'
import { conversationRouter } from './routes/conversation.routes'
import { messageRouter } from './routes/message.routes'
import { createSocketServer } from './config/socket.config'
import { setupSocket } from './sockets'
import { setupApp } from './config/app.config'
import path from 'path'

const PORT = process.env.PORT || 5000
const app = express()

// setup express app
setupApp(app)

// Đăng ký routes
app.use('/api/user', userRouter)
app.use('/api/message', messageRouter)
app.use('/api/conversations', conversationRouter)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

const server = http.createServer(app)
const io = createSocketServer(server)

//set up server socket
setupSocket(io)

const startServer = async () => {
  await connectDB()
  server.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`))
}

startServer()