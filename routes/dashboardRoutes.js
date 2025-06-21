const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth');


const { resumenDashboard, actividadesPorDia } = require('../controllers/dashboardController');

router.get('/resumen', authenticateToken, resumenDashboard);
router.get('/actividades-por-dia', authenticateToken, actividadesPorDia);


module.exports = router;

