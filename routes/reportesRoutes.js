const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth');
const { obtenerReporte, exportarExcel } = require('../controllers/reportesController');

router.get('/reporte', authenticateToken, obtenerReporte);
router.get('/reporte/excel', authenticateToken, exportarExcel);

module.exports = router;

