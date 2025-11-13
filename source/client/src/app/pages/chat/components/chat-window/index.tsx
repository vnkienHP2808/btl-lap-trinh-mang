import { Input, Button } from 'antd'
import { PaperClipOutlined, SendOutlined } from '@ant-design/icons'
import MessageBubble, { type MessageBubbleProps } from '../message-bubble'
import useChatWindowHook from './useChatWindowHook'

const { TextArea } = Input

const ChatWindow = () => {
  const {
    handleFileSelect,
    messages,
    inputValue,
    loading,
    messagesEndRef,
    handleInputChange,
    handleSend,
    handleKeyPress,
    setUploadingFile,
    uploadingFile
  } = useChatWindowHook()

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
          {messages.map((msg, index) => {
            const convertedMsg: MessageBubbleProps = {
              message: {
                _id: msg.id,
                content: msg.content,
                timestamp: msg.timestamp,
                isMe: msg.isMe,
                senderId: {
                  username: msg.senderId.username
                }
              }
            }
            return (
              <div key={index} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                <MessageBubble message={convertedMsg.message} />
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
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
          <input id='file-input' type='file' style={{ display: 'none' }} onChange={handleFileSelect} multiple />
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