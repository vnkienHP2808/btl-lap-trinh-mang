const readChunkAsBase64 = (chunk: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1] // Bỏ phần "data:...;base64,"
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(chunk)
  })
}

export { readChunkAsBase64 }