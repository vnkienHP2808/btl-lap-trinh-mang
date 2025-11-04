const useLoginHook = () => {
  const handleLogin = (values: unknown) => {
    console.log('Login attempt:', values)
  }
  return { handleLogin }
}
export default useLoginHook