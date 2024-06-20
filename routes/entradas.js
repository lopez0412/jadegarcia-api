const express = require('express');
const Entradas = require('../model/entradas');
const Productos = require('../model/productos')
const router = express.Router();

router.get('/entradas', async (req, res) => {
    try {
        const entradas = await Entradas.find();
        res.status(200).json(entradas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las entradas', error });
    }
});

// Obtener una entrada por ID
router.get('/entradas/:id', async (req, res) => {
    try {
        const entrada = await Entradas.findById(req.params.id);
        if (!entrada) {
            return res.status(404).json({ message: 'Entrada no encontrada' });
        }
        res.status(200).json(entrada);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la entrada', error });
    }
});

router.post('/entrada', async (req, res) => {
    const { productoId, cantidad, costoPorUnidad, proveedor, nota } = req.body;

    try {
        const nuevaEntrada = await registrarEntrada(productoId, cantidad, costoPorUnidad, proveedor, nota);
        res.status(201).json(nuevaEntrada);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const registrarEntrada = async (productoId, cantidad, costoPorUnidad, proveedor, nota) => {
    try {
        const producto = await Productos.findById(productoId);
        if (!producto) {
            throw new Error('Producto no encontrado');
        }

        // Crear una nueva entrada
        const nuevaEntrada = new Entradas({
            productoId,
            cantidad,
            costoPorUnidad,
            costoTotal: cantidad * costoPorUnidad,
            proveedor,
            nota,
        });

        await nuevaEntrada.save();

        // Actualizar la cantidad disponible en el producto
        producto.cantidadDisponible += cantidad;
        await producto.save();

        return nuevaEntrada;
    } catch (error) {
        throw new Error(`Error al registrar la entrada: ${error.message}`);
    }
};

const calcularGastoTotal = async (fechaInicio, fechaFin) => {
    try {
        const entradas = await Entradas.find({
            fechaEntrada: {
                $gte: new Date(fechaInicio),
                $lt: new Date(fechaFin),
            },
        });

        const gastoTotal = entradas.reduce((suma, entrada) => suma + entrada.costoTotal, 0);

        return gastoTotal;
    } catch (error) {
        throw new Error(`Error al calcular el gasto total: ${error.message}`);
    }
};

// Ruta para calcular el gasto total en un período específico
router.get('/entradas/gastoTotal', async (req, res) => {
    const { fechaInicio, fechaFin } = req.query;

    try {
        const gastoTotal = await calcularGastoTotal(fechaInicio, fechaFin);
        res.status(200).json({ gastoTotal });
    } catch (error) {
        res.status(500).json({ message: 'Error al calcular el gasto total', error });
    }
});

// Eliminar una entrada por ID
router.delete('/entradas/:id', async (req, res) => {
    try {
        const entrada = await Entradas.findById(req.params.id);
        if (!entrada) {
            return res.status(404).json({ message: 'Entrada no encontrada' });
        }

        // Si quieres revertir el impacto en el inventario, podrías restar la cantidad del producto
        const producto = await Productos.findById(entrada.productoId);
        if (producto) {
            producto.cantidadDisponible -= entrada.cantidad; // Restar la cantidad del producto
            await producto.save();
        }

        await entrada.delete();

        res.status(200).json({ message: 'Entrada eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la entrada', error });
    }
});


module.exports = router;