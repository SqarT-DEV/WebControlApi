const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth');
const {
  getEquipoAsignado,
  asignarEquipo,
  liberarEquipo
} = require('../controllers/equipoAsignadoController');

router.get('/:idPersona', authenticateToken, getEquipoAsignado);
router.post('/', authenticateToken, asignarEquipo);
router.delete('/:idPersona', authenticateToken, liberarEquipo);

module.exports = router;
