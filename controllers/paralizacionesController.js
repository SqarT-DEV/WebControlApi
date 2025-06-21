const { sql, poolPromise } = require('../db/db');

// Obtener todas las paralizaciones
const getParalizaciones = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Paralizacion');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener paralizaciones:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Crear nueva paralización
const crearParalizacion = async (req, res) => {
  const { descripcion } = req.body;

  if (!descripcion || !descripcion.trim()) {
    return res.status(400).json({ message: 'La descripción es requerida' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('descripcion', sql.VarChar(100), descripcion)
      .query(`
        INSERT INTO Paralizacion (descripcion)
        VALUES (@descripcion)
      `);
    res.status(201).json({ message: 'Paralización registrada correctamente' });
  } catch (err) {
    console.error('Error al registrar paralización:', err);
    res.status(500).json({ message: 'Error al registrar paralización' });
  }
};

// Actualizar paralización
const actualizarParalizacion = async (req, res) => {
  const { idParalizacion } = req.params;
  const { descripcion } = req.body;

  if (!descripcion || !descripcion.trim()) {
    return res.status(400).json({ message: 'La descripción es requerida' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('idParalizacion', sql.Int, idParalizacion)
      .input('descripcion', sql.VarChar(100), descripcion)
      .query(`
        UPDATE Paralizacion
        SET descripcion = @descripcion
        WHERE idParalizacion = @idParalizacion
      `);
    res.json({ message: 'Paralización actualizada correctamente' });
  } catch (err) {
    console.error('Error al actualizar paralización:', err);
    res.status(500).json({ message: 'Error al actualizar paralización' });
  }
};

// Eliminar paralización
const eliminarParalizacion = async (req, res) => {
  const { idParalizacion } = req.params;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('idParalizacion', sql.Int, idParalizacion)
      .query('DELETE FROM Paralizacion WHERE idParalizacion = @idParalizacion');
    res.json({ message: 'Paralización eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar paralización:', err);
    res.status(500).json({ message: 'Error al eliminar paralización' });
  }
};

module.exports = {
  getParalizaciones,
  crearParalizacion,
  actualizarParalizacion,
  eliminarParalizacion
};
