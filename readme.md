# DevTask Tracker - "El Monolito Artesanal"

**DevTask Tracker** es una aplicación FullStack (SPA) para la gestión de tareas de desarrollo.

Este proyecto ha sido desarrollado utilizando **JavaScript Nativo (Vanilla JS)** sobre un servidor Node.js. El objetivo es demostrar el dominio del ciclo de vida de las peticiones HTTP, la arquitectura Cliente-Servidor y el manejo de bases de datos NoSQL.


## Stack Tecnológico

* **Frontend:** HTML5 Semántico, CSS3 (Bootstrap 5), Vanilla JavaScript (ES6+).
* **Backend:** Node.js, Express.js (API RESTful).
* **Base de Datos:** MongoDB Atlas (Cloud) + Mongoose ODM.


## 📂 Estructura del Proyecto

MANOLITO_ARTESANAL/
├── backend/            # Lógica del servidor
│   ├── .env            # Variables de entorno (¡CREARLO!)
│   ├── package.json    # Dependencias (Express, Mongoose, etc.)
│   ├── server.js       # Punto de entrada del servidor
│   └── node_modules/   
├── frontend/           # Cliente web
│   ├── app.js          # Lógica del cliente (Fetch API)
│   ├── index.html      # Estructura HTML
│   └── styles.css      # Estilos personalizados
└── readme.md           # Documentación del proyecto

## Guía Rápida de Arranque

Si te acabas de clonar el repo, ejecuta estos comandos en tu terminal para ponerlo en marcha:

```
bash
# 1. Entra en la carpeta del servidor
cd backend

# 2. Descarga las librerías necesarias (Git no las incluye)
npm install

# 3. Crea tu archivo de claves (Git no guarda contraseñas)
# (Crea un archivo llamado .env y pon dentro: MONGO_URI=tu_conexion_mongodb)

# 4. ¡Arranca!
node server.js
```