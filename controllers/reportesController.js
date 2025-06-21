const { sql, poolPromise } = require('../db/db');
const ExcelJS = require('exceljs');

const obtenerReporte = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { fechaInicio, fechaFin, dni, idEquipo, operario } = req.query;

    let query = 'SELECT * FROM vw_ReporteActividades WHERE 1=1';
    const inputs = [];

    if (fechaInicio) {
      query += ' AND CAST(fechaHora AS DATE) >= @fechaInicio';
      inputs.push({ name: 'fechaInicio', type: sql.Date, value: fechaInicio });
    }

    if (fechaFin) {
      query += ' AND CAST(fechaHora AS DATE) <= @fechaFin';
      inputs.push({ name: 'fechaFin', type: sql.Date, value: fechaFin });
    }

    if (dni) {
      query += ' AND DNI LIKE @dni';
      inputs.push({ name: 'dni', type: sql.VarChar, value: `${dni}%` });
    }

    if (idEquipo) {
      query += ' AND idEquipo LIKE @idEquipo';
      inputs.push({ name: 'idEquipo', type: sql.VarChar, value: `${idEquipo}%` });
    }

    if (operario) {
      query += ' AND Operario LIKE @operario';
      inputs.push({ name: 'operario', type: sql.VarChar, value: `%${operario}%` });
    }

    const request = pool.request();
    inputs.forEach(param => request.input(param.name, param.type, param.value));

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener el reporte:', err);
    res.status(500).json({ message: 'Error al obtener el reporte' });
  }
};

const exportarExcel = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { fechaInicio, fechaFin, dni, idEquipo, operario } = req.query;

    let query = 'SELECT * FROM vw_ReporteActividades WHERE 1=1';
    const inputs = [];

    if (fechaInicio) {
      query += ' AND CAST(fechaHora AS DATE) >= @fechaInicio';
      inputs.push({ name: 'fechaInicio', type: sql.Date, value: fechaInicio });
    }

    if (fechaFin) {
      query += ' AND CAST(fechaHora AS DATE) <= @fechaFin';
      inputs.push({ name: 'fechaFin', type: sql.Date, value: fechaFin });
    }

    if (dni) {
      query += ' AND DNI LIKE @dni';
      inputs.push({ name: 'dni', type: sql.VarChar, value: `${dni}%` });
    }

    if (idEquipo) {
      query += ' AND idEquipo LIKE @idEquipo';
      inputs.push({ name: 'idEquipo', type: sql.VarChar, value: `${idEquipo}%` });
    }

    if (operario) {
      query += ' AND Operario LIKE @operario';
      inputs.push({ name: 'operario', type: sql.VarChar, value: `%${operario}%` });
    }

    const request = pool.request();
    inputs.forEach(param => request.input(param.name, param.type, param.value));
    const result = await request.query(query);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    if (result.recordset.length > 0) {
      worksheet.columns = Object.keys(result.recordset[0]).map(key => ({
        header: key,
        key: key,
        width: 20
      }));

      result.recordset.forEach(row => worksheet.addRow(row));
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=ReporteActividades.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error al exportar Excel:', err);
    res.status(500).json({ message: 'Error al exportar el reporte' });
  }
};

module.exports = { obtenerReporte, exportarExcel };
