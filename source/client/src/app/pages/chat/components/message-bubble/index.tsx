import { Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import type { Message } from '@/shared/types/chat.type'

type MessageBubbleProp = {
  message: Message
}

const handleOnClick = (url: string) => {
  const urlPreview = `http://localhost:8080${url}`
  console.log(urlPreview)
  window.open(urlPreview, '_blank')
}

const MessageBubble = ({ message }: MessageBubbleProp) => {
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
          {message.content && (
            <p
              className={`break-words whitespace-pre-wrap ${
                message.media?.url
                  ? 'flex cursor-pointer items-center space-x-2 rounded-lg p-2 transition hover:bg-gray-100'
                  : ''
              }`}
              onClick={() => {
                if (message.media?.url) handleOnClick(message.media.url)
              }}
            >
              {message.media?.url ? (
                <>
                  {/* Icon file */}
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 flex-shrink-0 text-blue-500'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M7 21h10a2 2 0 002-2V9l-6-6H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                    />
                  </svg>
                  {/* Tên file */}
                  <span className='text-blue-700 underline'>{message.media.url.split('/').pop()}</span>
                </>
              ) : (
                message.content
              )}
            </p>
          )}

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