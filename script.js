document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const dashboardSection = document.getElementById('dashboard-section');

    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    if (showRegister && showLogin) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.style.display = 'none';
            registerSection.style.display = 'block';
        });

        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerSection.style.display = 'none';
            loginSection.style.display = 'block';
        });
    }

    // Registro
    const formRegister = document.getElementById('form-register');
    if (formRegister) {
        formRegister.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usuario = document.getElementById('usuario-reg').value;
            const password = document.getElementById('password-reg').value;

            try {
                const response = await fetch('/api/register/', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({ usuario, password })
                });

                const textData = await response.text();
                
                if (!response.ok) {
                    // Muestra el error exacto que devuelve Django en pantalla
                    alert('Error del servidor Django:\n' + textData.substring(0, 300));
                    return;
                }

                const data = JSON.parse(textData);
                alert(data.message);
                if (data.success) {
                    registerSection.style.display = 'none';
                    loginSection.style.display = 'block';
                    formRegister.reset();
                }
            } catch (error) {
                console.error(error);
                alert('Fiebre de red o error al parsear JSON.');
            }
        });
    }

    // Login
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usuario = document.getElementById('usuario-login').value;
            const password = document.getElementById('password-login').value;

            try {
                const response = await fetch('/api/login/', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({ usuario, password })
                });

                const textData = await response.text();

                if (!response.ok) {
                    alert('Error del servidor Django:\n' + textData.substring(0, 300));
                    return;
                }

                const data = JSON.parse(textData);
                if (data.success) {
                    alert('¡Inicio de sesión exitoso!');
                    loginSection.style.display = 'none';
                    dashboardSection.style.display = 'block';
                    formLogin.reset();
                } else {
                    alert(data.message || 'Credenciales incorrectas');
                }
            } catch (error) {
                console.error(error);
                alert('Fiebre de red o error al parsear JSON.');
            }
        });
    }

    // Cerrar Sesión
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            dashboardSection.style.display = 'none';
            loginSection.style.display = 'block';
            document.getElementById('form-login').reset();
        });
    }
});