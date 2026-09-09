const VerificationService = require('../services/verification.service');

const submitVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { document_type, front_image_url, back_image_url } = req.body;

    if (!document_type || !front_image_url) {
      return res.status(400).json({ error: 'Укажите тип документа и загрузите лицевую сторону' });
    }

    const updatedUser = await VerificationService.submitVerification({
      userId,
      documentType: document_type,
      frontImageUrl: front_image_url,
      backImageUrl: back_image_url
    });

    res.status(200).json({
      message: 'Верификация успешно пройдена',
      user: updatedUser
    });
  } catch (error) {
    console.error('Ошибка при прохождении верификации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await VerificationService.getVerificationStatus(userId);

    res.status(200).json(status);
  } catch (error) {
    console.error('Ошибка при получении статуса верификации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = {
  submitVerification,
  getVerificationStatus
};