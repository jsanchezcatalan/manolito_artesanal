const API_URL = '/api/tasks';
const HISTORY_URL = '/api/tasks/history';
const tasksContainer = document.getElementById('tasksContainer');
const historyContainer = document.getElementById('historyContainer');
const taskForm = document.getElementById('taskForm');

// Evento: Cargar tareas al iniciar
document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();
    fetchHistory();
});

// Función GET - Tareas Activas (Async/Await)
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error en la red');
        
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('Error:', error);
        tasksContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center" role="alert">
                    ❌ Error cargando tareas. Revisa que el backend (puerto 3000) esté encendido.
                </div>
            </div>`;
    }
}

// Función GET - Historial de Tareas Eliminadas
async function fetchHistory() {
    try {
        const response = await fetch(HISTORY_URL);
        if (!response.ok) throw new Error('Error en la red');
        
        const deletedTasks = await response.json();
        renderHistory(deletedTasks);
    } catch (error) {
        console.error('Error:', error);
        historyContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning text-center" role="alert">
                    ⚠️ Error cargando historial
                </div>
            </div>`;
    }
}

// Renderizar Tareas Activas
function renderTasks(tasks) {
    tasksContainer.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="col-12 text-center text-muted py-5">
                <h4>🎉 ¡Todo limpio!</h4>
                <p>No hay tareas pendientes. ¡Buen trabajo!</p>
            </div>`;
        return;
    }

    tasks.forEach(task => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';

        const isDone = task.estado === 'done';
        const cardClass = isDone ? 'card h-100 shadow-sm task-card done' : 'card h-100 shadow-sm task-card';
        const badgeHTML = isDone 
            ? '<span class="badge bg-success">Completada ✅</span>' 
            : '<span class="badge bg-warning text-dark">Pendiente 🟠</span>';

        const fecha = new Date(task.fecha).toLocaleDateString();

        // NUEVO: Botón para cambiar estado
        const toggleButton = isDone 
            ? `<button class="btn btn-outline-secondary btn-sm w-100 mb-2" onclick="toggleTaskStatus('${task._id}')">
                ↩️ Marcar como Pendiente
               </button>`
            : `<button class="btn btn-outline-success btn-sm w-100 mb-2" onclick="toggleTaskStatus('${task._id}')">
                ✅ Marcar como Completada
               </button>`;

        col.innerHTML = `
            <div class="${cardClass}">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="tech-tag">${task.tecnologia}</span>
                        ${badgeHTML}
                    </div>
                    
                    <h3 class="card-title h5 fw-bold mb-3">${task.titulo}</h3>
                    
                    <div class="mt-auto">
                        <p class="text-muted small mb-3">📅 ${fecha}</p>
                        
                        ${toggleButton}
                        
                        <button class="btn btn-outline-danger btn-sm w-100 delete-btn" onclick="deleteTask('${task._id}')">
                            🗑️ Mover al Historial
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        tasksContainer.appendChild(col);
    });
}

// Renderizar Historial de Tareas Eliminadas
function renderHistory(tasks) {
    historyContainer.innerHTML = '';
    
    if (tasks.length === 0) {
        historyContainer.innerHTML = `
            <div class="col-12 text-center text-muted py-4">
                <p>📭 No hay tareas en el historial</p>
            </div>`;
        return;
    }

    tasks.forEach(task => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';

        const isDone = task.estado === 'done';
        const badgeHTML = isDone 
            ? '<span class="badge bg-success opacity-75">Completada ✅</span>' 
            : '<span class="badge bg-warning text-dark opacity-75">Pendiente 🟠</span>';

        const fecha = new Date(task.fecha).toLocaleDateString();
        const fechaEliminacion = new Date(task.deletedAt).toLocaleDateString();

        col.innerHTML = `
            <div class="card h-100 shadow-sm task-card deleted">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="tech-tag opacity-75">${task.tecnologia}</span>
                        ${badgeHTML}
                    </div>
                    
                    <h3 class="card-title h5 fw-bold mb-3 text-muted">${task.titulo}</h3>
                    
                    <div class="mt-auto">
                        <p class="text-muted small mb-1">📅 Creada: ${fecha}</p>
                        <p class="text-muted small mb-3">🗑️ Eliminada: ${fechaEliminacion}</p>
                        
                        <div class="d-grid gap-2">
                            <button class="btn btn-outline-success btn-sm" onclick="restoreTask('${task._id}')">
                                ↩️ Restaurar
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="permanentDelete('${task._id}')">
                                ❌ Eliminar Definitivamente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        historyContainer.appendChild(col);
    });
}

// Evento: Guardar Tarea (POST)
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newTask = {
        titulo: document.getElementById('titulo').value,
        tecnologia: document.getElementById('tecnologia').value,
        estado: document.getElementById('estado').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });

        if (response.ok) {
            taskForm.reset();
            fetchTasks();
        }
    } catch (error) {
        console.error('Error guardando:', error);
        alert('Error al guardar la tarea');
    }
});

// NUEVO: Función para cambiar estado de la tarea
window.toggleTaskStatus = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}/toggle`, {
            method: 'PATCH'
        });

        if (response.ok) {
            fetchTasks(); // Recargar tareas
        }
    } catch (error) {
        console.error('Error cambiando estado:', error);
        alert('No se pudo cambiar el estado de la tarea');
    }
};

// Función: Mover al Historial (Primera eliminación)
window.deleteTask = async (id) => {
    if (!confirm('¿Mover esta tarea al historial?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchTasks();
            fetchHistory();
        }
    } catch (error) {
        console.error('Error eliminando:', error);
        alert('No se pudo mover la tarea al historial');
    }
};

// Función: Restaurar Tarea del Historial
window.restoreTask = async (id) => {
    if (!confirm('¿Restaurar esta tarea al backlog activo?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}/restore`, {
            method: 'PATCH'
        });

        if (response.ok) {
            fetchTasks();
            fetchHistory();
        }
    } catch (error) {
        console.error('Error restaurando:', error);
        alert('No se pudo restaurar la tarea');
    }
};

// Función: Eliminar DEFINITIVAMENTE (Segunda eliminación)
window.permanentDelete = async (id) => {
    if (!confirm('⚠️ ¿ELIMINAR DEFINITIVAMENTE? Esta acción NO se puede deshacer.')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchHistory();
        }
    } catch (error) {
        console.error('Error eliminando definitivamente:', error);
        alert('No se pudo eliminar la tarea');
    }
};