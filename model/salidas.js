const mongoose = require('mongoose');
const Productos = require('./productos'); // Ajusta la ruta según tu estructura

const salidasSchema = new mongoose.Schema({
    productoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Productos',
        required: true,
    },
    cantidad: {
        type: Number,
        required: true,
    },
    fechaSalida: {
        type: Date,
        default: Date.now,
    },
    proveedor: {
        type: String, // Nombre del proveedor o fuente del producto
        required: false,
    },
    nota: {
        type: String, // Notas o comentarios adicionales
        required: false,
    },
});

const Salidas = mongoose.model('Salidas', salidasSchema);

module.exports = Salidas;
