require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const personasRoutes = require('./routes/personasRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const horometroRoutes = require('./routes/horometroRoutes');
const tipoEquipoRoutes = require('./routes/tipoEquipoRoutes');
const equipoAsignadoRoutes = require('./routes/equipoAsignadoRoutes');
const detalleActividadesRoutes = require('./routes/detalleActividadesRoutes');
const reportesRoutes = require('./routes/reportesRoutes');
const fasesRoutes = require('./routes/fasesRoutes');
const paralizacionesRoutes = require('./routes/paralizacionesRoutes');
const standbyRoutes = require('./routes/standbyRoutes');

const app = express();
app.use(cors());

// 👇 Aumentamos el límite del tamaño de carga a 10 MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/personas', personasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/horometros', horometroRoutes);
app.use('/api/tipo-equipos', tipoEquipoRoutes);
app.use('/api/equipo-asignado', equipoAsignadoRoutes);
app.use('/api/detalle-actividades', detalleActividadesRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/equipos', require('./routes/equiposRoutes'));
app.use('/api/fases', fasesRoutes);
app.use('/api/paralizaciones', paralizacionesRoutes);
app.use('/api/standby', standbyRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
