const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'bike_user',
    password: '9763739',
    database: 'bike_rental2'
});

// Ruta de registro
router.post('/register', (req, res) => {
    const { nombre, email, fecha_nac, rut, telefono } = req.body;

    // Validar entrada
    if (!nombre || !email || !fecha_nac || !rut || !telefono) {
        return res.status(400).send('Todos los campos son requeridos');
    }

    // Verificar si el usuario ya existe
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            return res.status(400).send('El usuario ya existe');
        }

        // Generar una contraseña aleatoria
        const password = crypto.randomBytes(8).toString('hex');
        const hashedPassword = bcrypt.hashSync(password, 8);

        // Insertar nuevo usuario en la base de datos
        db.query(
            'INSERT INTO users (nombre, email, fecha_nac, rut, telefono, password, confirmed) VALUES (?, ?, ?, ?, ?, ?, false)',
            [nombre, email, fecha_nac, rut, telefono, hashedPassword],
            (err, results) => {
                if (err) throw err;

                // Crear token de confirmación
                const token = jwt.sign({ email }, 'secretkey', { expiresIn: '1h' });

                // Configurar transporte de correo
                const transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: 'software.masterbikes@gmail.com',
                        pass: 'software1234'
                    }
                });

                // Configurar correo electrónico
                const mailOptions = {
                    from: 'software.masterbikes@gmail.com',
                    to: email,
                    subject: 'Confirmación de Registro y Clave de Acceso',
                    text: `Tu registro ha sido exitoso. Tu clave de acceso es: ${password}\nPor favor confirma tu registro haciendo clic en el siguiente enlace: http://localhost:3000/auth/confirm/${token}`
                };

                // Enviar correo electrónico
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) throw err;
                    res.send('Registro exitoso. Por favor revisa tu correo para confirmar tu registro y obtener tu clave de acceso.');
                });
            }
        );
    });
});

// Ruta de confirmación
router.get('/confirm/:token', (req, res) => {
    const { token } = req.params;

    // Verificar token
    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) return res.status(400).send('Token inválido o expirado');

        // Confirmar usuario
        db.query('UPDATE users SET confirmed = true WHERE email = ?', [decoded.email], (err, results) => {
            if (err) throw err;
            res.send('Registro confirmado exitosamente');
        });
    });
});

module.exports = router;

// Ruta de inicio de sesión
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validar entrada
    if (!email || !password) {
        return res.status(400).send('Correo y contraseña son requeridos');
    }

    // Verificar usuario
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.status(400).send('Usuario no encontrado');
        }

        const user = results[0];

        // Verificar contraseña
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Contraseña incorrecta');
        }

        // Verificar si el usuario está confirmado
        if (!user.confirmed) {
            return res.status(400).send('Por favor confirma tu registro antes de iniciar sesión');
        }

        // Crear token JWT
        const token = jwt.sign({ id: user.id, email: user.email }, 'secretkey', {
            expiresIn: '24h',
        });

        res.send({ auth: true, token });
    });
});
