import { Response } from 'express'
import Message from '~/models/Message'
import { AuthRequest } from '~/shared/types/util.type'
import logger from '~/shared/utils/log'

/**
 * Hàm này lấy ra tất cả tin nhắn trong một cuộc hội thoại dựa trên conversationId
 * @param req: AuthRequest
 * @param res: Response
 * @returns Danh sách tin nhắn trong cuộc hội thoại đã được sắp xếp theo thời gian
 */
const getAllMessageOfConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params
    logger.info(`Lấy tất cả tin nhắn cho cuộc hội thoại ID: [${conversationId}]`)
    const { limit = 50, skip = 0 } = req.query

    const messages = await Message.find({ conversationId })
      .sort({ timestamp: 1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate('senderId', 'username status')

    res.json({ success: true, messages: 'Lấy thành công tin nhắn đoạn chat', data: messages })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export { getAllMessageOfConversation }
