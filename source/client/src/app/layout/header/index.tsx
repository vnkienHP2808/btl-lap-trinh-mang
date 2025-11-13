import React from 'react'
import { Layout, Button } from 'antd'
import { LogoutOutlined, UserAddOutlined, LoginOutlined } from '@ant-design/icons'
import useHeaderHook from './useHeaderHook'
interface HeaderProps {
  title: string
}
const { Header: AntdHeader } = Layout

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { goToLogin, goToRegister, handleLogout, isLoggedIn, navigate } = useHeaderHook()

  return (
    <AntdHeader className='sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6'>
      <div
        className='cursor-pointer text-xl font-semibold text-white transition duration-150 hover:text-blue-600'
        onClick={() => navigate('/')}
      >
        {title}
      </div>
      <div className='space-x-2'>
        {isLoggedIn ? (
          <Button
            type='text'
            icon={<LogoutOutlined />}
            className='text-red-500 hover:bg-red-50'
            onClick={handleLogout}
            danger
          >
            Đăng xuất
          </Button>
        ) : (
          <>
            <Button
              type='default'
              icon={<UserAddOutlined />}
              onClick={goToRegister}
              className='border-blue-500 text-blue-500 transition duration-150 hover:border-blue-700 hover:text-blue-700'
            >
              Đăng ký
            </Button>
            <Button
              type='primary'
              icon={<LoginOutlined />}
              onClick={goToLogin}
              className='bg-blue-600 transition duration-150 hover:bg-blue-700'
            >
              Đăng nhập
            </Button>
          </>
        )}
      </div>
    </AntdHeader>
  )
}

export default Header