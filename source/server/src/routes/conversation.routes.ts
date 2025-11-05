import express from 'express'
import { getConversationMessage } from '~/controllers/conversation.controller'
import { authenticateToken } from '~/middlewares/user.middlewares'

export const conversationRouter = express.Router()

conversationRouter.get('/:otherUserId/messages', authenticateToken, getConversationMessage)