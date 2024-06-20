const mongoose = require('mongoose');
const Productos = require('./productos'); // Ajusta la ruta según tu estructura

const entradasSchema = new mongoose.Schema({
    productoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Productos',
        required: true,
    },
    cantidad: {
        type: Number,
        required: true,
    },
    costoPorUnidad: {
        type: Number, // Costo de cada unidad ingresada
        required: true,
    },
    costoTotal: {
        type: Number, // Costo total (cantidad * costoPorUnidad)
        required: true,
    },
    precioCompra:{
        type: Number, 
        required: true, 
    },
    fechaEntrada: {
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

const Entradas = mongoose.model('Entradas', entradasSchema);

module.exports = Entradas;
