const express = require('express');
const router = express.Router();
const Gastos = require('../model/gastos'); // Adjust the path as per your project structure

// Get all expenses
router.get('/gastos', async (req, res) => {
    try {
        const gastos = await Gastos.find();
        res.json(gastos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get expenses by month
router.get('/gastos/month/:year/:month', async (req, res) => {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    try {
        const monthlyGastos = await Gastos.find({
            fecha: {
                $gte: startDate,
                $lte: endDate
            }
        });
        res.json(monthlyGastos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Get one expense
router.get('/gasto/:id', getGasto, (req, res) => {
    res.json(res.gasto);
});

// Create new expense
router.post('/gasto', async (req, res) => {
    const gasto = new Gastos({
        fecha: req.body.fecha,
        descripcion: req.body.descripcion,
        monto: req.body.monto,
        categoria: req.body.categoria,
        metodoPago: req.body.metodoPago,
        nota: req.body.nota
    });

    try {
        const newGasto = await gasto.save();
        res.status(201).json(newGasto);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an expense
router.put('/gasto/:id', getGasto, async (req, res) => {
    if (req.body.fecha != null) {
        res.gasto.fecha = req.body.fecha;
    }
    if (req.body.descripcion != null) {
        res.gasto.descripcion = req.body.descripcion;
    }
    if (req.body.monto != null) {
        res.gasto.monto = req.body.monto;
    }
    if (req.body.categoria != null) {
        res.gasto.categoria = req.body.categoria;
    }
    if (req.body.metodoPago != null) {
        res.gasto.metodoPago = req.body.metodoPago;
    }
    if (req.body.nota != null) {
        res.gasto.nota = req.body.nota;
    }

    try {
        const updatedGasto = await res.gasto.save();
        res.json(updatedGasto);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an expense
router.delete('/gasto/:id', getGasto, async (req, res) => {
    try {
        await res.gasto.remove();
        res.json({ message: 'Deleted Gasto' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware to get gasto object by ID
async function getGasto(req, res, next) {
    let gasto;
    try {
        gasto = await Gastos.findById(req.params.id);
        if (gasto == null) {
            return res.status(404).json({ message: 'Cannot find gasto' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.gasto = gasto;
    next();
}

module.exports = router;
