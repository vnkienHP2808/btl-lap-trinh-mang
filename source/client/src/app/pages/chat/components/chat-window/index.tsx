import { Input, Button } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import MessageBubble from '../message-bubble'
import useChatWindowHook from './useChatWindowHook'

const { TextArea } = Input

const ChatWindow = () => {
  const { messages, inputValue, loading, messagesEndRef, handleInputChange, handleSend, handleKeyPress } =
    useChatWindowHook()

  if (loading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <span>Đang tải tin nhắn...</span>
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col'>
      {/* Messages area */}
      <div className='flex-1 overflow-y-auto bg-gray-50 p-4'>
        <div className='flex flex-col space-y-4'>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <MessageBubble message={msg} />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className='border-t bg-white p-4'>
        <div className='flex space-x-2'>
          <TextArea
            value={inputValue}
            onChange={handleInputChange}
            placeholder='Nhập tin nhắn...'
            autoSize={{ minRows: 1, maxRows: 4 }}
          />
          <div className='w-3'></div>
          <Button
            type='primary'
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!inputValue.trim()}
            size='large'
          >
            Gửi
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow
