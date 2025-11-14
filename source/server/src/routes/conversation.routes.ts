import express from 'express'
import { findOrCreateConversation, getAllUserExceptCurrent } from '~/controllers/conversation.controller'
import { authenticateToken } from '~/middlewares/user.middlewares'

/**
 * Định nghĩa các route liên quan đến conversation
 */

export const conversationRouter = express.Router()

conversationRouter.use(authenticateToken)

conversationRouter.post('/find-or-create', findOrCreateConversation) // Tìm hoặc tạo conversation với username
conversationRouter.get('/users', getAllUserExceptCurrent)
