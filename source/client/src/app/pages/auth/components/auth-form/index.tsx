import React from 'react'
import { Form, Input, Button, Card } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import type { FormProps } from 'antd/lib/form/Form'

interface AuthFormProps extends FormProps {
  title: string
  isRegister?: boolean
  onSubmit: (values: unknown) => void
}

const AuthForm: React.FC<AuthFormProps> = ({ title, isRegister = false, onSubmit, ...rest }) => {
  return (
    <div className='flex h-full w-full items-center justify-center bg-gray-50 p-4'>
      <Card
        title={<div className='text-center text-2xl font-bold text-blue-600'>{title}</div>}
        className='w-full max-w-sm rounded-xl border-t-4 border-blue-500 shadow-2xl'
      >
        <Form
          name={title.toLowerCase().replace(' ', '-')}
          initialValues={{ remember: true }}
          onFinish={onSubmit}
          layout='vertical'
          className='space-y-2'
          {...rest}
        >
          <Form.Item name='username' rules={[{ required: true, message: 'Vui lòng nhập Tên đăng nhập!' }]}>
            <Input
              prefix={<UserOutlined className='site-form-item-icon text-gray-400' />}
              placeholder='Tên đăng nhập'
              className='h-10'
            />
          </Form.Item>

          <Form.Item
            name='password'
            rules={[
              { required: true, message: 'Vui lòng nhập Mật khẩu!' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className='site-form-item-icon text-gray-400' />}
              placeholder='Mật khẩu'
              className='h-10'
            />
          </Form.Item>

          {isRegister && (
            <Form.Item
              name='confirmPassword'
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận Mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Hai mật khẩu không khớp!'))
                  }
                })
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className='site-form-item-icon text-gray-400' />}
                placeholder='Xác nhận Mật khẩu'
                className='h-10'
              />
            </Form.Item>
          )}

          <Form.Item className='pt-2'>
            <Button
              type='primary'
              htmlType='submit'
              className='h-10 w-full rounded-lg bg-blue-600 font-semibold hover:bg-blue-700'
            >
              {title}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default AuthForm