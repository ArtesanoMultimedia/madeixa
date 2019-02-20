var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Producto = require('../models/producto');

// ==========================================
// Obtener todos los productos
// ==========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var limite = req.query.limite || 5;
    limite = Number(limite);

    if (req.body)
        body = req.body;

    body.categoria ? cond = "{ categoria: body.categoria }" : cond = "{}"

    Producto.find(cond)
        .skip(desde)
        .limit(limite)
        .exec(
            (err, productos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando productos',
                        errors: err
                    });
                }

                Producto.count(cond, (err, total) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error contando productos',
                            errors: err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        productos: productos,
                        total: total
                    });
                });


            });
});


// ==========================================
// Actualizar producto
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Producto.findById(id, (err, producto) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar producto',
                errors: err
            });
        }

        if (!producto) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El producto con el id ' + id + ' no existe',
                errors: { message: 'No existe un producto con ese ID' }
            });
        }


        producto.nombre = body.nombre;
        producto.desc = body.desc;
        producto.img = body.img;
        producto.precio = body.precio;
        producto.stock = body.stock;
        producto.borrado = body.borrado;
        producto.usuario = req.usuario._id;
        producto.categoria = body.categoria;


        producto.save((err, productoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar producto',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                producto: productoGuardado
            });

        });

    });

});



// ==========================================
// Crear un nuevo producto
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    console.log(req.body);
    var producto = new Producto({
        nombre: body.nombre,
        desc: body.desc,
        img: body.img,
        usuario: req.usuario._id,
        stock: body.stock,
        precio: body.precio,
        categoria: body.categoria
    });

    producto.save((err, productoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear producto',
                errors: err
            });
        }

        // 201 - Recurso creado
        res.status(201).json({
            ok: true,
            producto: productoGuardado,
            productotoken: req.producto
        });


    });

});


// ============================================
//   Borrar un producto por el id
// ============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Producto.findByIdAndRemove(id, (err, productoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrar producto',
                errors: err
            });
        }

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un producto con ese id',
                errors: { message: 'No existe un producto con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            producto: productoBorrado
        });

    });

});


module.exports = app;