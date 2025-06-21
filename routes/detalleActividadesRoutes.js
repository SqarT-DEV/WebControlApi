const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth');
const { getDetalleActividades } = require('../controllers/detalleActividadesController');

router.get('/detalle-actividades', authenticateToken, getDetalleActividades);

module.exports = router;