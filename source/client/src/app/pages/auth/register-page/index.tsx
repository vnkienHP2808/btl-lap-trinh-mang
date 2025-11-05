import React from 'react'
import useRegisterHook from './useRegisterHook'
import { Button, Form, Input } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Item: FormItem } = Form

const RegisterPage: React.FC = () => {
  const { handleRegister, form } = useRegisterHook()
  const navigate = useNavigate()
  return (
    <div className='flex h-screen items-center justify-center bg-gray-50'>
      <div className='flex w-[400px] flex-col items-center justify-center rounded-2xl border border-gray-300 bg-white p-6 shadow-lg'>
        <Form form={form} layout='vertical' className='w-full'>
          <FormItem label='Tài khoản' name='username'>
            <Input className='!w-full' />
          </FormItem>

          <FormItem label='Mật khẩu' name='password'>
            <Input.Password className='!w-full' />
          </FormItem>

          <FormItem label='Nhập lại mật khẩu' name='confirm_password'>
            <Input.Password className='!w-full' />
          </FormItem>

          <Button type='primary' block onClick={handleRegister}>
            Đăng ký tài khoản
          </Button>

          <div className='mt-2 cursor-pointer text-center' onClick={() => navigate('/login')}>
            Đã có tài khoản? Click vào đây để đăng nhấp
          </div>
        </Form>
      </div>
    </div>
  )
}

export default RegisterPage