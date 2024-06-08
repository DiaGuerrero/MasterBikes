const express = require('express');
const bodyParser = require('body-parser');

const path = require('path');
const app = express();

// Configurar la carpeta public como estática
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para manejar la solicitud de registro.html
app.get('/registro.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registro.html'));
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Puerto del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});