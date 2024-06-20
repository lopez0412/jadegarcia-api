const mongoose = require('mongoose');

const citasSchema = new mongoose.Schema({
    servicioId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services",
        required: [true, "Please select a Service"]
    },
    nombre: {
        type: String,
        required: true
    },
    fechaNacimiento: {
        type: Date,
        required: true
    },
    telefono:{
        type: String,
        required: true
    },
    preferencias:{
        type:String,
        required: false
    },
    citaDate:{
        type: Date,
        required: true
    },
    estado:{
        type: String,
        default: "Agendado"
    },
    total: {
        type: Number,
        default: 0
    },
    atendidoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencia al modelo de usuario
        required: false
    }
});

const Citas = mongoose.model('Citas', citasSchema);

module.exports = Citas;