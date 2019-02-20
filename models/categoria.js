var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var categoriaSchema = new Schema({

    nombre: { type: String, unique: true, required: [true, 'El nombre de la categoría es necesario.'] },
    desc: { type: String, required: [true, 'Es necesario poner una descripción de la categoría'] },
    img: { type: String, required: false },
    padre: { type: Schema.Types.ObjectId, ref: 'Categoria', default: null },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }

});

categoriaSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

module.exports = mongoose.model('Categoria', categoriaSchema);