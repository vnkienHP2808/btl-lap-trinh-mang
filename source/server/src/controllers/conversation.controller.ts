import { Response } from 'express'
import Conversation from '~/models/Conversation'
import { AuthRequest } from '~/shared/types/util.type'
import * as jwt from 'jsonwebtoken'
import User from '~/models/User'
import mongoose from 'mongoose'
import logger from '~/shared/utils/log'

/**
 * @param req: AuthRequest
 * @param res: Response
 * @returns
 */
const findOrCreateConversation = async (req: AuthRequest, res: Response) => {
  logger.info('Tìm cuộc hội thoại hoặc tạo mới nếu chưa tồn tại')
  try {
    const { username: receiverUsername } = req.body
    const senderId = (req.user as jwt.JwtPayload).id

    const receiver = await User.findOne({ username: receiverUsername })
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Convert sang ObjectId và sort
    const participant1 = new mongoose.Types.ObjectId(senderId.toString())
    const participant2 = new mongoose.Types.ObjectId(receiver._id.toString())

    const participantIds = [participant1, participant2].sort((a, b) => a.toString().localeCompare(b.toString()))

    // Dùng findOneAndUpdate với upsert
    const conversation = await Conversation.findOneAndUpdate(
      { participants: participantIds },
      {
        $setOnInsert: {
          participants: participantIds,
          readStatus: [
            { userId: participantIds[0], lastReadMessageId: null },
            { userId: participantIds[1], lastReadMessageId: null }
          ]
        }
      },
      {
        upsert: true, // Tạo mới nếu không tồn tại
        new: true,
        setDefaultsOnInsert: true
      }
    ).populate('participants', 'username status lastSeen')

    return res.json({
      success: true,
      message: 'Tạo cuộc trò chuyện thành công',
      data: conversation
    })
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    })
  }
}

/**
 * Lấy tất cả người dùng trừ người dùng hiện tại
 * @param req: AuthRequest
 * @param res: Response
 * @returns Danh sách tất cả người dùng trừ người dùng hiện tại
 */
const getAllUserExceptCurrent = async (req: AuthRequest, res: Response) => {
  logger.info('Lấy tất cả người dùng trừ người dùng hiện tại')
  try {
    const currentUserId = (req.user as jwt.JwtPayload).id
    const users = await User.find({
      _id: { $ne: currentUserId }
    }).select('username status lastSeen')

    res.json({ success: true, data: users, message: 'Lấy danh sách người dùng thành công' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export { findOrCreateConversation, getAllUserExceptCurrent }