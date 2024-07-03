const express = require('express');
const mongoose = require('mongoose')

const router = express.Router();
const Services = require('../model/services');
const Citas = require('../model/citas');

module.exports = router;

const jwt = require('jsonwebtoken');

// Middleware para validar el token
const validateToken = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Token inválido' });
    }
};

// Ruta para obtener todos los servicios
router.get('/services', async (req, res) => {
    try {
        const servicios = await Services.find();
        res.status(200).json(servicios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para buscar un servicio por nombre con una búsqueda tipo 'LIKE'
router.get('/services/search', async (req, res) => {
    try {
        // Obtener el término de búsqueda del nombre del servicio de los parámetros de la consulta
        const searchTerm = req.query.nombre;
        // Crear una expresión regular para realizar una búsqueda insensible a mayúsculas y minúsculas
        const regex = new RegExp(searchTerm, 'i');
        // Buscar servicios que contengan el término de búsqueda en su nombre
        const servicios = await Services.find({ nombre: { $regex: regex } });
        // Si no se encuentran servicios, enviar una respuesta 404
        if (!servicios.length) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }
        // Enviar los servicios encontrados
        res.status(200).json(servicios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para obtener un servicio específico por ID
router.get('/services/:id', async (req, res) => {
    try {
        const servicio = await Services.findById(req.params.id);
        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }
        res.status(200).json(servicio.toObject());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para obtener la disponibilidad de un servicio en una fecha específica
router.get('/disponibilidad/:servicioId/:fecha', async (req, res) => {
    const { servicioId, fecha } = req.params;

    try {
        // Buscar el servicio por su ID
        const servicio = await Services.findById(servicioId);

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        // Obtener las horas disponibles para el servicio en la fecha especificada
        const availableTimes = await servicio.getAvailableTimes(fecha);

        res.status(200).json(availableTimes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la disponibilidad del servicio', error });
    }
});

// Ruta para crear un nuevo servicio
router.post('/services', validateToken, async (req, res) => {
    const { images,nombre, descripcion, precio,duration,estaciones, indicaciones, categoria } = req.body; // Added 'categoria' field
    const nuevoServicio = new Services({
        images,
        nombre,
        descripcion,
        precio,
        duration,
        estaciones,
        indicaciones,
        categoria // Added 'categoria' field
    });

    try {
        const servicioGuardado = await nuevoServicio.save();
        res.status(201).json({tipo: 'success', mensaje: "Servicio Agregado Correctamente",data: servicioGuardado});
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Ruta para actualizar un servicio por ID
router.put('/services/:id', validateToken, async (req, res) => {
    try {
        const servicioActualizado = await Services.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!servicioActualizado) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }
        res.status(200).json({tipo: 'success', mensaje: "Servicio Editado Correctamente",data:servicioActualizado});
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Ruta para eliminar un servicio por ID
router.delete('/services/:id', validateToken, async (req, res) => {
    try {
        const servicioEliminado = await Services.findByIdAndDelete(req.params.id);
        if (!servicioEliminado) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }
        res.status(200).json({ message: 'Servicio eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para obtener las categorías guardadas sin repeticiones, todas convertidas a minúsculas y unificadas
router.get('/servicios/categorias', async (req, res) => {
    try {
        const categorias = await Services.distinct('categoria');
        const categoriasUnicas = [...new Set(categorias.map(categoria => categoria.toLowerCase()))];
        res.status(200).json(categoriasUnicas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las categorías', error });
    }
});

// Ruta para obtener los servicios según la categoría
router.get('/servicios/:categoria', async (req, res) => {
    const { categoria } = req.params;

    try {
        const servicios = await Services.find({ categoria });
        res.status(200).json(servicios);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los servicios por categoría', error });
    }
});
