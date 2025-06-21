const { sql, poolPromise } = require('../db/db');

const getEquipos = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT e.*, t.descripcionEquipo AS tipoDescripcion
      FROM Equipo e
      JOIN TipoEquipo t ON e.idTipoEquipo = t.idTipoEquipo
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener equipos' });
  }
};

const getTiposEquipo = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM TipoEquipo');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener tipos de equipo' });
  }
};

const crearEquipo = async (req, res) => {
  const { idEquipo, estado, idTipoEquipo } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('idEquipo', sql.VarChar(50), idEquipo)
      .input('estado', sql.VarChar(50), estado)
      .input('idTipoEquipo', sql.Int, idTipoEquipo)
      .query('INSERT INTO Equipo (idEquipo, estado, idTipoEquipo) VALUES (@idEquipo, @estado, @idTipoEquipo)');
    res.status(201).json({ message: 'Equipo registrado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar equipo' });
  }
};

const actualizarEquipo = async (req, res) => {
  const { id } = req.params;
  const { estado, idTipoEquipo } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('idEquipo', sql.VarChar(50), id)
      .input('estado', sql.VarChar(50), estado)
      .input('idTipoEquipo', sql.Int, idTipoEquipo)
      .query(`
        UPDATE Equipo 
        SET estado = @estado, idTipoEquipo = @idTipoEquipo
        WHERE idEquipo = @idEquipo
      `);
    res.json({ message: 'Equipo actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar equipo' });
  }
};

const eliminarEquipo = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('idEquipo', sql.VarChar(50), id)
      .query('DELETE FROM Equipo WHERE idEquipo = @idEquipo');
    res.json({ message: 'Equipo eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar equipo' });
  }
};

module.exports = {
  getEquipos,
  getTiposEquipo,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo
};
