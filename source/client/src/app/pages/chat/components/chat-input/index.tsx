import { Input, Button } from 'antd'
import { SendOutlined, PaperClipOutlined } from '@ant-design/icons'
import useChatInputHook from './useChatInputHook'

const ChatInput = () => {
  const { handleFileAttach, handleSend, message, setMessage } = useChatInputHook()

  return (
    <div className='flex items-center bg-white p-4'>
      <Button
        type='text'
        icon={<PaperClipOutlined className='text-xl' />}
        onClick={handleFileAttach}
        className='mr-2'
      />

      <Input
        placeholder='Nhập tin nhắn...'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onPressEnter={handleSend}
        className='h-10 rounded-full'
      />

      <Button
        type='primary'
        icon={<SendOutlined />}
        onClick={handleSend}
        disabled={!message.trim()}
        className='ml-2 flex h-10 w-10 items-center justify-center rounded-full'
      />
    </div>
  )
}

export default ChatInput
