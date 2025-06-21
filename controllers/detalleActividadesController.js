const { sql, poolPromise } = require('../db/db');

const getDetalleActividades = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM vw_ReporteActividades');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener actividades:', err);
    res.status(500).json({ message: 'Error al obtener reporte' });
  }
};

module.exports = { getDetalleActividades };