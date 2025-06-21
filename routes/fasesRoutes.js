const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  getFases,
  crearFase,
  actualizarFase,
  eliminarFase
} = require('../controllers/fasesController');

router.get('/', auth, getFases);
router.post('/', auth, crearFase);
router.put('/:id', auth, actualizarFase);
router.delete('/:id', auth, eliminarFase);

module.exports = router;
