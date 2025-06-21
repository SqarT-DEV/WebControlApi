const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth');
const { registrarHorometro } = require('../controllers/horometroController');

router.post('/horometro', authenticateToken, registrarHorometro);

module.exports = router;