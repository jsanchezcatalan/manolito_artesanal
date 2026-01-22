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
        tasksContainer.innerHTML = '<p style="color:red">Error cargando tareas. Revisa que el servidor esté encendido.</p>';
    }
}

// Función renderizado (DOM)
function renderTasks(tasks) {
    tasksContainer.innerHTML = ''; // Limpiar
    
    if (tasks.length === 0) {
        tasksContainer.innerHTML = '<p>No hay tareas pendientes. ¡Buen trabajo!</p>';
        return;
    }

    tasks.forEach(task => {
        const card = document.createElement('div');
        card.classList.add('card');
        if (task.estado === 'done') card.classList.add('done');

        // Formatear fecha
        const fecha = new Date(task.fecha).toLocaleDateString();

        card.innerHTML = `
            <h3>${task.titulo}</h3>
            <span class="tech-tag">${task.tecnologia}</span>
            <p><strong>Estado:</strong> ${task.estado === 'done' ? 'Completada' : 'Pendiente'}</p>
            <p><small>📅 ${fecha}</small></p>
            <button class="delete-btn" onclick="deleteTask('${task._id}')">
                Eliminar Tarea
            </button>
        `;
        tasksContainer.appendChild(card);
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
            fetchTasks(); // Feedback visual: recargar lista sin F5
        }
    } catch (error) {
        console.error('Error guardando:', error);
        alert('Error al guardar la tarea');
    }
});

// Función Eliminar (DELETE)
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