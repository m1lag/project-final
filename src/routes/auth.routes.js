const express = require('express')
const router = express.Router()

const {
  register,
  login,
  getMe,
  updateProfile,
  uploadAvatar: uploadAvatarController,
} = require('../controllers/auth.controller')

const authMiddleware = require('../middleware/auth')
const uploadAvatar = require('../middleware/uploadAvatar')

router.post('/register', register)

router.post('/login', login)

router.get('/me', authMiddleware, getMe)

router.put('/me', authMiddleware, updateProfile)

router.post(
  '/me/avatar',
  authMiddleware,
  uploadAvatar.single('avatar'),
  uploadAvatarController
)

module.exports = router