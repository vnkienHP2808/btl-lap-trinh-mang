import { notification } from 'antd'

const useNotificationHook = () => {
  const showSuccess = (message: string) => {
    notification.success({
      message: message,
      placement: 'top',
      duration: 2
    })
  }

  const showError = (message: string) => {
    notification.error({
      message: message,
      placement: 'top',
      duration: 2
    })
  }
  return { showSuccess, showError }
}
export default useNotificationHook
