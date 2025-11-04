import type { RouteObject } from 'react-router-dom'
import LoginPage from './pages/auth/login-page'
import RegisterPage from './pages/auth/register-page'
import NotFoundPage from './pages/not-found'
import ChatPage from './pages/chat'

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
      }
    ]
  }
]

export { router }