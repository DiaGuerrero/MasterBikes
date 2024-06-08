document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const fecha_nac = document.getElementById('fecha_nac').value;
    const rut = document.getElementById('rut').value;
    const telefono = document.getElementById('telefono').value;

    const data = {
        nombre: nombre,
        email: email,
        fecha_nac: fecha_nac,
        rut: rut,
        telefono: telefono
    };

    fetch('/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            alert('Registro exitoso. Revisa tu correo para confirmar tu registro.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});