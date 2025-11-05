import { useNavigate } from 'react-router-dom'

const useHeaderHook = () => {
  const isLoggedIn = false
  const navigate = useNavigate()
  const goToRegister = () => navigate('/register')
  const goToLogin = () => navigate('/login')
  const handleLogout = () => console.log('Handling logout...')
  return { isLoggedIn, goToRegister, goToLogin, handleLogout, navigate }
}
export default useHeaderHook