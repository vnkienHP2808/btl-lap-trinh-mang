import express from 'express'
import {
  findOrCreateConversation,
  getAllConversationMessages,
  getAllUserExceptCurrent
} from '~/controllers/conversation.controller'
import { authenticateToken } from '~/middlewares/user.middlewares'

/**
 * Định nghĩa các route liên quan đến conversation
 */

export const conversationRouter = express.Router()

conversationRouter.use(authenticateToken) // áp dụng middlware xác thực cho tất cả các route bên dưới nó. Còn cái nào đặt ở trên thì không cần do code chạy từ trên xuống

conversationRouter.get('/get-all', getAllConversationMessages) // Lấy tất cả conversations
conversationRouter.post('/find-or-create', findOrCreateConversation) // Tìm hoặc tạo conversation với username
conversationRouter.get('/users', getAllUserExceptCurrent) // Lấy tất cả users (trừ current user)
