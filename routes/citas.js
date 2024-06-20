const express = require('express');
const mongoose = require('mongoose')
const moment = require('moment');
const router = express.Router();
const Model = require('../model/citas');
const Users = require('../model/users')
const mensajeria = require('../mensajeria')

module.exports = router;

const jwt = require('jsonwebtoken');

//method to post a appoinment
router.post('/postCita', async (req,res) => {
    const { servicioId, nombre, fechaNacimiento, telefono, preferencias, citaDate, hora } = req.body;

     // Obtener la fecha y hora como objetos Date
     const fecha = new Date(citaDate);
     const horaArray = hora.split(':');
     
     // Establecer la hora y los minutos
     fecha.setUTCHours(parseInt(horaArray[0], 10));
     fecha.setMinutes(parseInt(horaArray[1], 10));

    const data = new Model({
        servicioId,
        nombre,
        fechaNacimiento,
        telefono,
        preferencias,
        citaDate: fecha
    });

    try{
        const dataToSave = await data.save();
        mensajeria.sendMessage("+503"+telefono, "Tu cita ha sido agendada el dia "+citaDate+" a las "+hora)
        res.status(200).json({tipo: 'success', mensaje: "Cita Agregada Correctamente",data: dataToSave})
    }catch(error){
        res.status(400).json({message: error.message})
    }
})

//Get All data
router.get('/getAllCitas', async (req, res) => {
    // Verify token
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;

        // Obtener fecha de hoy
        const today = moment().startOf('day');
        
        // Encontrar citas para hoy y el futuro
        const data = await Model.find({ citaDate: { $gte: today } }).populate('servicioId').sort({ citaDate: 1 });
        
        res.json(data);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(400).json({message: 'Invalid Token'});
        } else {
            res.status(500).json({message: error.message});
        }
    }
})

// Ruta para obtener todas las citas
router.get('/citas', async (req, res) => {
     // Verify token
     const token = req.header('auth-token');
     if (!token) return res.status(401).send('Access Denied');
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;

        const citas = await Model.find();
        res.status(200).json(citas);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(400).json({message: 'Invalid Token'});
        } else {
            res.status(500).json({message: error.message});
        }
    }
});

// Ruta para obtener una cita específica por ID
router.get('/cita/:id', async (req, res) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied');
        try {
       const verified = jwt.verify(token, process.env.JWT_SECRET);
       req.user = verified;
        const cita = await Model.findById(req.params.id);
        if (!cita) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }
        res.status(200).json(cita);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(400).json({message: 'Invalid Token'});
        } else {
            res.status(500).json({message: error.message});
        }
    }
});


// Ruta para actualizar una cita por ID
router.put('/cita/:id', async (req, res) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied');
        try {
       const verified = jwt.verify(token, process.env.JWT_SECRET);
       req.user = verified;
        const citaActualizada = await Model.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!citaActualizada) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }
        res.status(200).json(citaActualizada);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(400).json({message: 'Invalid Token'});
        } else {
            res.status(500).json({message: error.message});
        }
    }
});

// Ruta para eliminar una cita por ID
router.delete('/cita/:id', async (req, res) => {
    // Verify token
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;

        const citaEliminada = await Model.findByIdAndDelete(req.params.id);
        if (!citaEliminada) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }
        res.status(200).json({ message: 'Cita eliminada' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(400).json({message: 'Invalid Token'});
        } else {
            res.status(500).json({message: error.message});
        }
    }
});

// Ruta para re-agendar una cita
router.put('/citas/:id/reagendar', async (req, res) => {
    const { id } = req.params;
    const { nuevaFecha } = req.body;

    // Verify token
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        const cita = await Model.findById(id);

        if (!cita) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        // Actualiza la fecha y hora de la cita
        cita.citaDate = nuevaFecha;
        cita.estado = "Re-Agendado"

        await cita.save();

        res.status(200).json({ message: 'Cita re-agendada correctamente', cita });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(400).json({message: 'Invalid Token'});
        } else {
            res.status(500).json({ message: 'Error al re-agendar la cita', error });
        }
        
    }
});

// Ruta para actualizar una cita a Completa y poner el total y quién atendió
router.put('/citas/:id/completar', async (req, res) => {
    const { id } = req.params;
    const { total, atendidoPorId } = req.body;
    // Verify token
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        const cita = await Model.findById(id);

        if (!cita) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        // Verifica si el usuario que atendió existe
        const usuario = await Users.findById(atendidoPorId);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualiza el estado a "Completa", pone el total y quién atendió
        cita.estado = 'Completa';
        cita.total = total;
        cita.atendidoPor = atendidoPorId;

        await cita.save();

        res.status(200).json({ message: 'Cita completada correctamente', cita });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({message: 'Invalid Token'});
        } else {
            res.status(500).json({ message: 'Error al completar la cita', error });
        }
    }
});

// Ruta para obtener el total del mes por total de las citas completas
router.get('/total-mes/:mes', async (req, res) => {
    const { mes } = req.params;
    const anioActual = new Date().getFullYear(); // Puedes ajustar el año si lo necesitas

    // Crear las fechas de inicio y fin del mes
    const fechaInicio = new Date(anioActual, mes - 1, 1);
    const fechaFin = new Date(anioActual, mes, 0, 23, 59, 59, 999); // Último día del mes

    try {
        const totalMes = await Model.aggregate([
            {
                $match: {
                    estado: 'Completa',
                    citaDate: { $gte: fechaInicio, $lte: fechaFin }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$total' }
                }
            }
        ]);

        const total = totalMes.length > 0 ? totalMes[0].total : 0;

        res.status(200).json({ total });
    } catch (error) {
            res.status(500).json({ message: 'Error al obtener el total del mes', error });
    }
});

