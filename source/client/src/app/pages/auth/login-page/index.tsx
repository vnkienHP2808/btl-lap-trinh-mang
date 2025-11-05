import BaseLayout from '@/app/layout/base-layout'
import React from 'react'
import AuthForm from '../components/auth-form'
import useLoginHook from './useLoginHook'

const LoginPage: React.FC = () => {
  const { handleLogin } = useLoginHook()
  return (
    <BaseLayout>
      <div className='h-full w-full'>
        <AuthForm title='Đăng Nhập' isRegister={false} onSubmit={handleLogin} />
      </div>
    </BaseLayout>
  )
}

export default LoginPage