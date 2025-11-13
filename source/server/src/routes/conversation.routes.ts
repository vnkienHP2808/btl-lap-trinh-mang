import express from 'express'
import {
  findOrCreateConversation,
  getAllConversationMessages,
  getAllUserExceptCurrent,
  getConversationMessage
} from '~/controllers/conversation.controller'

import { authenticateToken } from '~/middlewares/user.middleware'

export const conversationRouter = express.Router()

conversationRouter.use(authenticateToken)

conversationRouter.get('/:otherUserId/messages', getConversationMessage)
conversationRouter.get('/get-all', getAllConversationMessages) // Lấy tất cả conversations
conversationRouter.post('/find-or-create', findOrCreateConversation) // Tìm hoặc tạo conversation với username
conversationRouter.get('/users', getAllUserExceptCurrent) // Lấy tất cả users (trừ current user)
