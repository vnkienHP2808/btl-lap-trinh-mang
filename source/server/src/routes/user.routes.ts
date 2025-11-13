import express from 'express'
import { getListUser, login, logout, register } from '~/controllers/user.controller'
import { authenticateToken } from '~/middlewares/user.middlewares'
/**
 * Định nghĩa các route liên quan đến user
 */

export const userRouter = express.Router()

userRouter.post('/login', login)
userRouter.post('/register', register)
userRouter.post('/logout', logout)

userRouter.use(authenticateToken)

userRouter.get('/list', getListUser)