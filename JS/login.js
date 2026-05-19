document.getElementById('form').onsubmit = function(e) {
    e.preventDefault();
    
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    
    var valido = true;
    
    // Validar email
    if (email === '' || email.indexOf('@') === -1) {
        document.getElementById('email').classList.add('error');
        document.getElementById('error-email').classList.add('show');
        valido = false;
    } else {
        document.getElementById('email').classList.remove('error');
        document.getElementById('error-email').classList.remove('show');
    }
    
    // Validar contraseña
    if (password === '') {
        document.getElementById('password').classList.add('error');
        document.getElementById('error-password').classList.add('show');
        valido = false;
    } else {
        document.getElementById('password').classList.remove('error');
        document.getElementById('error-password').classList.remove('show');
    }
    
    if (!valido) return;
    
    // Obtener usuarios de localStorage
    var usuarios = JSON.parse(localStorage.getItem('usuariosNeveria') || '[]');
    
    // Buscar usuario que coincida
    var usuario = null;
    for (var i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === email && usuarios[i].password === password) {
            usuario = usuarios[i];
            break;
        }
    }
    
    if (usuario) {
        // Guardar sesión
        localStorage.setItem('sesionActual', JSON.stringify(usuario));
        alert('¡Bienvenido ' + usuario.nombre + '!');
        window.location.href = 'index.html';
    } else {
        alert('Email o contraseña incorrectos');
    }
};