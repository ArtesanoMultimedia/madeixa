var express = require('express');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');
var Categoria = require('../models/categoria');

// ==========================================
// Obtener todas las categorías
// ==========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var limite = req.query.limite || 5;
    limite = Number(limite);

    if (req.body)
        body = req.body;

    if (body.padre) {
        cond = { padre: body.padre };
    } else {
        cond = {};
    }
    Categoria.find(cond)
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('padre', 'nombre')
        .exec(
            (err, categorias) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando categorías',
                        errors: err
                    });
                }


                Categoria.count(cond, (err, total) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error contando categorías',
                            errors: err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        categorias: categorias,
                        total: total
                    });
                });

            });

});



// ==========================================
// Actualizar categoria
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Categoria.findById(id, (err, categoria) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar la categoría',
                errors: err
            });
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La categoría con el id ' + id + ' no existe',
                errors: { message: 'No existe una categoría con ese ID' }
            });
        }


        categoria.nombre = body.nombre;
        categoria.desc = body.desc;
        categoria.img = body.img;
        categoria.padre = body.padre;
        categoria.usuario = req.usuario._id;

        categoria.save((err, categoriaGuardada) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar categoria',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                categoria: categoriaGuardada
            });

        });

    });

});



// ==========================================
// Crear una nueva categoria
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var categoria = new Categoria({
        nombre: body.nombre,
        desc: body.desc,
        img: body.img,
        padre: body.padre,
        usuario: body.usuario
    });

    categoria.save((err, categoriaGuardada) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear categoria',
                errors: err
            });
        }

        // 201 - Recurso creado
        res.status(201).json({
            ok: true,
            categoria: categoriaGuardada,
            categoriatoken: req.categoria
        });


    });

});


// ============================================
//   Borrar un categoria por el id
// ============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrar categoria',
                errors: err
            });
        }

        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe una categoria con ese id',
                errors: { message: 'No existe una categoria con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            categoria: categoriaBorrada
        });

    });

});


module.exports = app;