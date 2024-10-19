const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Redirigir a /login al acceder a la raíz
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Ruta para servir la página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas para servir otras páginas

app.get('/patients', (req, res) => res.sendFile(path.join(__dirname, 'public', 'patients.html')));
app.get('/doctors', (req, res) => res.sendFile(path.join(__dirname, 'public', 'doctors.html')));
app.get('/appointments', (req, res) => res.sendFile(path.join(__dirname, 'public', 'appointments.html')));
app.get('/consultationRooms', (req, res) => res.sendFile(path.join(__dirname, 'public', 'consultationRooms.html')));
app.get('/pendingAppointments', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pendingAppointments.html')));
app.get('/records', (req, res) => res.sendFile(path.join(__dirname, 'public', 'records.html')));
app.get('/payments', (req, res) => res.sendFile(path.join(__dirname, 'public', 'payments.html')));
app.get('/paymentsByDate', (req, res) => res.sendFile(path.join(__dirname, 'public', 'paymentsByDate.html')));
app.get('/appointmentsByDoctorDate', (req, res) => res.sendFile(path.join(__dirname, 'public', 'appointmentsByDoctorDate.html')));

const apiBaseUrl = 'https://gestorcitas.onrender.com/api';

app.use('/api', (req, res) => {
    const url = `${apiBaseUrl}${req.url}`;
    axios({ method: req.method, url, data: req.body })
        .then(response => res.json(response.data))
        .catch(error => res.status(error.response.status).send(error.message));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
