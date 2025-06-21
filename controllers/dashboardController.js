const { sql, poolPromise } = require('../db/db');

const resumenDashboard = async (req, res) => {
  try {
    const pool = await poolPromise;

    const ahora = new Date();
    const inicioSemana = new Date(ahora);
    const dia = inicioSemana.getDay();
    const distanciaLunes = dia === 0 ? -6 : 1 - dia;
    inicioSemana.setDate(inicioSemana.getDate() + distanciaLunes);
    inicioSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(finSemana.getDate() + 7);
    finSemana.setHours(0, 0, 0, 0);

    const [personas, actividades, hoy, semana, equipos, disponibles] = await Promise.all([
      pool.request().query('SELECT idCargo FROM Persona'),
      pool.request().query('SELECT COUNT(*) AS total FROM ActividadGeneral'),
      pool.request().query(`
        SELECT COUNT(*) AS hoy FROM ActividadGeneral 
        WHERE CONVERT(date, fechaHora) = CONVERT(date, GETDATE())
      `),
      pool.request()
        .input('inicio', sql.DateTime, inicioSemana)
        .input('fin', sql.DateTime, finSemana)
        .query(`
          SELECT COUNT(*) AS semana FROM ActividadGeneral 
          WHERE fechaHora >= @inicio AND fechaHora < @fin
        `),
      pool.request().query('SELECT estado FROM Equipo'),
      pool.request().query(`
        SELECT COUNT(*) AS disponibles 
        FROM Equipo 
        WHERE estado = 'Disponible'
      `)
    ]);

    const totalPersonas = personas.recordset.length;
    const totalOperarios = personas.recordset.filter(p => p.idCargo === 3).length;
    const totalAuxiliares = personas.recordset.filter(p => p.idCargo === 2).length;

    res.json({
      totalPersonas,
      totalOperarios,
      totalAuxiliares,
      actividadesHoy: hoy.recordset[0].hoy,
      actividadesSemana: semana.recordset[0].semana,
      totalReportes: actividades.recordset[0].total,
      totalEquipos: equipos.recordset.length,
      equiposDisponibles: disponibles.recordset[0].disponibles
    });
  } catch (err) {
    console.error('Error en resumenDashboard:', err);
    res.status(500).json({ message: 'Error al obtener datos del dashboard' });
  }
};

const actividadesPorDia = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        DATENAME(WEEKDAY, fechaHora) AS dia,
        COUNT(*) AS total
      FROM ActividadGeneral
      WHERE fechaHora >= DATEADD(DAY, -6, CAST(GETDATE() AS DATE))
      GROUP BY DATENAME(WEEKDAY, fechaHora), DATEPART(WEEKDAY, fechaHora)
      ORDER BY DATEPART(WEEKDAY, fechaHora)
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error en actividadesPorDia:', err);
    res.status(500).json({ message: 'Error al obtener actividades por día' });
  }
};

module.exports = {
  resumenDashboard,
  actividadesPorDia
};

