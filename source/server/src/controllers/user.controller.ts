import { Request, Response } from 'express'
import User from '~/models/User'
import HTTPStatus from '~/shared/constants/httpStatus'
import logger from '~/shared/utils/log'
import * as jwt from 'jsonwebtoken'
import { addToBlacklist } from '~/services/jwt.service'

const test = (req: Request, res: Response) => {
  res.json({ message: 'OK' })
}

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
  } catch (error) {
    console.error('Lỗi đăng nhập:', error)
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
      status: HTTPStatus.INTERNAL_SERVER_ERROR,
      message: 'Đã xảy ra lỗi hệ thống.'
    })
  }
}

const logout = async (req: Request, res: Response) => {
  /**
   * Do sử dụng JWT(Stateless) nên server không lưu giữ trạng thái của user, trong khi jwt này không
   * thể vô hiệu hóa sau khi tạo ra được => Để tránh user dùng access_token gọi lại API sau khi logout
   * thì phía server thường có 1 black list lưu trữ token của user sau khi logout. Nếu nó gọi API sử
   * dụng token này => chặn luôn. Flow để làm tính năng này
   * 1. Trong hàm middleware (user.middleware)
   *  Trước hàm next(), kiểm tra xem cái token này có nằm trong blacklist không (tokenBlacklist)
   *    Nếu có => trả về (status: 401, message: User đã logout, data: null)
   *    Nếu không đi tiếp
   * 2. Trong hàm logout này
   *  Lấy token từ đầu request, cách lấy tương tự bên middleware
   *  Gọi cái hàm thêm vào blacklist trong file service truyền vào 2 tham số
   *    1 là token này
   *    2 là thời gian token được sinh ra (cái này lấy bằng cách giải mã token rồi lấy ra trường iat) + thời gian hết hạn ( đang để là 1 ngày ). Mục đích là truyền sang bên kia
   *    để nó trừ đi thời gian hiện tại xem còn bao nhiêu
   *    addBlackList(1,2)
   */

  // Logout cho người dùng
  logger.info('Đăng xuất cho người dùng')
  try {
    // Laays token trong header
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

    // Thêm token của user vào blacklist
    addToBlacklist(token, payload.exp)

    // do đăng xuất nên cho qua "offline"
    if (payload.id) {
      // lấy từ payload nhưng kém an toàn hơn
      await User.findByIdAndUpdate(payload.id, {
        status: 'offline',
        lastSeen: new Date()
      })
      logger.info(`User Id ${payload.id} đã cập nhật status: offline`)
    }

    logger.info(`Token đã thêm vào Blacklist. Đăng xuất thành công.`)

    return res.status(HTTPStatus.OK).json({
      status: HTTPStatus.OK,
      message: 'Đăng xuất thành công',
      data: null
    })
  } catch (e: any) {
    logger.error('Lỗi khi đăng xuất: ', e)
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
      status: HTTPStatus.INTERNAL_SERVER_ERROR,
      message: 'Lỗi Server trong quá trình đăng xuất.'
    })
  }
}

const getListUser = async (req: Request, res: Response) => {}

export { test, register, login, logout, getListUser }