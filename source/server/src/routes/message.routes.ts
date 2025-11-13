import express from 'express'

export const messageRouter = express.Router()

import { getAllMessageOfConversation } from '~/controllers/message.controller'
import { authenticateToken } from '~/middlewares/user.middleware'

messageRouter.use(authenticateToken)

// Lấy messages của conversation
messageRouter.get('/:conversationId', getAllMessageOfConversation)

export default messageRouter
