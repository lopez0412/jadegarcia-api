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
            $gte: new Date(`${fecha}T00:00:00`),
            $lt: new Date(`${fecha}T23:59:59`),
        },
    });

    const availableTimes = [];
    const [horaInicio, minutoInicio] = this.horarioInicio.split(':').map(Number);
    const [horaFin, minutoFin] = this.horarioFin.split(':').map(Number);

    // Filtrar citas de la misma categoría
    const citasMismaCategoria = citas.filter(cita => cita.categoria === this.categoria);

    const maxEstaciones = this.estaciones;
    const maxPersonal = this.personalTotal;

    if (citasMismaCategoria.length < 2) {
        // Si no hay suficientes citas de la misma categoría, permitir agendar
        const currentDate = new Date(`${fecha}T00:00:00`);
        const currentTime = new Date(currentDate.toLocaleString());
        currentTime.setUTCHours(horaInicio, minutoInicio);
        const endTime = new Date(currentDate.toLocaleString());
        endTime.setUTCHours(horaFin, minutoFin, 0, 0);

        if (citas.length === 0) {
            // Si no hay citas para el día, mostrar todas las horas dentro del horario de servicio como disponibles
            while (currentTime < endTime) {
                if (currentTime.getHours() === 12 && currentTime.getMinutes() === 0) {
                    currentTime.setHours(13, 0, 0, 0);
                }

                availableTimes.push(currentTime.toISOString());
                currentTime.setMinutes(currentTime.getMinutes() + this.duration);
            }
        } else {
            while (currentTime < endTime) {
                const citasEnHora = citas.filter(cita => {
                    const citaDate = new Date(cita.citaDate);
                    return (
                        citaDate.getHours() === currentTime.getHours() &&
                        citaDate.getMinutes() === currentTime.getMinutes() &&
                        citaDate.getSeconds() === currentTime.getSeconds()
                    );
                }).length;

                if (citasEnHora < maxPersonal && citasEnHora < maxEstaciones) {
                    if (currentTime.getHours() === 12 && currentTime.getMinutes() === 0) {
                        currentTime.setHours(13, 0, 0, 0);
                    }

                    availableTimes.push(currentTime.toISOString());
                }

                currentTime.setMinutes(currentTime.getMinutes() + this.duration);
            }
        }
    }

    return availableTimes;
};

const Services = mongoose.model('Services', servicesSchema);

module.exports = Services;