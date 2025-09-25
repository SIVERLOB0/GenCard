// server.js

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de EJS con múltiples carpetas de vistas
app.set('view engine', 'ejs');
app.set('views', [
  path.join(__dirname, 'src'),                  // index.ejs
  path.join(__dirname, 'src/partials'),         // header/footer
  path.join(__dirname, 'src/creditos'),         // creditos/creditos.ejs
  path.join(__dirname, 'src/CardGen/views'),
  path.join(__dirname, 'src/tempmail/views'),
  path.join(__dirname, 'src/extraplorador/views')
]);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
const cardRoutes = require('./src/CardGen/routes/cards');
const tempMailRoutes = require('./src/tempmail/routes/tempmail');
const extraRoutes = require('./src/extraplorador/routes/extraplorador');

// Montar rutas
app.use('/cards', cardRoutes);   // ✅ corregido: antes era /generate
app.use('/tempmail', tempMailRoutes);
app.use('/extraplorador', extraRoutes);

// Créditos (ruta directa)
app.get('/creditos', (req, res) => {
  res.render('creditos/creditos', { title: 'Créditos', message: 'Servicio creado por Siver 🐺' });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.render('index');
});

// Manejo de favicon
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).send('Página no encontrada');
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error interno:', err);
  res.status(500).send('Error interno del servidor');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});