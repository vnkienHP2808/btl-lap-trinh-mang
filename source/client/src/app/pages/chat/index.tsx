import BaseLayout from '@/app/layout/base-layout'
import ChatInput from '@/app/pages/chat/components/chat-input'
import ChatWindow from '@/app/pages/chat/components/chat-window'
import ListUser from './components/list-user'
import { Outlet, useLocation } from 'react-router-dom'

const ChatPage = () => {
  const location = useLocation()
  const hasSelectedChat = location.pathname !== '/chat'

  return (
    <BaseLayout>
      <div className='flex h-full w-full'>
        <div className='w-[250px] flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50'>
          <ListUser />
        </div>
        <div className='flex flex-grow flex-col'>
          {hasSelectedChat ? (
            <>
              <div className='flex-grow overflow-y-auto bg-white p-4'>
                <Outlet />
              </div>
            </>
          ) : (
            <div className='flex h-full items-center justify-center text-gray-400'>Chọn người dùng để bắt đầu chat</div>
          )}
        </div>
      </div>
    </BaseLayout>
  )
}

export default ChatPage
