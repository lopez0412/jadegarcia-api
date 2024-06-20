const express = require('express');
const Productos = require('../model/productos'); // Asegúrate de ajustar la ruta según tu estructura
const router = express.Router();

// Obtener todos los productos
router.get('/productos', async (req, res) => {
    try {
        const productos = await Productos.find();
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos', error });
    }
});

// Obtener un producto por ID
router.get('/productos/:id', async (req, res) => {
    try {
        const producto = await Productos.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.status(200).json(producto);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el producto', error });
    }
});

// Crear un nuevo producto
router.post('/productos', async (req, res) => {
    const { nombre, descripcion, precio, categoria, cantidadDisponible, imagenes } = req.body;

    const nuevoProducto = new Productos({
        nombre,
        descripcion,
        precio,
        categoria,
        cantidadDisponible,
        imagenes,
    });

    try {
        const productoGuardado = await nuevoProducto.save();
        res.status(201).json(productoGuardado);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el producto', error });
    }
});

// Actualizar un producto por ID
router.put('/productos/:id', async (req, res) => {
    try {
        const productoActualizado = await Productos.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!productoActualizado) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.status(200).json(productoActualizado);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el producto', error });
    }
});

// Eliminar un producto por ID
router.delete('/productos/:id', async (req, res) => {
    try {
        const productoEliminado = await Productos.findByIdAndDelete(req.params.id);
        if (!productoEliminado) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.status(200).json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el producto', error });
    }
});

module.exports = router;
