const mongoose = require('mongoose');

const productosSchema = new mongoose.Schema({
    images: [{
        type: String, // URLs o rutas a las imágenes
    }],
    nombre: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
        required: false,
    },
    precio: {
        type: Number,
        required: true,
    },
    categoria: {
        type: String,
        required: false,
    },
    cantidadDisponible: {
        type: Number, // para control de inventarios
        required: true,
    },
});

const Productos = mongoose.model('Productos', productosSchema);

module.exports = Productos;
