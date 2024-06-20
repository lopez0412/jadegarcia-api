const mongoose = require('mongoose');

const gastosSchema = new mongoose.Schema({
    fecha: {
        type: Date,
        required: true,
    },
    descripcion: {
        type: String,
        required: true,
        trim: true,
    },
    monto: {
        type: Number,
        required: true,
        min: 0,
    },
    categoria: {
        type: String,
        required: true,
        trim: true,
    },
    metodoPago: {
        type: String,
        required: true,
        trim: true,
    },
    nota: {
        type: String,
        trim: true,
    },
    fechaCreacion: {
        type: Date,
        default: Date.now,
    },
});

const Gastos = mongoose.model('Gastos', gastosSchema);

module.exports = Gastos;
