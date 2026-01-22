require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(express.json()); // RA2.b (JSON válido)
app.use(cors());

// --- RA3: CONEXIÓN A BASE DE DATOS ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error de conexión:', err));

// --- RA3.a / RA3.e: ESQUEMA MONGOOSE ---
const taskSchema = new mongoose.Schema({
    titulo: { 
        type: String, 
        required: true 
    },
    tecnologia: { 
        type: String, 
        required: true 
    }, 
    estado: { 
        type: String, 
        enum: ['pending', 'done'], // Validamos que sea uno de estos dos
        default: 'pending' 
    },
    fecha: { 
        type: Date, 
        default: Date.now 
    }
});

const Task = mongoose.model('Task', taskSchema);

// --- RA2: API REST ---

// GET /api/tasks: Devuelve todas las tareas
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ fecha: -1 }); // Ordenadas por fecha (más nuevas primero)
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener tareas' });
    }
});

// POST /api/tasks: Crea una nueva tarea
app.post('/api/tasks', async (req, res) => {
    try {
        const newTask = new Task(req.body);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask); // Código 201: Created
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar tarea' });
    }
});

// DELETE /api/tasks/:id: Elimina tarea por ID
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }
        res.status(200).json({ message: 'Tarea eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar tarea' });
    }
});

// --- RA2.a: SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});