const mongoose = require('mongoose');
const Citas = require('../model/citas');


const servicesSchema = new mongoose.Schema({
    images: [{
        type: String, // URLs o rutas a las imágenes
    }],
    nombre: {
        type: String,
        required: true
    },
    descripcion:{
        type: String,
        required: true
    },
    precio:{
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        }
    },
    estaciones:{
        type: Number,
        default: 2
    },
    personalTotal: {
        type: Number, // personal total para el salón
        default: 4
    },
    indicaciones:{
        type: String,
        required: true
    },
    duration: {
        type: Number, // en minutos o horas
        required: true,
    },
    horarioInicio: {
        type: String, // por ejemplo, "08:00"
        default: "08:00",
    },
    horarioFin: {
        type: String, // por ejemplo, "17:00"
        default: "17:00",
    },
    categoria: {
        type: String, // Agregar categoría
        required: true
    },
});

servicesSchema.methods.getAvailableTimes = async function (fecha) {
    const citas = await Citas.find({
        citaDate: {
            $gte: new Date(`${fecha}T00:00:00Z`),
            $lt: new Date(`${fecha}T23:59:59Z`),
        },
        categoria: this.categoria
    });

    const availableTimes = [];
    const [horaInicio, minutoInicio] = this.horarioInicio.split(':').map(Number);
    const [horaFin, minutoFin] = this.horarioFin.split(':').map(Number);

    const currentDate = new Date(`${fecha}T00:00:00Z`);
    const currentTime = new Date(currentDate);
    currentTime.setUTCHours(horaInicio, minutoInicio, 0, 0);
    const endTime = new Date(currentDate);
    endTime.setUTCHours(horaFin, minutoFin, 0, 0);

    while (currentTime < endTime) {
        const citasEnHora = citas.filter(cita => {
            const citaDate = new Date(cita.citaDate);
            return (
                citaDate.getUTCHours() === currentTime.getUTCHours() &&
                citaDate.getUTCMinutes() === currentTime.getUTCMinutes()
            );
        });

        const estacionesOcupadas = citasEnHora.length;
        const personalOcupado = citasEnHora.reduce((acc, cita) => acc + cita.personalAsignado, 0);

        if (estacionesOcupadas < this.estaciones && personalOcupado < this.personalTotal) {
            availableTimes.push(currentTime.toISOString());
        }

        currentTime.setUTCMinutes(currentTime.getUTCMinutes() + this.duration);
    }

    return availableTimes;
};

const Services = mongoose.model('Services', servicesSchema);

module.exports = Services;