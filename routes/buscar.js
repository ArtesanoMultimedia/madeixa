var express = require('express');

var app = express();

var Categoria = require('../models/categoria');
var Producto = require('../models/producto');


// ==============================================
// Búsqueda por colección
// ==============================================

app.get('/coleccion/:tabla/:parametro', (req, res, next) => {

    var tabla = req.params.tabla;
    var parametro = req.params.parametro;
    var regex = new RegExp(parametro, 'i');

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var limite = req.query.limite || 5;
    limite = Number(limite);

    var promesa;
    switch (tabla) {
        case 'productos':
            promesa = buscarProductos(parametro, regex, desde, limite);
            break;
        case 'categorias':
            promesa = buscarCategorias(parametro, regex, desde, limite);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda son: productos y categorias',
                error: { message: 'Tipo de tabla/colección no válido.' }
            });
    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });

});




// ==============================================
// Búsqueda general
// ==============================================

app.get('/todo/:parametro', (req, res, next) => {

    var parametro = req.params.parametro;
    var regex = new RegExp(parametro, 'i');

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var limite = req.query.limite || 5;
    limite = Number(limite);

    Promise.all([
            buscarCategorias(parametro, regex, desde, limite),
            buscarProductos(parametro, regex, desde, limite)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                categorias: respuestas[0],
                productos: respuestas[1]
            });
        })

});


// ==============================================
// Funciones de búsqueda
// ==============================================

function buscarCategorias(parametro, regex, desde, limite) {

    return new Promise((resolve, reject) => {
        Categoria.find({ nombre: regex }, 'nombre desc')
            .skip(desde)
            .limit(limite)
            .exec((err, categorias) => {
                if (err) {
                    reject('Error al cargar categorías', err);
                } else {
                    resolve(categorias);
                }
            });
    });


}

function buscarProductos(parametro, regex, desde, limite) {

    return new Promise((resolve, reject) => {

        Producto.find({})
            // TODO: No funciona el populate, devuelve categoría null.
            //.populate('categoria', 'nombre')
            .skip(desde)
            .limit(limite)
            .or([{ 'nombre': regex }, { 'desc': regex }])
            .exec((err, productos) => {
                if (err) {
                    reject('Error al cargar productos', err);
                } else {
                    resolve(productos);
                }

            });

    });

}

module.exports = app;