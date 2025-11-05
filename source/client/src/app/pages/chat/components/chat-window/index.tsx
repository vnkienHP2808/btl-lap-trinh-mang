import MessageBubble from '../message-bubble'
import { mockMessages } from '../../dummy'
import useChatWindowHook from './useChatWindowHook'

const ChatWindow: React.FC = () => {
  const { messagesEndRef } = useChatWindowHook()
  return (
    <div className='flex h-full w-full flex-col space-y-4 p-4'>
      {mockMessages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
          <MessageBubble message={msg} />
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default ChatWindow