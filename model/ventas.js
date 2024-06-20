const mongoose = require('mongoose');
const Productos = require('./productos'); // Ajusta según tu estructura

const ventasSchema = new mongoose.Schema({
    productos: [
        {
            productoId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Productos',
                required: true,
            },
            cantidad: {
                type: Number,
                required: true,
            },
            precio: {
                type: Number,
                required: true,
            },
        },
    ],
    totalVenta: {
        type: Number,
        required: true,
    },
    fechaVenta: {
        type: Date,
        default: Date.now,
    },
    metodoPago: {
        type: String,
        enum: ['Efectivo', 'Tarjeta', 'Transferencia'],
        required: true,
    },
    comprador: {
        type: String, // Puedes cambiar a ObjectId para referenciar a un modelo de clientes
        required: false,
    },
    vendedor: {
        type: String, // Nombre de la persona que realiza la venta
        required: false,
    },
});

const Ventas = mongoose.model('Ventas', ventasSchema);

module.exports = Ventas;
