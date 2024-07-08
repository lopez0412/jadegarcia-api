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

router.post('/postCitaUser', async (req, res) => {
    try {

        const { servicioId, userId, telefono, citaDate, hora } = req.body;

        const fecha = new Date(citaDate);
        const horaArray = hora.split(':');
        fecha.setUTCHours(parseInt(horaArray[0], 10));
        fecha.setMinutes(parseInt(horaArray[1], 10));

        const data = new Model({
            servicioId,
            userId,
            citaDate: fecha
        });

        const dataToSave = await data.save();
        mensajeria.sendMessage("+503" + telefono, "Tu cita ha sido agendada el dia " + citaDate + " a las " + hora);
        res.status(200).json({ tipo: 'success', mensaje: "Cita Agregada Correctamente", data: dataToSave });
    } catch (error) {
            res.status(500).json({ message: error.message });
    }
});


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
        
        // Encontrar citas para hoy y el futuro, incluyendo información del usuario si está disponible
        const data = await Model.find({ citaDate: { $gte: today } })
                                .populate('servicioId')
                                .populate({
                                    path: 'userId',
                                    select: 'id nombre username informacion'
                                })
                                .sort({ citaDate: 1 });
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

router.get('/total-dia', async (req, res) => {
    const fechaHoyInicio = new Date();
    fechaHoyInicio.setHours(0, 0, 0, 0);

    const fechaHoyFin = new Date();
    fechaHoyFin.setHours(23, 59, 59, 999);

    try {
        const totalDia = await Model.aggregate([
            {
                $match: {
                    estado: 'Completa',
                    citaDate: { $gte: fechaHoyInicio, $lte: fechaHoyFin }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$total' }
                }
            }
        ]);

        const total = totalDia.length > 0 ? totalDia[0].total : 0;

        res.status(200).json({ total });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el total del día', error });
    }
});


router.get('/citas-por-estilista', async (req, res) => {
    try {
        const citasPorEstilista = await Model.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'estilistaId',
                    foreignField: '_id',
                    as: 'estilistaInfo'
                }
            },
            {
                $match: {
                    'estilistaInfo.roles': 'Estilista',
                    'citaDate': { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)), $lte: new Date() }
                }
            },
            {
                $group: {
                    _id: '$estilistaId',
                    citas: { $push: '$$ROOT' },
                    total: { $sum: 1 }
                }
            }
        ]);

        if (!citasPorEstilista.length) {
            return res.status(404).json({ message: 'No se encontraron citas para estilistas este mes' });
        }

        res.status(200).json(citasPorEstilista);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las citas por estilista este mes', error });
    }
});

router.get('/historial-citas-clienta', async (req, res) => {
    try {
        const userId = req.body.userId; // Assuming the user ID is passed in the request body
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const historialCitas = await Model.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    'userInfo.roles': 'Clienta'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $unwind: '$userInfo'
            },
            {
                $project: {
                    _id: 1,
                    fecha: 1,
                    servicio: 1,
                    'userInfo.nombre': 1
                }
            },
            {
                $sort: { fecha: -1 } // Sorting by date in descending order
            },
            {
                $limit: 5 // Limiting to the last 5 citations
            }
        ]);

        if (historialCitas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron citas para la clienta' });
        }

        res.status(200).json(historialCitas);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error al obtener el historial de citas', error });
    }
});



