const isVideoFile = (file: File) => {
  const ext = file.name.split('.').pop()?.toLowerCase()
  const videoExts = ['mp4', 'mov', 'mkv', 'webm', 'avi']

  return file.type.startsWith('video/') || (ext ? videoExts.includes(ext) : false)
}

export default isVideoFile
