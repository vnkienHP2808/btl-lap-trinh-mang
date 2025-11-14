import { Request, Response } from 'express'
import User from '~/models/User'
import HTTPStatus from '~/shared/constants/httpStatus'
import logger from '~/shared/utils/log'
import * as jwt from 'jsonwebtoken'
import { addToBlacklist } from '~/services/jwt.service'
import { AuthRequest } from '~/shared/types/util.type'

const register = async (req: Request, res: Response) => {
  logger.info('Đăng ký người dùng mới')
  try {
    const { username, password } = req.body
    const existingUser = await User.findOne({ username })

    if (existingUser) {
      logger.warn(`Lỗi đăng ký: Tên người dùng "${username}" đã tồn tại.`)
      return res.status(HTTPStatus.CONFLICT).json({
        status: HTTPStatus.CONFLICT,
        message: 'Tên người dùng đã tồn tại.',
        data: null
      })
    }

    const newUser = new User({
      username: username,
      password: password
    })

    const savedUser = await newUser.save()
    logger.info(`Đăng ký thành công người dùng ID: ${savedUser._id}`)
    res.status(HTTPStatus.CREATED).json({
      status: HTTPStatus.CREATED,
      message: 'Đăng ký thành công',
      data: {
        id: savedUser._id,
        username: savedUser.username
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    logger.error('Lỗi khi đăng ký người dùng:', e)

    if (e.name === 'ValidationError') {
      return res.status(HTTPStatus.BAD_REQUEST).json({
        status: HTTPStatus.BAD_REQUEST,
        message: e.message || 'Dữ liệu đăng ký không hợp lệ.',
        data: null
      })
    }
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
      status: HTTPStatus.INTERNAL_SERVER_ERROR,
      message: 'Lỗi máy chủ nội bộ trong quá trình đăng ký.',
      data: null
    })
  }
}

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body
  logger.info(`User [${username}] đăng nhập vào hệ thống`)
  if (!username || !password) {
    return res.status(HTTPStatus.BAD_REQUEST).json({
      status: HTTPStatus.BAD_REQUEST,
      message: 'Vui lòng cung cấp đầy đủ tên đăng nhập và mật khẩu.'
    })
  }
  try {
    const user = await User.findOne({ username: username })
    if (!user) {
      return res.status(HTTPStatus.UNAUTHORIZED).json({
        status: HTTPStatus.UNAUTHORIZED,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng.'
      })
    }
    const isPasswordValid = password === user.password
    if (!isPasswordValid) {
      return res.status(HTTPStatus.UNAUTHORIZED).json({
        status: HTTPStatus.UNAUTHORIZED,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng.'
      })
    }
    const Payload = {
      id: user.id,
      username: user.username,
      status: 'online',
      lastSeen: user.lastSeen
    }
    const access_token = jwt.sign(Payload, process.env.JWT_SECRET as string, {
      expiresIn: '1d'
    })
    return res.status(HTTPStatus.OK).json({
      status: HTTPStatus.OK,
      message: 'Đăng nhập thành công',
      data: {
        access_token: access_token,
        user_info: Payload
      }
    })
  } catch {
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
      status: HTTPStatus.INTERNAL_SERVER_ERROR,
      message: 'Lỗi server'
    })
  }
}

const logout = async (req: Request, res: Response) => {
  logger.info('Đăng xuất cho người dùng')
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(HTTPStatus.UNAUTHORIZED).json({
        status: HTTPStatus.UNAUTHORIZED,
        message: 'Không tìm thấy Access Token.'
      })
    }

    // Lấy exprity time của token
    const payload = jwt.decode(token)
    if (typeof payload === 'string' || !payload || !payload.exp) {
      return res.status(HTTPStatus.BAD_REQUEST).json({
        status: HTTPStatus.BAD_REQUEST,
        message: 'Access token không hợp lệ.'
      })
    }

    addToBlacklist(token, payload.exp)

    if (payload.id) {
      await User.findByIdAndUpdate(payload.id, {
        status: 'offline',
        lastSeen: new Date()
      })
      logger.info(`User [${payload.username}] đã cập nhật status: offline`)
    }

    return res.status(HTTPStatus.OK).json({
      status: HTTPStatus.OK,
      message: 'Đăng xuất thành công',
      data: null
    })
  } catch {
    logger.error('Lỗi khi đăng xuất: ')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
      status: HTTPStatus.INTERNAL_SERVER_ERROR,
      message: 'Lỗi Server'
    })
  }
}

const getListUser = async (req: AuthRequest, res: Response) => {
  logger.info('Lấy danh sách người dùng')
  try {
    const payload = req.user
    const currentUserId = (payload as jwt.JwtPayload).id
    const listUser = await User.find({ _id: { $ne: currentUserId } }).select('username status lastSeen, createdAt')
    if (listUser.length) {
      return res.status(HTTPStatus.OK).json({
        status: HTTPStatus.OK,
        message: 'Lấy danh sách người dùng thành công',
        data: listUser
      })
    } else {
      return res.status(HTTPStatus.NO_CONTENT).json({
        status: HTTPStatus.NO_CONTENT,
        message: 'Danh sách người dùng hiện đang trống',
        data: listUser
      })
    }
  } catch {
    logger.error('Lỗi không thể lấy danh sách người dùng')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
      status: HTTPStatus.INTERNAL_SERVER_ERROR,
      message: 'Lỗi server',
      data: null
    })
  }
}

export { register, login, logout, getListUser }
