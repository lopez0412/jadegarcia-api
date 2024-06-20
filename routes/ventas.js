const express = require('express');
const router = express.Router();
const Ventas = require('../model/ventas');
const Productos = require('../model/productos');// Ajusta la ruta según tu estructura

router.post('/venta', async (req, res) => {
    const { productos, metodoPago, comprador, vendedor } = req.body;

    try {
        // Reducir la cantidad disponible para cada producto vendido
        await reducirCantidadProducto(productos);

        // Calcular el total de la venta
        const totalVenta = productos.reduce(
            (total, item) => total + item.precio * item.cantidad,
            0
        );

        const nuevaVenta = new Ventas({
            productos,
            totalVenta,
            metodoPago,
            comprador,
            vendedor,
        });

        await nuevaVenta.save();

        res.status(201).json(nuevaVenta); // Devolver la venta recién creada
    } catch (error) {
        res.status(400).json({ message: `Error al registrar la venta: ${error.message}` });
    }
});

const reducirCantidadProducto = async (productosVendidos) => {
    for (const item of productosVendidos) {
        const producto = await Productos.findById(item.productoId);

        if (!producto) {
            throw new Error(`Producto con ID ${item.productoId} no encontrado`);
        }

        if (producto.cantidadDisponible < item.cantidad) {
            throw new Error(
                `Stock insuficiente para el producto: ${producto.nombre}. Disponible: ${producto.cantidadDisponible}, requerido: ${item.cantidad}`
            );
        }

        // Reducir la cantidad disponible
        producto.cantidadDisponible -= item.cantidad;

        await producto.save(); // Guardar el cambio en la base de datos
    }
};

module.exports = router;