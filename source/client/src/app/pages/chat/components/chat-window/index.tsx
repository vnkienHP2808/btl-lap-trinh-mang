import { Input, Button } from 'antd'
import { PaperClipOutlined, SendOutlined } from '@ant-design/icons'
import MessageBubble from '../message-bubble'
import useChatWindowHook from './useChatWindowHook'
import storageService from '@/shared/services/storage.service'

const { TextArea } = Input

const ChatWindow = () => {
  const username = storageService.getUsernameFromLS()
  const {
    messages,
    inputValue,
    messagesEndRef,
    uploadingFile,
    handleFileSelect,
    handleInputChange,
    handleSend,
    handleKeyPress
  } = useChatWindowHook()

  return (
    <div className='flex h-full flex-col'>
      {/* Khu vực hiện message */}
      <div className='flex-1 overflow-y-auto bg-gray-50 p-4'>
        <div className='flex flex-col space-y-4'>
          {messages.map((msg, index) => {
            const isMe = msg.senderId.username === username
            console.log(`${msg.senderId.username}  ${username}`)
            const msgConverted = {
              ...msg,
              isMe: isMe
            }
            return (
              <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <MessageBubble message={msgConverted} />
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Khu vực hiện ô nhập Input */}
      <div className='border-t bg-white p-4'>
        <div className='flex space-x-2'>
          <Button
            type='text'
            icon={<PaperClipOutlined />}
            onClick={() => document.getElementById('file-input')?.click()}
            size='large'
            title='Đính kèm file'
            loading={uploadingFile}
            disabled={uploadingFile}
          />

          <input id='file-input' type='file' style={{ display: 'none' }} onChange={handleFileSelect} />

          <TextArea
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
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
