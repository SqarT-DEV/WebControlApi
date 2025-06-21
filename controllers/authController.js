const { sql, poolPromise } = require('../db/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  const { DNI, Clave } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('dni', sql.Char(8), DNI)
      .query('SELECT * FROM Persona WHERE DNI = @dni');

    if (result.recordset.length === 0) {
      console.log(`[${new Date().toISOString()}] Intento de login fallido: Usuario no encontrado (DNI: ${DNI})`);
      return res.status(404).json({ message: 'Usuario no encontrado. Verifica tu DNI.' });
    }

    const user = result.recordset[0];

    const passwordMatch = await bcrypt.compare(Clave, user.Clave);
    if (!passwordMatch) {
      console.log(`[${new Date().toISOString()}] Login fallido: Clave incorrecta para DNI ${DNI}`);
      return res.status(401).json({ message: 'Clave incorrecta. Intenta de nuevo.' });
    }

    // ⚠️ Convertir foto de perfil (buffer) a base64
    let fotoPerfilBase64 = null;
    if (user.FotoPerfil) {
      const buffer = Buffer.from(user.FotoPerfil, 'binary');
      fotoPerfilBase64 = `data:image/png;base64,${buffer.toString('base64')}`;
    }

    const token = jwt.sign(
      { id: user.idPersona, nombres: user.Nombres, rol: user.idCargo },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log(`[${new Date().toISOString()}] Login exitoso: DNI ${DNI}`);

    res.json({
      ok: true,
      token,
      id: user.idPersona,
      nombres: user.Nombres,
      apellidos: user.Apellidos,
      rol: user.idCargo,
      fotoPerfil: fotoPerfilBase64
    });

  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error en login:`, err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = { login };
