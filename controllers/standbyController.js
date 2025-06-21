const { sql, poolPromise } = require('../db/db');

// Obtener todos los registros de standby
const getStandby = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Standby');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener standby:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Crear nuevo registro de standby
const crearStandby = async (req, res) => {
  const { descripcion } = req.body;

  if (!descripcion || !descripcion.trim()) {
    return res.status(400).json({ message: 'La descripción es requerida' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('descripcion', sql.VarChar(100), descripcion)
      .query('INSERT INTO Standby (descripcion) VALUES (@descripcion)');

    res.status(201).json({ message: 'Standby registrado correctamente' });
  } catch (err) {
    console.error('Error al registrar standby:', err);
    res.status(500).json({ message: 'Error al registrar standby' });
  }
};

// Actualizar standby existente
const actualizarStandby = async (req, res) => {
  const { idStandby } = req.params;
  const { descripcion } = req.body;

  if (!descripcion || !descripcion.trim()) {
    return res.status(400).json({ message: 'La descripción es requerida' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('idStandby', sql.Int, idStandby)
      .input('descripcion', sql.VarChar(100), descripcion)
      .query('UPDATE Standby SET descripcion = @descripcion WHERE idStandby = @idStandby');

    res.json({ message: 'Standby actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar standby:', err);
    res.status(500).json({ message: 'Error al actualizar standby' });
  }
};

// Eliminar registro de standby
const eliminarStandby = async (req, res) => {
  const { idStandby } = req.params;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('idStandby', sql.Int, idStandby)
      .query('DELETE FROM Standby WHERE idStandby = @idStandby');

    res.json({ message: 'Standby eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar standby:', err);
    res.status(500).json({ message: 'Error al eliminar standby' });
  }
};

module.exports = {
  getStandby,
  crearStandby,
  actualizarStandby,
  eliminarStandby
};
