import clientService from '@/services/client.service'
import { useNavigate } from 'react-router-dom'

const useHeaderHook = () => {
  const isLoggedIn = false
  const navigate = useNavigate()
  const goToRegister = () => navigate('/register')
  const goToLogin = () => navigate('/login')
  const handleLogout = () => console.log('Handling logout...')
  const test = async () => {
    const response = await clientService.test()
    console.log(response)
  }
  return { isLoggedIn, goToRegister, goToLogin, handleLogout, navigate, test }
}
export default useHeaderHook