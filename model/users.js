const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    nombre:{
        type: String,
        require: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    roles: [{
        type: String,
        required: true
    }]
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id,username: this.username,nombre: this.nombre, roles: this.roles }, process.env.JWT_SECRET, {
        expiresIn: '8h'
    });
    return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
