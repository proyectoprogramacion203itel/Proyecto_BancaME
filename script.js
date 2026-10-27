document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const headerTitle = document.getElementById('header-title');
    const bankDashboard = document.getElementById('bank-dashboard');
    const btnLogout = document.getElementById('btn-logout');

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        headerTitle.textContent = 'Crear cuenta BancaME';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        headerTitle.textContent = 'Iniciar Sesión';
    });

    // Petición de Registro a la API de Django
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usuario = document.getElementById('reg-user').value;
        const password = document.getElementById('reg-pass').value;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, password })
            });
            const data = await response.json();

            if (data.success) {
                alert('¡Usuario registrado con éxito!');
                registerForm.reset();
                registerForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
                headerTitle.textContent = 'Iniciar Sesión';
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            alert('Error de conexión con el servidor de Django.');
        }
    });

    // Petición de Login a la API de Django
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usuario = document.getElementById('login-user').value;
        const password = document.getElementById('login-pass').value;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, password })
            });
            const data = await response.json();

            if (data.success) {
                mostrarBanco();
            } else {
                alert('Usuario o contraseña incorrectos.');
            }
        } catch (error) {
            alert('Error de conexión con el servidor de Django.');
        }
    });

    function mostrarBanco() {
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        headerTitle.classList.add('hidden');
        bankDashboard.classList.remove('hidden');
    }

    btnLogout.addEventListener('click', () => {
        bankDashboard.classList.add('hidden');
        headerTitle.classList.remove('hidden');
        loginForm.classList.remove('hidden');
        loginForm.reset();
        headerTitle.textContent = 'Iniciar Sesión';
    });
});