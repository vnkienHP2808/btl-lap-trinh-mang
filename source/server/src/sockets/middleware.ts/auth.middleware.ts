import jwt, { JwtPayload } from 'jsonwebtoken'
import { Socket } from 'socket.io'
import User from '~/models/User'

/**
 * Middleware xác thực người dùng cho kết nối socket.io
 * @param socket
 * @param next
 */
export const socketAuth = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    const user = await User.findOne({ username: decoded.username })

    if (!user) return next(new Error('Không tìm thấy người dùng'))

    socket.data.username = decoded.username
    socket.data.userId = user._id.toString()
    next()
  } catch {
    next(new Error('Xác thực thất bại'))
  }
}