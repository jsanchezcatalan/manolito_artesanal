require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(express.json()); 
app.use(cors());

// SERVIR FRONTEND 
app.use(express.static(path.join(__dirname, '../frontend')));

// --- CONEXIÓN A BASE DE DATOS ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error de conexión:', err));

// ESQUEMA MONGOOSE ACTUALIZADO
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
        enum: ['pending', 'done'], 
        default: 'pending' 
    },
    fecha: { 
        type: Date, 
        default: Date.now 
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
});

const Task = mongoose.model('Task', taskSchema);


// GET /api/tasks: Devuelve SOLO las tareas activas (no eliminadas)
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({ deleted: false }).sort({ fecha: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener tareas' });
    }
});

// GET /api/tasks/history: Devuelve SOLO las tareas en el historial (eliminadas)
app.get('/api/tasks/history', async (req, res) => {
    try {
        const deletedTasks = await Task.find({ deleted: true }).sort({ deletedAt: -1 });
        res.status(200).json(deletedTasks);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

// POST /api/tasks: Crea una nueva tarea
app.post('/api/tasks', async (req, res) => {
    try {
        const newTask = new Task(req.body);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask); 
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar tarea' });
    }
});

// NUEVO: PATCH /api/tasks/:id/toggle - Cambiar estado entre pending/done
app.patch('/api/tasks/:id/toggle', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        // Cambiar el estado
        task.estado = task.estado === 'pending' ? 'done' : 'pending';
        await task.save();
        
        res.status(200).json({ message: 'Estado actualizado', task });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
});

// DELETE /api/tasks/:id: Marca tarea como eliminada (SOFT DELETE)
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        // Si la tarea ya está en el historial (deleted=true), eliminarla DEFINITIVAMENTE
        if (task.deleted) {
            await Task.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: 'Tarea eliminada DEFINITIVAMENTE' });
        }

        // Si es la primera eliminación, moverla al historial
        task.deleted = true;
        task.deletedAt = new Date();
        await task.save();
        
        res.status(200).json({ message: 'Tarea movida al historial' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar tarea' });
    }
});

// Restaurar tarea del historial
app.patch('/api/tasks/:id/restore', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        task.deleted = false;
        task.deletedAt = null;
        await task.save();
        
        res.status(200).json({ message: 'Tarea restaurada', task });
    } catch (error) {
        res.status(500).json({ error: 'Error al restaurar tarea' });
    }
});


// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// --- SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});