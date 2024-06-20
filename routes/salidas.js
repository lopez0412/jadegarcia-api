const express = require('express');
const router = express.Router();
const SalidasStock = require('../model/salidas');
const Productos = require('../model/productos'); 

// Obtener todas las salidas de stock
router.get('/salidas', async (req, res) => {
    try {
        const salidas = await SalidasStock.find();
        res.status(200).json(salidas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las salidas de stock', error });
    }
});

// Registrar una nueva salida de stock
router.post('/salida', async (req, res) => {
    const { productoId, cantidad, motivo } = req.body;

    try {
        // Verificar si hay suficiente cantidad disponible del producto
        const producto = await Productos.findById(productoId);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        if (producto.cantidadDisponible < cantidad) {
            return res.status(400).json({ message: 'Cantidad insuficiente disponible' });
        }

        // Registrar la salida de stock
        const nuevaSalida = new SalidasStock({
            productoId,
            cantidad,
            motivo,
        });
        await nuevaSalida.save();

        // Actualizar la cantidad disponible del producto
        producto.cantidadDisponible -= cantidad;
        await producto.save();

        res.status(201).json(nuevaSalida);
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar la salida de stock', error });
    }
});

module.exports = router;
