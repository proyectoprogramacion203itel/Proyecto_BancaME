document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const dashboardSection = document.getElementById('dashboard-section');

    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    let saldoActual = 1250450.00;

    // Cambiar vistas Login / Registro
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
                    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    body: JSON.stringify({ usuario, password })
                });
                const textData = await response.text();
                if (!response.ok) { alert('Error: ' + textData); return; }
                const data = JSON.parse(textData);
                alert(data.message);
                if (data.success) {
                    registerSection.style.display = 'none';
                    loginSection.style.display = 'block';
                    formRegister.reset();
                }
            } catch (error) {
                alert('Error de conexión.');
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
                    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    body: JSON.stringify({ usuario, password })
                });
                const textData = await response.text();
                if (!response.ok) { alert('Error: ' + textData); return; }
                const data = JSON.parse(textData);
                if (data.success) {
                    loginSection.style.display = 'none';
                    dashboardSection.style.display = 'block';
                    formLogin.reset();
                } else {
                    alert(data.message || 'Credenciales incorrectas');
                }
            } catch (error) {
                alert('Error de conexión.');
            }
        });
    }

    // --- INTERACTIVIDAD INTERNA DENTRO DE LA PÁGINA ---
    const dynamicPanel = document.getElementById('dynamic-panel');
    const saldoMontoEl = document.getElementById('saldo-monto');

    function actualizarSaldoUI() {
        saldoMontoEl.textContent = saldoActual.toLocaleString('es-AR', { minimumFractionDigits: 2 });
    }

    // Botón Transferir
    document.getElementById('btn-transferir').addEventListener('click', () => {
        dynamicPanel.style.display = 'block';
        dynamicPanel.innerHTML = `
            <h3>Nueva Transferencia</h3>
            <form id="form-transferencia">
                <label>CBU / CVU / Alias de Destino:</label>
                <input type="text" id="trans-cbu" placeholder="ej. bancame.wallet" required>
                
                <label>Monto a transferir (ARS):</label>
                <input type="number" id="trans-monto" placeholder="0.00" min="1" required>
                
                <button type="submit" style="background-color: #00e676;">Confirmar Transferencia</button>
                <button type="button" id="btn-cerrar-panel" style="background-color: #ccc; color: #333;">Cancelar</button>
            </form>
        `;

        document.getElementById('form-transferencia').addEventListener('submit', (ev) => {
            ev.preventDefault();
            const monto = parseFloat(document.getElementById('trans-monto').value);
            const destino = document.getElementById('trans-cbu').value;

            if (monto > saldoActual) {
                alert('Fondos insuficientes para realizar esta operación.');
                return;
            }

            saldoActual -= monto;
            actualizarSaldoUI();
            alert(`¡Transferencia exitosa!\nSe enviaron $${monto.toLocaleString('es-AR')} a ${destino}.`);
            dynamicPanel.style.display = 'none';
        });

        document.getElementById('btn-cerrar-panel').addEventListener('click', () => {
            dynamicPanel.style.display = 'none';
        });
    });

    // Botón Servicios
    document.getElementById('btn-servicios').addEventListener('click', () => {
        dynamicPanel.style.display = 'block';
        dynamicPanel.innerHTML = `
            <h3>Pago de Servicios</h3>
            <div class="service-item">
                <span>Edesur (Luz) - $15.400</span>
                <button class="btn-pagar-serv" data-monto="15400" data-nombre="Edesur">Pagar</button>
            </div>
            <div class="service-item">
                <span>Metrogas (Gas) - $8.200</span>
                <button class="btn-pagar-serv" data-monto="8200" data-nombre="Metrogas">Pagar</button>
            </div>
            <div class="service-item">
                <span>AySA (Agua) - $5.100</span>
                <button class="btn-pagar-serv" data-monto="5100" data-nombre="AySA">Pagar</button>
            </div>
            <button type="button" id="btn-cerrar-panel" style="background-color: #ccc; color: #333; width:100%; margin-top:10px;">Cerrar</button>
        `;

        document.querySelectorAll('.btn-pagar-serv').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const monto = parseFloat(e.target.getAttribute('data-monto'));
                const nombre = e.target.getAttribute('data-nombre');

                if (monto > saldoActual) {
                    alert('Saldo insuficiente para pagar este servicio.');
                    return;
                }

                saldoActual -= monto;
                actualizarSaldoUI();
                alert(`¡Pago realizado con éxito!\nHas abonado ${nombre} por $${monto.toLocaleString('es-AR')}.`);
                e.target.parentElement.style.opacity = '0.5';
                e.target.disabled = true;
                e.target.textContent = 'Pagado';
            });
        });

        document.getElementById('btn-cerrar-panel').addEventListener('click', () => {
            dynamicPanel.style.display = 'none';
        });
    });

    // Botón Tarjetas
    document.getElementById('btn-tarjetas').addEventListener('click', () => {
        dynamicPanel.style.display = 'block';
        dynamicPanel.innerHTML = `
            <h3>Mis Tarjetas Asociadas</h3>
            <p style="background: #fff; padding: 10px; border-radius: 4px; border: 1px solid #ddd; margin-bottom: 8px;">
                💳 <strong>Débito Visa:</strong> **** 4589 <span style="color: green; float: right;">Activa</span>
            </p>
            <p style="background: #fff; padding: 10px; border-radius: 4px; border: 1px solid #ddd; margin-bottom: 12px;">
                💳 <strong>Crédito Mastercard:</strong> **** 8812 <span style="color: green; float: right;">Activa</span>
            </p>
            <button type="button" id="btn-cerrar-panel" style="background-color: #ccc; color: #333; width:100%;">Cerrar</button>
        `;

        document.getElementById('btn-cerrar-panel').addEventListener('click', () => {
            dynamicPanel.style.display = 'none';
        });
    });

    // Cerrar Sesión
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            dashboardSection.style.display = 'none';
            loginSection.style.display = 'block';
            dynamicPanel.style.display = 'none';
            document.getElementById('form-login').reset();
        });
    }
});