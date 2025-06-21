const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const {
  getParalizaciones,
  crearParalizacion,
  actualizarParalizacion,
  eliminarParalizacion
} = require('../controllers/paralizacionesController');

router.get('/', auth, getParalizaciones);
router.post('/', auth, crearParalizacion);
router.put('/:idParalizacion', auth, actualizarParalizacion);
router.delete('/:idParalizacion', auth, eliminarParalizacion);

module.exports = router;
