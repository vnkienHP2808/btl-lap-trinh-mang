import { Server } from 'socket.io'
import http from 'http'

export const createSocketServer = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.ALLOW_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true
    }
  })
  return io
}
