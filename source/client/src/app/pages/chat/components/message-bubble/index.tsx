import React from 'react'
import { Avatar, Typography } from 'antd'
import { PaperClipOutlined } from '@ant-design/icons'
import type { Message } from '@/shared/types/chat.type'

const { Text } = Typography

interface MessageBubbleProps {
  message: Message
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { isMe, senderName, content, type } = message

  const bubbleClass = isMe ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'

  return (
    <div className={`flex max-w-[60%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
      {!isMe && (
        <Avatar className='flex-shrink-0' style={{ backgroundColor: '#f56a00' }}>
          {senderName.charAt(0).toUpperCase()}
        </Avatar>
      )}

      <div className='flex flex-col items-start'>
        {!isMe && <Text className='mb-1 text-xs text-gray-500'>{senderName}</Text>}

        <div className={`rounded-xl p-3 break-words shadow-md ${bubbleClass}`}>
          {type === 'text' && content}
          {type === 'file' && (
            <div className='flex items-center space-x-2 text-sm'>
              <PaperClipOutlined />
              <a href='#' className={isMe ? 'text-white underline' : 'text-blue-500 underline'}>
                {content}
              </a>
            </div>
          )}
        </div>
      </div>

      {isMe && (
        <Avatar className='flex-shrink-0' style={{ backgroundColor: '#3b82f6' }}>
          {senderName.charAt(0).toUpperCase()}
        </Avatar>
      )}
    </div>
  )
}

export default MessageBubble