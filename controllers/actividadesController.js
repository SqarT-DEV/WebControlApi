const { sql, poolPromise } = require('../db/db');

// POST /api/actividades/manual
const registrarActividadManual = async (req, res) => {
  const {
    tipoActividad,     // Ej: 'Horometro', 'Fase', 'Paralizacion', 'Standby', 'Mantenimiento', 'Almuerzo', 'CharlaSeguridad', 'CalentamientoEquipo', 'AbastecimientoCombustible'
    fechaHora,         // Obligatorio, formato: "2025-06-25T09:15:00"
    idPersona,         // Obligatorio, int
    idEquipo,          // Obligatorio, string
    observaciones,     // Opcional (ej: "55 galones", "Horometro Inicial", etc.)
    datosEspecificos = {} // Objeto, para datos de las actividades con tabla específica
  } = req.body;

  // Validar campos obligatorios
  if (!tipoActividad || !fechaHora || !idPersona || !idEquipo) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  let transaction;
  try {
    const pool = await poolPromise;
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // 1. Insertar siempre en ActividadGeneral usando tabla temporal para el id
    const insertQuery = `
      DECLARE @ids TABLE (idActividad INT);
      INSERT INTO ActividadGeneral (idPersona, idEquipo, tipoActividad, fechaHora, observaciones)
      OUTPUT INSERTED.idActividad INTO @ids
      VALUES (@idPersona, @idEquipo, @tipoActividad, @fechaHora, @observaciones);
      SELECT idActividad FROM @ids;
    `;

    const result = await transaction.request()
      .input('idPersona', sql.Int, idPersona)
      .input('idEquipo', sql.VarChar(50), idEquipo)
      .input('tipoActividad', sql.VarChar(50), tipoActividad)
      .input('fechaHora', sql.DateTime, fechaHora)
      .input('observaciones', sql.VarChar(sql.MAX), observaciones || null)
      .query(insertQuery);

    const idActividad = result.recordset[0].idActividad;

    // 2. Insertar en tabla específica SOLO si corresponde
    switch (tipoActividad) {
      case 'Horometro':
        // Requiere datosEspecificos.valor
        if (typeof datosEspecificos.valor !== "number") {
          await transaction.rollback();
          return res.status(400).json({ message: 'Falta valor de horómetro' });
        }
        await transaction.request()
          .input('idActividad', sql.Int, idActividad)
          .input('valor', sql.Decimal(10, 2), datosEspecificos.valor)
          .query(`
            INSERT INTO ActividadHorometro (idActividad, valor)
            VALUES (@idActividad, @valor)
          `);
        break;

      case 'Fase':
        // Requiere datosEspecificos.idFase
        if (!datosEspecificos.idFase) {
          await transaction.rollback();
          return res.status(400).json({ message: 'Falta idFase' });
        }
        await transaction.request()
          .input('idActividad', sql.Int, idActividad)
          .input('idFase', sql.VarChar(50), datosEspecificos.idFase)
          .query(`
            INSERT INTO ActividadFase (idActividad, idFase)
            VALUES (@idActividad, @idFase)
          `);
        break;

      case 'Paralizacion':
        // Requiere datosEspecificos.idParalizacion
        if (!datosEspecificos.idParalizacion) {
          await transaction.rollback();
          return res.status(400).json({ message: 'Falta idParalizacion' });
        }
        await transaction.request()
          .input('idActividad', sql.Int, idActividad)
          .input('idParalizacion', sql.Int, datosEspecificos.idParalizacion)
          .query(`
            INSERT INTO ActividadParalizacion (idActividad, idParalizacion)
            VALUES (@idActividad, @idParalizacion)
          `);
        break;

      case 'Standby':
        // Requiere datosEspecificos.idStandby
        if (!datosEspecificos.idStandby) {
          await transaction.rollback();
          return res.status(400).json({ message: 'Falta idStandby' });
        }
        await transaction.request()
          .input('idActividad', sql.Int, idActividad)
          .input('idStandby', sql.Int, datosEspecificos.idStandby)
          .query(`
            INSERT INTO ActividadStandby (idActividad, idStandby)
            VALUES (@idActividad, @idStandby)
          `);
        break;

      case 'Mantenimiento':
        // Requiere datosEspecificos.tipo y datosEspecificos.descripcion
        if (!datosEspecificos.tipo || !datosEspecificos.descripcion) {
          await transaction.rollback();
          return res.status(400).json({ message: 'Faltan datos de mantenimiento' });
        }
        await transaction.request()
          .input('idActividad', sql.Int, idActividad)
          .input('tipo', sql.VarChar(20), datosEspecificos.tipo)
          .input('descripcion', sql.VarChar(sql.MAX), datosEspecificos.descripcion)
          .query(`
            INSERT INTO Mantenimiento (idActividad, tipo, descripcion)
            VALUES (@idActividad, @tipo, @descripcion)
          `);
        break;

      // Las actividades "simples" NO requieren tabla secundaria.
      case 'Almuerzo':
      case 'CharlaSeguridad':
      case 'CalentamientoEquipo':
      case 'AbastecimientoCombustible':
        // Solo registro en ActividadGeneral (dato extra va en observaciones)
        break;

      default:
        await transaction.rollback();
        return res.status(400).json({ message: 'Tipo de actividad no soportado' });
    }

    await transaction.commit();

    res.status(201).json({
      ok: true,
      message: 'Actividad agregada correctamente',
      idActividad
    });

  } catch (error) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) {}
    }
    console.error(error);
    res.status(500).json({
      ok: false,
      message: 'Error al registrar actividad',
      error: error.message
    });
  }
};

module.exports = { registrarActividadManual };
