const AuthService = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }

    const result = await AuthService.registerUser(req.body);
    res.status(201).json({
      message: 'Регистрация прошла успешно',
      ...result
    });
  } catch (error) {
    if (error.message === 'USER_EXISTS') {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Файл зображення не вибрано',
      })
    }

    const avatarUrl =
      `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`

    const user = await AuthService.updateUserProfile(
      req.user.id,
      {
        avatar_url: avatarUrl,
      }
    )

    return res.json(user)
  } catch (error) {
    console.error('UPLOAD AVATAR ERROR:', error)

    return res.status(500).json({
      error: 'Не вдалося завантажити фотографію',
    })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Заполните email и пароль' });
    }

    const result = await AuthService.loginUser(email, password);
    res.json({
      message: 'Успешный вход',
      ...result
    });
  } catch (error) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }
    console.error('Ошибка при входе:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await AuthService.getUserProfile(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (error) {
    console.error('Ошибка при получении профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updatedUser = await AuthService.updateUserProfile(req.user.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = { 
  register, 
  login, 
  getMe,
  updateProfile,
  uploadAvatar,
};