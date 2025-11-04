const useRegisterHook = () => {
  const handleRegister = (values: unknown) => {
    console.log('Registration attempt:', values)
  }
  return { handleRegister }
}
export default useRegisterHook