import express from 'express'

import { getAllMessageOfConversation } from '~/controllers/message.controller'
import { authenticateToken } from '~/middlewares/user.middlewares'
/**
 * Định nghĩa các route liên quan đến message
 */
export const messageRouter = express.Router()

messageRouter.use(authenticateToken)
messageRouter.get('/:conversationId', getAllMessageOfConversation)

export default messageRouter
