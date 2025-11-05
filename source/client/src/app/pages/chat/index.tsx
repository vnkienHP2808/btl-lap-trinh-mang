import BaseLayout from '@/app/layout/base-layout'
import ChatInput from '@/app/pages/chat/components/chat-input'
import ChatWindow from '@/app/pages/chat/components/chat-window'
import React from 'react'
import ListUser from './components/list-user'

const ChatPage: React.FC = () => {
  return (
    <BaseLayout>
      <div className='flex h-full w-full'>
        <div className='w-[250px] flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50'>
          <ListUser />
        </div>
        <div className='flex flex-grow flex-col'>
          <div className='flex-grow overflow-y-auto bg-white p-4'>
            <ChatWindow />
          </div>
          <div className='flex-shrink-0 border-t border-gray-200'>
            <ChatInput />
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}

export default ChatPage