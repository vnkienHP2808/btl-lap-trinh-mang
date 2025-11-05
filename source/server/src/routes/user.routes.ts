import express from 'express'
import { getListUser, login, logout, register, test } from '~/controllers/user.controller'
import { authenticateToken } from '~/middlewares/user.middlewares'

export const userRouter = express.Router()

userRouter.get('/test', authenticateToken, test)
userRouter.get('/list', authenticateToken, getListUser)

userRouter.post('/login', login)
userRouter.post('/register', register)
userRouter.post('/logout', logout)