document.getElementById('form').onsubmit = function(e) {
    e.preventDefault();
    
    var nombre = document.getElementById('nombre').value.trim();
    var neveria = document.getElementById('neveria').value.trim();
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var confirmar = document.getElementById('confirmar').value;
    
    var valido = true;
    
    // Validar nombre
    if (nombre === '') {
        document.getElementById('nombre').classList.add('error');
        document.getElementById('error-nombre').classList.add('show');
        valido = false;
    } else {
        document.getElementById('nombre').classList.remove('error');
        document.getElementById('error-nombre').classList.remove('show');
    }
    
    // Validar email
    if (email === '' || email.indexOf('@') === -1) {
        document.getElementById('email').classList.add('error');
        document.getElementById('error-email').classList.add('show');
        valido = false;
    } else {
        document.getElementById('email').classList.remove('error');
        document.getElementById('error-email').classList.remove('show');
    }
    
    // Validar contraseña mínima
    if (password.length < 6) {
        document.getElementById('password').classList.add('error');
        document.getElementById('error-password').classList.add('show');
        valido = false;
    } else {
        document.getElementById('password').classList.remove('error');
        document.getElementById('error-password').classList.remove('show');
    }
    
    // Validar que contraseñas coincidan
    if (password !== confirmar) {
        document.getElementById('confirmar').classList.add('error');
        document.getElementById('error-confirmar').classList.add('show');
        valido = false;
    } else {
        document.getElementById('confirmar').classList.remove('error');
        document.getElementById('error-confirmar').classList.remove('show');
    }
    
    if (!valido) return;
    
    // Obtener usuarios guardados
    var usuarios = JSON.parse(localStorage.getItem('usuariosNeveria') || '[]');
    
    // Verificar si email ya existe
    if (usuarios.some(function(u) { return u.email === email; })) {
        alert('Este email ya está registrado');
        return;
    }
    
    // Crear nuevo usuario
    var nuevoUsuario = {
        nombre: nombre,
        neveria: neveria || 'Mi Nevería',
        email: email,
        password: password
    };
    
    // Guardar en localStorage
    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuariosNeveria', JSON.stringify(usuarios));
    
    alert('¡Cuenta creada correctamente!');
    window.location.href = 'login.html';
};