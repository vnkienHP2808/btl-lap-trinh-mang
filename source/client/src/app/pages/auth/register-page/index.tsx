import BaseLayout from '@/app/layout/base-layout'
import React from 'react'
import AuthForm from '../components/auth-form'
import useRegisterHook from './useRegisterHook'

const RegisterPage: React.FC = () => {
  const { handleRegister } = useRegisterHook()
  return (
    <BaseLayout>
      <div className='h-full w-full'>
        <AuthForm title='Đăng Ký Tài Khoản' isRegister={true} onSubmit={handleRegister} />
      </div>
    </BaseLayout>
  )
}

export default RegisterPage