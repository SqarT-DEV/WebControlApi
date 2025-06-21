const { sql, poolPromise } = require('../db/db');

const registrarHorometro = async (req, res) => {
  const { idPersona, idEquipo, valor } = req.body;

  if (!idPersona || !idEquipo || typeof valor !== 'number') {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('idPersona', sql.Int, idPersona)
      .query(`
        SELECT TOP 1 a.idActividad
        FROM ActividadGeneral a
        JOIN ActividadHorometro h ON h.idActividad = a.idActividad
        WHERE a.idPersona = @idPersona
          AND a.tipoActividad = 'HorometroInicial'
          AND CAST(a.fechaHora AS DATE) = CAST(GETDATE() AS DATE)
        ORDER BY a.fechaHora ASC
      `);

    const tipoActividad = result.recordset.length === 0 ? 'HorometroInicial' : 'HorometroFinal';

    const insertActividad = await pool.request()
      .input('idPersona', sql.Int, idPersona)
      .input('idEquipo', sql.VarChar(50), idEquipo)
      .input('tipoActividad', sql.VarChar(50), tipoActividad)
      .query(`
        INSERT INTO ActividadGeneral (idPersona, idEquipo, tipoActividad)
        OUTPUT INSERTED.idActividad
        VALUES (@idPersona, @idEquipo, @tipoActividad)
      `);

    const idActividad = insertActividad.recordset[0].idActividad;

    await pool.request()
      .input('idActividad', sql.Int, idActividad)
      .input('valor', sql.Decimal(10, 2), valor)
      .query(`
        INSERT INTO ActividadHorometro (idActividad, valor)
        VALUES (@idActividad, @valor)
      `);

    res.status(201).json({
      message: `Horómetro ${tipoActividad === 'HorometroInicial' ? 'inicial' : 'final'} registrado.`,
      idActividad,
      tipoActividad
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar horómetro' });
  }
};

module.exports = { registrarHorometro };