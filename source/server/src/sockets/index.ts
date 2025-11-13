import { Server } from 'socket.io'
import User from '~/models/User'
import { messageHandler } from './handlers/message.handler'
import { socketAuth } from './middleware.ts/auth.middleware'

export const setupSocket = (io: Server) => {
  io.use(socketAuth)

  io.on('connection', async (socket) => {
    const username = socket.data.username
    const userId = socket.data.userId

    console.log(`User connected: ${username}`)

    await User.findById(userId).updateOne({ status: 'online', lastSeen: new Date() })

    // Join conversation rooms
    socket.on('join-conversations', (conversationIds: string[]) => {
      conversationIds.forEach((id) => socket.join(id))
      console.log(`${username} joined ${conversationIds.length} rooms`)
    })

    // Handlers
    messageHandler(io, socket)

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${username}`)
      await User.findById(userId).updateOne({ status: 'offline', lastSeen: new Date() })
    })
  })
}
