function getExtFromMime(mime?: string): string {
  if (!mime) return '.mp4'
  const m = mime.toLowerCase()
  if (m.includes('webm')) return '.webm'
  if (m.includes('ogg')) return '.ogg'
  if (m.includes('quicktime') || m.includes('mov')) return '.mov'
  if (m.includes('x-matroska') || m.includes('mkv')) return '.mkv'
  if (m.includes('mp4')) return '.mp4'
  return '.mp4'
}

export default getExtFromMime
