const { sql, poolPromise } = require('../db/db');

const getFases = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Fase');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener fases:', err);
    res.status(500).json({ message: 'Error al obtener fases' });
  }
};

const crearFase = async (req, res) => {
  const { idFase, descripcionFase } = req.body;

  if (!idFase || !descripcionFase) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  try {
    const pool = await poolPromise;

    const existing = await pool.request()
      .input('idFase', sql.VarChar(50), idFase)
      .query('SELECT * FROM Fase WHERE idFase = @idFase');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: 'El ID de fase ya está registrado.' });
    }

    await pool.request()
      .input('idFase', sql.VarChar(50), idFase)
      .input('descripcionFase', sql.VarChar(100), descripcionFase)
      .query('INSERT INTO Fase (idFase, descripcionFase) VALUES (@idFase, @descripcionFase)');

    res.status(201).json({ message: 'Fase registrada correctamente' });
  } catch (err) {
    console.error('Error al crear fase:', err);
    res.status(500).json({ message: 'Error al crear fase' });
  }
};

const actualizarFase = async (req, res) => {
  const { id } = req.params;
  const { descripcionFase } = req.body;

  if (!descripcionFase) {
    return res.status(400).json({ message: 'Descripción requerida' });
  }

  try {
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.VarChar(50), id)
      .input('descripcionFase', sql.VarChar(100), descripcionFase)
      .query('UPDATE Fase SET descripcionFase = @descripcionFase WHERE idFase = @id');

    res.json({ message: 'Fase actualizada correctamente' });
  } catch (err) {
    console.error('Error al actualizar fase:', err);
    res.status(500).json({ message: 'Error al actualizar fase' });
  }
};

const eliminarFase = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.VarChar(50), id)
      .query('DELETE FROM Fase WHERE idFase = @id');

    res.json({ message: 'Fase eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar fase:', err);
    res.status(500).json({ message: 'Error al eliminar fase' });
  }
};

module.exports = {
  getFases,
  crearFase,
  actualizarFase,
  eliminarFase
};
