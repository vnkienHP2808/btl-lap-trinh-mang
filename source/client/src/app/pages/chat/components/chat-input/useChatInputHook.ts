import { useState } from 'react'

const useChatInputHook = () => {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending:', message)
      setMessage('')
    }
  }

  const handleFileAttach = () => {
    console.log('Attaching file...')
  }

  return { handleSend, handleFileAttach, message, setMessage }
}
export default useChatInputHook