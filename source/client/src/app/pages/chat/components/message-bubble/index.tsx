import { Avatar } from 'antd'
import { UserOutlined, FileOutlined, DownloadOutlined } from '@ant-design/icons'
import type { Message } from '@/shared/types/chat.type'

type MessageBubbleProp = {
  message: Message
}

const handleOnClick = (url: string) => {
  const urlPreview = `http://localhost:8080${url}`
  console.log(urlPreview)
  window.open(urlPreview, '_blank')
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

const MessageBubble = ({ message }: MessageBubbleProp) => {
  const isFile = message.type === 'file' && message.media?.url

  return (
    <div className={`flex items-end gap-2 ${message.isMe ? 'flex-row-reverse' : ''} mb-3`}>
      {/* Avatar cho người khác */}
      {!message.isMe && <Avatar icon={<UserOutlined />} size='small' style={{ backgroundColor: '#1677ff' }} />}

      <div className='flex max-w-[75%] flex-col'>
        {/* Username */}
        {!message.isMe && <span className='mb-1 text-xs font-medium text-gray-500'>{message.senderId.username}</span>}

        <div
          className={`relative rounded-2xl shadow-sm ${
            message.isMe
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'border border-gray-200 bg-white text-gray-800'
          } overflow-hidden break-words`}
          style={{
            wordBreak: 'break-word', // ép ngắt dòng khi chuỗi quá dài
            overflowWrap: 'anywhere' // cho phép ngắt giữa các ký tự nếu không có khoảng trắng
          }}
        >
          {isFile ? (
            // Giao diện file
            <div
              className={`flex cursor-pointer items-center gap-3 p-3 transition-all duration-200 ${
                message.isMe ? 'hover:bg-blue-700/80' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleOnClick(message.media!.url)}
            >
              {/* Icon file */}
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                  message.isMe ? 'bg-blue-400' : 'bg-blue-100'
                }`}
              >
                <FileOutlined className={`text-xl ${message.isMe ? 'text-white' : 'text-blue-500'}`} />
              </div>

              {/* Thông tin file */}
              <div className='flex-1 overflow-hidden'>
                <p className={`truncate text-sm font-medium ${message.isMe ? 'text-white' : 'text-gray-900'}`}>
                  {message.media?.originalName || message.content}
                </p>
                {message.media?.size && (
                  <p className={`text-xs ${message.isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatFileSize(message.media.size)}
                  </p>
                )}
              </div>

              {/* Icon tải xuống */}
              <DownloadOutlined className={`text-lg ${message.isMe ? 'text-white' : 'text-blue-500'}`} />
            </div>
          ) : (
            // Giao diện tin nhắn text
            <div className='px-4 py-2 text-sm leading-relaxed'>
              <p
                className='break-words whitespace-pre-wrap'
                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
              >
                {message.content}
              </p>
            </div>
          )}

          {/* Thời gian */}
          <div className={`px-3 pb-1 ${isFile ? 'pt-0' : 'pt-1'} text-right`}>
            <p className={`text-[11px] ${message.isMe ? 'text-blue-100' : 'text-gray-400'}`}>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble