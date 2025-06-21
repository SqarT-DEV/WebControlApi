const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth');
const {
  getTipoEquipos,
  crearTipoEquipo,
  eliminarTipoEquipo
} = require('../controllers/tipoEquipoController');

router.get('/', authenticateToken, getTipoEquipos);
router.post('/', authenticateToken, crearTipoEquipo);
router.delete('/:id', authenticateToken, eliminarTipoEquipo);

module.exports = router;
