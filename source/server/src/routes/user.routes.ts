import express from 'express'
import { getListUser, login, logout, register, test } from '~/controllers/user.controller'
import { authenticateToken } from '~/middlewares/user.middleware'
/**
 * Định nghĩa các route liên quan đến user
 */

export const userRouter = express.Router()

userRouter.post('/login', login)
userRouter.post('/register', register)
userRouter.post('/logout', logout)

userRouter.use(authenticateToken) // áp dụng middleware xác thực token cho các route bên dưới

userRouter.get('/test', test)
userRouter.get('/list', getListUser)
