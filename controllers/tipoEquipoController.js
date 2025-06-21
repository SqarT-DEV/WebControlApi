const { sql, poolPromise } = require('../db/db');

const getTipoEquipos = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM TipoEquipo');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener tipos de equipo:', err);
    res.status(500).json({ message: 'Error interno al obtener tipos de equipo' });
  }
};

const crearTipoEquipo = async (req, res) => {
  const { descripcionEquipo } = req.body;
  if (!descripcionEquipo || descripcionEquipo.trim().length < 2) {
    return res.status(400).json({ message: 'Descripción inválida' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('descripcionEquipo', sql.VarChar(50), descripcionEquipo)
      .query('INSERT INTO TipoEquipo (descripcionEquipo) VALUES (@descripcionEquipo)');
    res.status(201).json({ message: 'Tipo de equipo registrado correctamente' });
  } catch (err) {
    console.error('Error al crear tipo de equipo:', err);
    res.status(500).json({ message: 'Error interno al registrar tipo de equipo' });
  }
};

const eliminarTipoEquipo = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM TipoEquipo WHERE idTipoEquipo = @id');
    res.json({ message: 'Tipo de equipo eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar tipo de equipo:', err);
    res.status(500).json({ message: 'Error interno al eliminar tipo de equipo' });
  }
};

module.exports = {
  getTipoEquipos,
  crearTipoEquipo,
  eliminarTipoEquipo
};
