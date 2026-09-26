const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const uploadDir = path.join(
  process.cwd(),
  'uploads',
  'avatars'
)

fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase()
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${extension}`

    cb(null, uniqueName)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ]

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('INVALID_IMAGE_TYPE'))
  }

  cb(null, true)
}

const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})

module.exports = uploadAvatar