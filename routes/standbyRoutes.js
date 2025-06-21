const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getStandby,
  crearStandby,
  actualizarStandby,
  eliminarStandby
} = require('../controllers/standbyController');

// Todas las rutas protegidas con middleware
router.use(authMiddleware);

router.get('/', getStandby);
router.post('/', crearStandby);
router.put('/:idStandby', actualizarStandby);
router.delete('/:idStandby', eliminarStandby);

module.exports = router;
