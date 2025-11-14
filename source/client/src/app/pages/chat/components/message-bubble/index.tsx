import { Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import type { Message } from '@/shared/types/chat.type'

type MessageBubbleProp = {
  message: Message
}

const buildAbsoluteUrl = (url?: string) => {
  if (!url) return ''
  // Backend phục vụ static ở http://localhost:8080, media.url dạng "/uploads/xxx.mp4"
  if (url.startsWith('http')) return url
  return `http://localhost:8080${url}`
}

const MessageBubble = ({ message }: MessageBubbleProp) => {
  const isVideo = Boolean(message.media?.mimeType?.startsWith('video/'))
  const fileUrl = buildAbsoluteUrl(message.media?.url)

  return (
    <div
      className={`flex items-end gap-2 ${message.isMe ? 'flex-row-reverse justify-start' : 'flex-row justify-start'}`}
    >
      {!message.isMe && <Avatar icon={<UserOutlined />} size='small' style={{ backgroundColor: '#1890ff' }} />}

      <div className={`flex max-w-[70%] flex-col ${message.isMe ? 'items-end' : 'items-start'}`}>
        {!message.isMe && <span className='mb-1 text-xs text-gray-500'>{message.senderId.username}</span>}

        <div
          className={`rounded-lg px-4 py-2 ${message.isMe ? 'bg-blue-500 text-white' : 'border border-gray-200 bg-white text-gray-800'}`}
        >
          {/* Nội dung */}
          {isVideo ? (
            <div className='space-y-2'>
              <video
                src={fileUrl}
                controls
                playsInline
                crossOrigin='anonymous' // để CORS rõ ràng cho video
                preload='metadata'
                className='max-h-64 w-full rounded-md'
              />
              <div className='flex items-center justify-between text-xs'>
                <span className='truncate'>{message.media?.originalName || message.content}</span>
                <a href={fileUrl} download className='text-white underline hover:text-blue-100'>
                  Tải xuống
                </a>
              </div>
            </div>
          ) : message.media?.url ? (
            // fallback: file khác loại -> vẫn để link như cũ
            <a
              href={fileUrl}
              target='_blank'
              rel='noreferrer'
              className={`${message.isMe ? '!text-white' : '!text-black'} underline hover:text-blue-100`}
            >
              File tài liệu: {message.media.url.split('/').pop()}
            </a>
          ) : (
            <p className='break-words whitespace-pre-wrap'>{message.content}</p>
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
