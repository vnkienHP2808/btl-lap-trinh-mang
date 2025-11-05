import clientService from '@/services/client.service'
import { HttpStatus } from '@/shared/constants/httpStatus'
import useNotificationHook from '@/shared/hook/useNotificationHook'
import storageService from '@/shared/services/storage.service'
import { Form } from 'antd'
import { useNavigate } from 'react-router-dom'

interface RegisterForm {
  username: string
  password: string
  confirm_password: string
}

const useRegisterHook = () => {
  const [form] = Form.useForm<RegisterForm>()
  const navigate = useNavigate()
  const { showError, showSuccess } = useNotificationHook()

  const handleRegister = async () => {
    const values = form.getFieldsValue()
    const { password, confirm_password } = values
    if (password != confirm_password) {
      showError('Mật khẩu không trùng khớp')
      return
    }
    try {
      const response = await clientService.register(values)
      if (response.status === HttpStatus.CREATED) {
        // đăng ký thành công
        /**
         * 1. Hiển thị thông báo: đăng ký thành công
         * 2. Navigate
         */
        showSuccess(response.data.message + '.Hệ thống chuyển hướng về trang đăng nhập')
        navigate('/login')
      } else {
        storageService.clear()
        console.log(response)
        showError(response.data.message)
      }
    } catch (e) {
      showError(`Lỗi server: ${e}`)
    }
  }
  return { handleRegister, form }
}
export default useRegisterHook