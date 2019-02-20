var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var productoSchema = new Schema({

    nombre: { type: String, unique: true, required: [true, 'El nombre del producto es necesario.'] },
    desc: { type: String, required: [true, 'Es necesario poner una descripción del producto'] },
    categoria: { type: String },
    img: [String],
    precio: { type: Number },
    stock: { type: Number },
    borrado: { type: Boolean }

});

productoSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

module.exports = mongoose.model('Producto', productoSchema);