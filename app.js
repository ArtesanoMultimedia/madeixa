// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();


// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var categoriaRoutes = require('./routes/categoria');
var productoRoutes = require('./routes/producto');
var buscarRoutes = require('./routes/buscar');
var uploadRoutes = require('./routes/upload');
var loginRoutes = require('./routes/login');
var imagenesRoutes = require('./routes/imagenes');


// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/madeixaDB', (err, res) => {

    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');

});


// Rutas
app.use('/producto', productoRoutes);
app.use('/categoria', categoriaRoutes);
app.use('/buscar', buscarRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});