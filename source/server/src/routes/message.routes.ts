import express from 'express'

export const messageRouter = express.Router()

import { getAllMessageOfConversation } from '~/controllers/message.controller'
import { authenticateToken } from '~/middlewares/user.middlewares'
/**
 * Định nghĩa các route liên quan đến message
 */

messageRouter.use(authenticateToken)
messageRouter.get('/:conversationId', getAllMessageOfConversation)

export default messageRouter