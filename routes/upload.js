var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Producto = require('../models/producto');
var Categoria = require('../models/categoria.js');



// default options
app.use(fileUpload());

// app.put('/', (req, res, next) => {
//   if (Object.keys(req.files).length == 0) {
//     return res.status(400).send('No files were uploaded.');
//   }

//   // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
//   let sampleFile = req.files.sampleFile;

//   // Use the mv() method to place the file somewhere on your server
//   sampleFile.mv('/somewhere/on/your/server/filename.jpg', function(err) {
//     if (err)
//       return res.status(500).send(err);

//     res.send('File uploaded!');
//   });
// });













app.put('/:tipo/:id', (req, res, next) => {

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al subir archivos.',
            errors: { message: 'Debe seleccionar una imagen.' }
        });
    }

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];
    var tipo = req.params.tipo;
    var id = req.params.id;

    // Extensiones de archivo válidas:
    var extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida.',
            error: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') + '.' }
        })
    }


    // Tipos de colección válidos:
    var tiposValidos = ['usuarios', 'productos', 'categorias'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida.',
            error: { message: 'Las colecciones válidas son: ' + tiposValidas.join(', ') + '.' }
        })
    }

    // Nombre de archivo personalizado
    // "id_producto-random.extension"
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;


    // Mover el archivo de temporal a un directorio concreto
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err // TODO: Eliminar en producción
            });
        }


        subirPorTipo(tipo, id, nombreArchivo, res);


        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo subido correctamente.',
        // });

    });

});


function subirPorTipo(tipo, id, nombreArchivo, res) {
    // Referencia a nuestros modelos
    var Modelos = {
        usuarios: Usuario,
        productos: Producto,
        categorias: Categoria
    }

    if (Modelos.hasOwnProperty(tipo)) {
        Modelos[tipo].findById(id, (err, modelo) => {
            if (err) {
                return res.status(406).json({
                    ok: false,
                    mensaje: 'Formato incorrecto ~ ID.',
                    errors: err // TODO: Eliminar en producción.
                });
            }

            if (!modelo) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'Colección no encontrada.',
                    errors: err // TODO: Eliminar en producción.
                });
            }

            var pathViejo = './uploads/${ tipo }/' + modelo.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al eliminar el archivo anterior.',
                            error: { message: 'Error al eliminar el archivo', err }
                        });
                    }
                });
            }

            // Todo ok, actualizamos la imagen en la base de datos
            modelo.img = nombreArchivo;

            modelo.save((err, modeloActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar la imagen en la base de datos.',
                        errors: err // TODO: Eliminar en producción
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen guardada.',
                    [tipo]: modeloActualizado
                });
            });

        });

    } // end if Modelos.hasOwnProperty(tipo)

} // end function subirPorTipo



module.exports = app;