const mongoose = require('mongoose');

const citasSchema = new mongoose.Schema({
    servicioId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services",
        required: [true, "Please select a Service"]
    },
    nombre: {
        type: String,
        required: false
    },
    fechaNacimiento: {
        type: Date,
        required: false
    },
    telefono:{
        type: String,
        required: false
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
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
});

const Citas = mongoose.model('Citas', citasSchema);

module.exports = Citas;