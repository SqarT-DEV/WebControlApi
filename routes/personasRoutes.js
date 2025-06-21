const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth');
const {
  getPersonas,
  crearPersona,
  actualizarPersona,
  eliminarPersona,
  getCargos,
  cambiarClave,
  subirFotoPerfil
} = require('../controllers/personasController');

router.get('/cargos', authenticateToken, getCargos);
router.get('/', authenticateToken, getPersonas);
router.post('/', authenticateToken, crearPersona);
router.put('/:id', authenticateToken, actualizarPersona);
router.delete('/:id', authenticateToken, eliminarPersona);
router.post('/cambiar-clave', authenticateToken, cambiarClave);
router.post('/foto', authenticateToken, subirFotoPerfil);

module.exports = router;
