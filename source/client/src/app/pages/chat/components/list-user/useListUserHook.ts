import { Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'

interface MessageBubbleProps {
  message: {
    _id: string
    content?: string
    timestamp: Date
    isMe: boolean
    senderId: {
      username: string
    }
  }
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  return (
    <div className={`flex items-end space-x-2 ${message.isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar chỉ hiện cho tin nhắn người khác */}
      {!message.isMe && <Avatar icon={<UserOutlined />} size='small' style={{ backgroundColor: '#1890ff' }} />}

      <div className='flex max-w-[70%] flex-col'>
        {/* Username chỉ hiện cho tin nhắn người khác */}
        {!message.isMe && <span className='mb-1 text-xs text-gray-500'>{message.senderId.username}</span>}

        <div
          className={`rounded-lg px-4 py-2 ${
            message.isMe ? 'bg-blue-500 text-white' : 'border border-gray-200 bg-white text-gray-800'
          }`}
        >
          {message.content && <p className='break-words whitespace-pre-wrap'>{message.content}</p>}

          <p className={`mt-1 text-xs ${message.isMe ? 'text-blue-100' : 'text-gray-400'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble