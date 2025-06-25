const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth'); // <-- igual que los otros
const { registrarActividadManual } = require('../controllers/actividadesController');

router.post('/manual', authenticateToken, registrarActividadManual);

module.exports = router;