const API_URL = 'http://localhost:3000/api/tasks';
const tasksContainer = document.getElementById('tasksContainer');
const taskForm = document.getElementById('taskForm');

// Evento: Cargar tareas al iniciar
document.addEventListener('DOMContentLoaded', fetchTasks);

// Función GET (Async/Await)
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error en la red');
        
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('Error:', error);
        // Usamos una alerta de Bootstrap en lugar de texto rojo simple
        tasksContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center" role="alert">
                    ❌ Error cargando tareas. Revisa que el backend (puerto 3000) esté encendido.
                </div>
            </div>`;
    }
}

// --- AQUÍ ESTÁ EL CAMBIO IMPORTANTE ---
// Función renderizado (DOM) adaptada a Bootstrap
function renderTasks(tasks) {
    tasksContainer.innerHTML = ''; // Limpiar
    
    if (tasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="col-12 text-center text-muted py-5">
                <h4>🎉 ¡Todo limpio!</h4>
                <p>No hay tareas pendientes. ¡Buen trabajo!</p>
            </div>`;
        return;
    }

    tasks.forEach(task => {
        // 1. Crear la columna de Bootstrap (Grid)
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4'; // 1 col en móvil, 2 en tablet, 3 en PC

        // 2. Determinar estilos según estado
        const isDone = task.estado === 'done';
        // Clases para la tarjeta (incluye nuestras clases personalizadas 'task-card' y 'done')
        const cardClass = isDone ? 'card h-100 shadow-sm task-card done' : 'card h-100 shadow-sm task-card';
        // Badge (Etiqueta) de Bootstrap
        const badgeHTML = isDone 
            ? '<span class="badge bg-success">Completada ✅</span>' 
            : '<span class="badge bg-warning text-dark">Pendiente 🟠</span>';

        // 3. Formatear fecha
        const fecha = new Date(task.fecha).toLocaleDateString();

        // 4. Inyectar el HTML de la tarjeta
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
                        
                        <button class="btn btn-outline-danger btn-sm w-100 delete-btn" onclick="deleteTask('${task._id}')">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        tasksContainer.appendChild(col);
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
            taskForm.reset(); // Limpiar formulario
            fetchTasks(); // Recargar lista
        }
    } catch (error) {
        console.error('Error guardando:', error);
        alert('Error al guardar la tarea');
    }
});

// Función Eliminar (DELETE)
// Nota: La dejamos en window para que funcione el onclick="" del HTML inyectado
window.deleteTask = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta tarea?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchTasks(); // Actualizar interfaz
        }
    } catch (error) {
        console.error('Error eliminando:', error);
        alert('No se pudo eliminar la tarea');
    }
};