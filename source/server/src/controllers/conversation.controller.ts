import { Request, Response } from 'express'
import HTTPStatus from '~/shared/constants/httpStatus'
import logger from '~/shared/utils/log'
import Conversation from '~/models/Conversation'
import { AuthRequest } from '~/shared/types/util.type'
import * as jwt from 'jsonwebtoken'
import User from '~/models/User'
import Message from '~/models/Message'

const getConversationMessage = async (req: AuthRequest, res: Response) => {
    try {
        const payload = req.user
        const currentUserId = (payload as jwt.JwtPayload).id
        const currentUser = await User.findOne({_id: currentUserId}).select('username')

        // Lấy Id người dùng 2
        const otherUserId = req.params.otherUserId
        const otherUser = await User.findOne({_id: otherUserId}).select('username')

        if(!otherUserId){
            return res.status(HTTPStatus.BAD_REQUEST).json({
                status: HTTPStatus.BAD_REQUEST,
                message: "Không có ID của người nhận",
                data: null
            })
        }

        logger.info(`Lấy tin nhắn của cuộc hội thoại giữa ${currentUser?.username} và ${otherUser?.username}`)

        // Tìm cuộc hội thoại dựa trên 2 ID, dùng '$all' để chắc chắn 2 ID phải trong 'participants'
        let conversation = await Conversation.findOne({
            participants: {$all: [currentUserId, otherUserId]}
        })

        if(!conversation){
            logger.info(`Chưa tồn tại cuộc hội thoại giữa ${currentUser?.username} và ${otherUser?.username}. Tạo cuộc hội thoại mới`)
            conversation = new Conversation({
                participants: [currentUserId, otherUserId],
                readStatus: [
                    {userId: currentUserId, lastReadMessageId: null},
                    {userId: otherUserId, lastReadMessageId: null}
                ]
            })
            await conversation.save()

            return res.status(HTTPStatus.OK).json({
                status: HTTPStatus.OK,
                message: "Tạo cuộc trò chuyện thành công",
                data: []
            })
        }

        const conversationId = conversation._id
        const messages = await Message.find({conversationId: conversationId})
                                    .sort({timestamp: -1}) //sắp xếp tin nhắn từ mới nhất đến cũ nhất
                                    .populate('senderId', 'username') // lấy thêm username người gửi
        
        return res.status(HTTPStatus.OK).json({
            status: HTTPStatus.OK, 
            message: `Lấy thành công hội thoại giữa ${currentUser?.username} và ${otherUser?.username}`,
            data: messages
        })
    } catch (error : any) {
        logger.error('Lỗi khi lấy tin nhắn: ', error)
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({
            status: HTTPStatus.INTERNAL_SERVER_ERROR,
            message: 'Lỗi Server. Không thể lấy tin nhắn'
        })
    }
}

export {getConversationMessage}