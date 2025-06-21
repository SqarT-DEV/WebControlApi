const { sql, poolPromise } = require('../db/db');

const getEquipoAsignado = async (req, res) => {
  const { idPersona } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('idPersona', sql.Int, idPersona)
      .query(`
        SELECT ea.idEquipo, e.Estado, t.descripcionEquipo
        FROM EquipoAsignado ea
        JOIN Equipo e ON ea.idEquipo = e.idEquipo
        JOIN TipoEquipo t ON e.idTipoEquipo = t.idTipoEquipo
        WHERE ea.idPersona = @idPersona
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No se ha asignado un equipo a este operario' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener equipo asignado' });
  }
};

const asignarEquipo = async (req, res) => {
  const { idPersona, idEquipo } = req.body;

  if (!idPersona || !idEquipo) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    const pool = await poolPromise;

    const equipoCheck = await pool.request()
      .input('idEquipo', sql.VarChar(50), idEquipo)
      .query('SELECT Estado FROM Equipo WHERE idEquipo = @idEquipo');

    if (!equipoCheck.recordset.length || equipoCheck.recordset[0].Estado === 'Ocupado') {
      return res.status(400).json({ message: 'Este equipo ya está asignado a otro operario.' });
    }

    await pool.request()
      .input('idPersona', sql.Int, idPersona)
      .input('idEquipo', sql.VarChar(50), idEquipo)
      .query('INSERT INTO EquipoAsignado (idPersona, idEquipo) VALUES (@idPersona, @idEquipo)');

    await pool.request()
      .input('idEquipo', sql.VarChar(50), idEquipo)
      .query("UPDATE Equipo SET Estado = 'Ocupado' WHERE idEquipo = @idEquipo");

    res.status(201).json({ message: 'Equipo asignado correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al asignar equipo' });
  }
};

const liberarEquipo = async (req, res) => {
  const { idPersona } = req.body;

  if (!idPersona) {
    return res.status(400).json({ message: 'Falta idPersona' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('idPersona', sql.Int, idPersona)
      .query('SELECT idEquipo FROM EquipoAsignado WHERE idPersona = @idPersona');

    if (!result.recordset.length) {
      return res.status(400).json({ message: 'No se encontró equipo asignado a esta persona.' });
    }

    const idEquipo = result.recordset[0].idEquipo;

    await pool.request()
      .input('idPersona', sql.Int, idPersona)
      .query('DELETE FROM EquipoAsignado WHERE idPersona = @idPersona');

    await pool.request()
      .input('idEquipo', sql.VarChar(50), idEquipo)
      .query("UPDATE Equipo SET Estado = 'Libre' WHERE idEquipo = @idEquipo");

    res.json({ message: 'Equipo liberado correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al liberar equipo' });
  }
};


module.exports = {
  getEquipoAsignado,
  asignarEquipo,
  liberarEquipo
};
