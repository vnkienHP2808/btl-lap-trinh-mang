import type { RouteObject } from 'react-router-dom'
import LoginPage from './pages/auth/login-page'
import RegisterPage from './pages/auth/register-page'
import NotFoundPage from './pages/not-found'
import ChatPage from './pages/chat'
import ChatWindow from './pages/chat/components/chat-window'

const router: RouteObject[] = [
  {
    path: '/',
    children: [
      {
        index: true,
        element: <ChatPage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <RegisterPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      },
      {
        path: '/chat',
        element: <ChatPage />,
        children: [
          {
            path: ':conversationId',
            element: <ChatWindow />
          }
        ]
      }
    ]
  }
]

export { router }
