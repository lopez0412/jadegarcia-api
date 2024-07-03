const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/users');

const router = express.Router();

// User login route
router.post('/login', async (req, res) => {
    // Check if user exists
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
        return res.status(400).send('User not found');
    }

    // Check if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
        return res.status(400).send('Invalid password');
    }

    // Create and assign a token
    const token = user.generateAuthToken();
    res.header('auth-token', token).send(token);
});

// User login route with additional information without token generation
router.post('/loginUser', async (req, res) => {
    // Check if user exists
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
        return res.status(400).send('User not found');
    }

    // Check if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
        return res.status(400).send('Invalid password');
    }

    // Return user details
    res.send({
        id: user._id,
        nombre: user.nombre,
        telefono: user.informacion ? user.informacion.telefono : null
    });
});



//Method to register user
router.post('/register', async (req, res) => {
    // Check if user exists
    const user = await User.findOne({ username: req.body.username });
    if (user) {
        return res.status(400).send('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const newUser = new User({
        nombre: req.body.nombre,
        username: req.body.username,
        password: hashedPassword,
        roles: req.body.roles
    });

    try {
        const savedUser = await newUser.save();
        res.send(savedUser);
    } catch (error) {
        res.status(400).send(error);
    }
});

//Method to register user
router.post('/registerUser', async (req, res) => {
    // Check if user exists
    const user = await User.findOne({ username: req.body.username });
    if (user) {
        return res.status(400).send('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const newUser = new User({
        nombre: req.body.nombre,
        username: req.body.username,
        password: hashedPassword,
        roles: ["User","Clienta"],
        informacion: req.body.informacion
    });

    try {
        const savedUser = await newUser.save();
        res.send(savedUser);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/personal', async (req, res) =>{
    try{
        const users =  await User.find({ roles: { $in: ['Admin', 'Estilista'] } }).select('_id nombre');
        res.send(users)
    }catch(error){
        res.status(400).send(error)
    }
    
})



router.post('/addUserNote', async (req, res) => {
    const { userId, note } = req.body;
    if (!userId || !note) {
        return res.status(400).send('User ID and note are required');
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        if (!user.informacion) {
            user.informacion = {};
        }

        if (!user.informacion.notas) {
            user.informacion.notas = [];
        }

        user.informacion.notas.push(note);
        await user.save();
        res.send('Note added to user successfully');
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/search', async (req, res) => {
    const { nombre } = req.body;
    const query = { roles: { $in: ['User', 'Client'] } };

    if (nombre) {
        query.nombre = { $regex: nombre, $options: 'i' };
    }

    try {
        const users = await User.find(query).select('_id nombre telefono');
        res.send(users);
    } catch (error) {
        res.status(400).send(error);
    }
});





module.exports = router;
