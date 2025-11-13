import path from 'path'
import fs from 'fs'
import multer from 'multer'

const uploadDir = path.join(__dirname, '../../../uploads')

console.log('📁 __dirname:', __dirname)
console.log('📁 uploadDir:', uploadDir)
console.log('📁 uploadDir exists:', fs.existsSync(uploadDir))

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Tạo tên file unique: timestamp_originalname
    const uniqueName = `${Date.now()}_${file.originalname}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Có thể thêm filter loại file ở đây nếu cần
    cb(null, true)
  }
})

export { upload }