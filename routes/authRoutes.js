const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const { login } = require('../controllers/authController');

router.post('/login', [
  check('DNI', 'El DNI es obligatorio').not().isEmpty(),
  check('Clave', 'La clave es obligatoria y debe tener mínimo 6 caracteres').isLength({ min: 6 }),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.array(),
    });
  }
  login(req, res, next);
});

module.exports = router;
