const { sql, poolPromise } = require('../db/db');
const bcrypt = require('bcryptjs');

const getPersonas = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT p.*, c.descripcionCargo
      FROM Persona p
      INNER JOIN Cargo c ON p.idCargo = c.idCargo
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener personas' });
  }
};

const getCargos = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Cargo');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener cargos' });
  }
};

const crearPersona = async (req, res) => {
  const { Nombres, Apellidos, DNI, Celular, Clave, Estado, idCargo } = req.body;
  try {
    const pool = await poolPromise;

    const existDNI = await pool.request()
      .input('DNI', sql.Char(8), DNI)
      .query('SELECT 1 FROM Persona WHERE DNI = @DNI');
    if (existDNI.recordset.length > 0) {
      return res.status(400).json({ message: 'El DNI ya está registrado.' });
    }

    const existCelular = await pool.request()
      .input('Celular', sql.Char(9), Celular)
      .query('SELECT 1 FROM Persona WHERE Celular = @Celular');
    if (existCelular.recordset.length > 0) {
      return res.status(400).json({ message: 'El celular ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(Clave, 10);

    await pool.request()
      .input('Nombres', sql.VarChar(50), Nombres)
      .input('Apellidos', sql.VarChar(50), Apellidos)
      .input('DNI', sql.Char(8), DNI)
      .input('Celular', sql.Char(9), Celular)
      .input('Clave', sql.VarChar(255), hashedPassword)
      .input('Estado', sql.VarChar(20), Estado)
      .input('idCargo', sql.Int, idCargo)
      .query(`
        INSERT INTO Persona (Nombres, Apellidos, DNI, Celular, Clave, Estado, idCargo)
        VALUES (@Nombres, @Apellidos, @DNI, @Celular, @Clave, @Estado, @idCargo)
      `);

    res.status(201).json({ message: 'Persona registrada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar persona' });
  }
};

const actualizarPersona = async (req, res) => {
  const { id } = req.params;
  const { Nombres, Apellidos, DNI, Celular, Clave, Estado, idCargo } = req.body;
  try {
    const pool = await poolPromise;
    const existing = await pool.request()
      .input('idPersona', sql.Int, id)
      .query('SELECT * FROM Persona WHERE idPersona = @idPersona');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }

    const hashedPassword = Clave ? await bcrypt.hash(Clave, 10) : null;

    const request = pool.request()
      .input('id', sql.Int, id)
      .input('Nombres', sql.VarChar(50), Nombres)
      .input('Apellidos', sql.VarChar(50), Apellidos)
      .input('DNI', sql.Char(8), DNI)
      .input('Celular', sql.Char(9), Celular)
      .input('Estado', sql.VarChar(20), Estado)
      .input('idCargo', sql.Int, idCargo);

    if (hashedPassword) {
      request.input('Clave', sql.VarChar(255), hashedPassword);
    }

    await request.query(`
      UPDATE Persona
      SET Nombres = @Nombres,
          Apellidos = @Apellidos,
          DNI = @DNI,
          Celular = @Celular,
          ${hashedPassword ? 'Clave = @Clave,' : ''}
          Estado = @Estado,
          idCargo = @idCargo
      WHERE idPersona = @id
    `);

    res.json({ message: 'Persona actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar persona' });
  }
};

const eliminarPersona = async (req, res) => {
  const { id } = req.params;
  const { idCargo } = req.user;

  if (idCargo !== 1) {
    return res.status(403).json({ message: 'Solo el administrador puede eliminar personas' });
  }

  try {
    const pool = await poolPromise;
    await pool.request().input('id', sql.Int, id).query('DELETE FROM Persona WHERE idPersona = @id');
    res.json({ message: 'Persona eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar persona' });
  }
};

const cambiarClave = async (req, res) => {
  const { DNI, claveActual, claveNueva } = req.body;

  if (!DNI || !claveActual || !claveNueva) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('dni', sql.Char(8), DNI)
      .query('SELECT * FROM Persona WHERE DNI = @dni');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuario = result.recordset[0];
    const claveValida = await bcrypt.compare(claveActual, usuario.Clave);

    if (!claveValida) {
      return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
    }

    const nuevaClaveHasheada = await bcrypt.hash(claveNueva, 10);
    await pool.request()
      .input('clave', sql.VarChar(255), nuevaClaveHasheada)
      .input('dni', sql.Char(8), DNI)
      .query('UPDATE Persona SET Clave = @clave WHERE DNI = @dni');

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    console.error('Error al cambiar clave:', err);
    res.status(500).json({ message: 'Error al cambiar clave' });
  }
};

const subirFotoPerfil = async (req, res) => {
  const { idPersona, imagenBase64 } = req.body;

  if (!idPersona || !imagenBase64) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  try {
    const buffer = Buffer.from(imagenBase64.split(',')[1], 'base64');

    const pool = await poolPromise;
    await pool.request()
      .input('foto', sql.VarBinary(sql.MAX), buffer)
      .input('idPersona', sql.Int, idPersona)
      .query('UPDATE Persona SET FotoPerfil = @foto WHERE idPersona = @idPersona');

    res.json({ message: 'Foto actualizada correctamente' });
  } catch (err) {
    console.error('Error al guardar foto:', err);
    res.status(500).json({ message: 'Error al guardar la foto de perfil' });
  }
};

module.exports = {
  getPersonas,
  crearPersona,
  actualizarPersona,
  eliminarPersona,
  getCargos,
  cambiarClave,
  subirFotoPerfil
};