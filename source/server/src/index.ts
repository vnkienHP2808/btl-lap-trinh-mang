import 'dotenv/config'
import express from 'express'
import { clearDataUsers, connectDB } from './config/db.config'
import './models/User'
import './models/Message'
import './models/Conversation'
import cors from 'cors'
import { userRouter } from './routes/user.routes'
import { conversationRouter } from './routes/conversation.routes'

const app = express()
const PORT = process.env.PORT || 5000
app.use(
  cors({
    origin: process.env.ALLOW_ORIGIN
  })
)

app.use(express.json())
app.use('/api/user', userRouter)
app.use('/api/conversations', conversationRouter)

const startServer = async () => {
  await connectDB()
  // await clearDataUsers()
  app.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`))
}

startServer()