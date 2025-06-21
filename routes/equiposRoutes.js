const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth');

const {
  getEquipos,
  getTiposEquipo,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo
} = require('../controllers/equiposController');

router.get('/', authenticateToken, getEquipos);
router.get('/tipos', authenticateToken, getTiposEquipo);
router.post('/', authenticateToken, crearEquipo);
router.put('/:id', authenticateToken, actualizarEquipo);
router.delete('/:id', authenticateToken, eliminarEquipo);

module.exports = router;
