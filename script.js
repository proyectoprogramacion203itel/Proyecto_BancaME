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

    // Proceso de Registro (API Django)
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
                alert('Error de conexión con el servidor.');
            }
        });
    }

    // Proceso de Login (API Django)
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
                alert('Error de conexión con el servidor.');
            }
        });
    }

    // --- INTERACTIVIDAD Y FUNCIONALIDADES DEL DASHBOARD ---
    const dynamicPanel = document.getElementById('dynamic-panel');
    const saldoMontoEl = document.getElementById('saldo-monto');

    function actualizarSaldoUI() {
        saldoMontoEl.textContent = saldoActual.toLocaleString('es-AR', { minimumFractionDigits: 2 });
    }

    function mostrarToast(mensaje) {
        const toast = document.getElementById('toast-notification');
        if (toast) {
            toast.textContent = mensaje;
            toast.className = 'toast show';
            setTimeout(() => { toast.className = toast.className.replace('toast show', 'toast'); }, 2800);
        }
    }

    function agregarMovimiento(titulo, monto, esPositivo) {
        const list = document.getElementById('transactions-list');
        const item = document.createElement('div');
        item.className = 'transaction-item';
        
        const ahora = new Date();
        const horaStr = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        item.innerHTML = `
            <div class="tx-left">
                <div class="tx-icon ${esPositivo ? 'incoming' : 'outgoing'}">${esPositivo ? '↓' : '↑'}</div>
                <div class="tx-details">
                    <span class="tx-title">${titulo}</span>
                    <span class="tx-date">Hoy, ${horaStr}</span>
                </div>
            </div>
            <span class="tx-amount ${esPositivo ? 'positive' : 'negative'}">${esPositivo ? '+' : '-'}$ ${monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        `;
        list.prepend(item);
    }

    // Copiar CBU al portapapeles
    const btnCopyCbu = document.getElementById('btn-copy-cbu');
    if (btnCopyCbu) {
        btnCopyCbu.addEventListener('click', () => {
            const cbuLimpio = 'ES9121000456781234567890';
            navigator.clipboard.writeText(cbuLimpio).then(() => {
                mostrarToast('¡CBU copiado al portapapeles!');
            }).catch(() => {
                mostrarToast('CBU: ES9121000456781234567890');
            });
        });
    }

    // 1. Botón Transferir
    const btnTransferir = document.getElementById('btn-transferir');
    if (btnTransferir) {
        btnTransferir.addEventListener('click', () => {
            dynamicPanel.style.display = 'block';
            dynamicPanel.innerHTML = `
                <h4>Nueva Transferencia</h4>
                <form id="form-transferencia">
                    <div class="input-group">
                        <label>CBU / CVU / Alias de Destino:</label>
                        <input type="text" id="trans-cbu" placeholder="ej. bancame.wallet" required>
                    </div>
                    <div class="input-group">
                        <label>Monto a transferir (ARS):</label>
                        <input type="number" id="trans-monto" placeholder="0.00" min="1" required>
                    </div>
                    <button type="submit" class="btn-primary">Confirmar Transferencia</button>
                    <button type="button" id="btn-cerrar-panel" class="btn-secondary">Cancelar</button>
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
                agregarMovimiento(`Transferencia a ${destino}`, monto, false);
                mostrarToast(`Transferencia de $${monto.toLocaleString('es-AR')} realizada`);
                dynamicPanel.style.display = 'none';
            });

            document.getElementById('btn-cerrar-panel').addEventListener('click', () => {
                dynamicPanel.style.display = 'none';
            });
        });
    }

    // 2. Botón Servicios
    const btnServicios = document.getElementById('btn-servicios');
    if (btnServicios) {
        btnServicios.addEventListener('click', () => {
            dynamicPanel.style.display = 'block';
            dynamicPanel.innerHTML = `
                <h4>Pago de Servicios</h4>
                <div class="service-row">
                    <span>Edesur (Luz) - $15.400</span>
                    <button class="btn-pay-small" data-monto="15400" data-nombre="Edesur">Pagar</button>
                </div>
                <div class="service-row">
                    <span>Metrogas (Gas) - $8.200</span>
                    <button class="btn-pay-small" data-monto="8200" data-nombre="Metrogas">Pagar</button>
                </div>
                <div class="service-row">
                    <span>AySA (Agua) - $5.100</span>
                    <button class="btn-pay-small" data-monto="5100" data-nombre="AySA">Pagar</button>
                </div>
                <button type="button" id="btn-cerrar-panel" class="btn-secondary">Cerrar</button>
            `;

            document.querySelectorAll('.btn-pay-small').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const monto = parseFloat(e.target.getAttribute('data-monto'));
                    const nombre = e.target.getAttribute('data-nombre');

                    if (monto > saldoActual) {
                        alert('Saldo insuficiente para pagar este servicio.');
                        return;
                    }

                    saldoActual -= monto;
                    actualizarSaldoUI();
                    agregarMovimiento(`Pago de ${nombre}`, monto, false);
                    mostrarToast(`Pago de ${nombre} exitoso`);
                    e.target.parentElement.style.opacity = '0.5';
                    e.target.disabled = true;
                    e.target.textContent = 'Pagado';
                });
            });

            document.getElementById('btn-cerrar-panel').addEventListener('click', () => {
                dynamicPanel.style.display = 'none';
            });
        });
    }

    // 3. Botón Tarjetas
    const btnTarjetas = document.getElementById('btn-tarjetas');
    if (btnTarjetas) {
        btnTarjetas.addEventListener('click', () => {
            dynamicPanel.style.display = 'block';
            dynamicPanel.innerHTML = `
                <h4>Mis Tarjetas Asociadas</h4>
                <div class="card-item">
                    <span>💳 <strong>Débito Visa:</strong> **** 4589</span>
                    <span style="color: #059669; font-weight:600; font-size:11px;">Activa</span>
                </div>
                <div class="card-item">
                    <span>💳 <strong>Crédito Mastercard:</strong> **** 8812</span>
                    <span style="color: #059669; font-weight:600; font-size:11px;">Activa</span>
                </div>
                <button type="button" id="btn-cerrar-panel" class="btn-secondary">Cerrar</button>
            `;

            document.getElementById('btn-cerrar-panel').addEventListener('click', () => {
                dynamicPanel.style.display = 'none';
            });
        });
    }

    // 4. Botón Plazo Fijo
    const btnPlazoFijo = document.getElementById('btn-plazo-fijo');
    if (btnPlazoFijo) {
        btnPlazoFijo.addEventListener('click', () => {
            dynamicPanel.style.display = 'block';
            dynamicPanel.innerHTML = `
                <h4>Simulador de Plazo Fijo (30 días)</h4>
                <form id="form-plazo">
                    <div class="input-group">
                        <label>Monto a invertir (ARS):</label>
                        <input type="number" id="pf-monto" placeholder="0.00" min="1000" required>
                    </div>
                    <p style="font-size: 12px; color: #64748b; margin-bottom: 10px;">Tasa Nominal Anual (TNA): <strong>42%</strong></p>
                    <button type="submit" class="btn-primary">Constituir Plazo Fijo</button>
                    <button type="button" id="btn-cerrar-panel" class="btn-secondary">Cancelar</button>
                </form>
            `;

            document.getElementById('form-plazo').addEventListener('submit', (ev) => {
                ev.preventDefault();
                const monto = parseFloat(document.getElementById('pf-monto').value);

                if (monto > saldoActual) {
                    alert('No tienes saldo suficiente para esta inversión.');
                    return;
                }

                const interesEstimado = (monto * 0.42 * 30) / 365;
                saldoActual -= monto;
                actualizarSaldoUI();
                agregarMovimiento('Constitución Plazo Fijo', monto, false);
                mostrarToast(`Plazo Fijo constituido por $${monto.toLocaleString('es-AR')}`);
                dynamicPanel.style.display = 'none';
            });

            document.getElementById('btn-cerrar-panel').addEventListener('click', () => {
                dynamicPanel.style.display = 'none';
            });
        });
    }

    // 5. Botón Conversor USD
    const btnConversor = document.getElementById('btn-conversor');
    if (btnConversor) {
        btnConversor.addEventListener('click', () => {
            dynamicPanel.style.display = 'block';
            dynamicPanel.innerHTML = `
                <h4>Conversor de Divisas (ARS a USD)</h4>
                <div class="input-group">
                    <label>Monto en Pesos (ARS):</label>
                    <input type="number" id="conv-ars" placeholder="Ej. 115000">
                </div>
                <p id="resultado-conversor" style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 10px 0; text-align: center;">Equivalente: $0.00 USD</p>
                <button type="button" id="btn-cerrar-panel" class="btn-secondary">Cerrar</button>
            `;

            const cotizacionDolar = 1150.00;
            document.getElementById('conv-ars').addEventListener('input', (e) => {
                const ars = parseFloat(e.target.value) || 0;
                const usd = ars / cotizacionDolar;
                document.getElementById('resultado-conversor').textContent = `Equivalente: $${usd.toFixed(2)} USD (Ref: $${cotizacionDolar})`;
            });

            document.getElementById('btn-cerrar-panel').addEventListener('click', () => {
                dynamicPanel.style.display = 'none';
            });
        });
    }

    // 6. Botón Préstamos
    const btnPrestamos = document.getElementById('btn-prestamos');
    if (btnPrestamos) {
        btnPrestamos.addEventListener('click', () => {
            dynamicPanel.style.display = 'block';
            dynamicPanel.innerHTML = `
                <h4>Simulador de Préstamo Personal</h4>
                <form id="form-prestamo">
                    <div class="input-group">
                        <label>Monto solicitado (ARS):</label>
                        <input type="number" id="prest-monto" placeholder="Ej. 500000" min="10000" required>
                    </div>
                    <div class="input-group">
                        <label>Cuotas:</label>
                        <select id="prest-cuotas">
                            <option value="3">3 cuotas</option>
                            <option value="6">6 cuotas</option>
                            <option value="12">12 cuotas</option>
                        </select>
                    </div>
                    <p id="resultado-prestamo" style="font-size: 13px; color: #0f172a; margin: 10px 0; font-weight: 600; text-align: center;"></p>
                    <button type="submit" class="btn-primary">Solicitar Préstamo</button>
                    <button type="button" id="btn-cerrar-panel" class="btn-secondary">Cancelar</button>
                </form>
            `;

            const calcularCuota = () => {
                const m = parseFloat(document.getElementById('prest-monto').value) || 0;
                const c = parseInt(document.getElementById('prest-cuotas').value);
                const totalConInteres = m * (1 + (0.05 * c));
                const valorCuota = totalConInteres / c;
                const resEl = document.getElementById('resultado-prestamo');
                if (m > 0) {
                    resEl.textContent = `Cuota mensual estimada: $${valorCuota.toLocaleString('es-AR', { maximumFractionDigits: 2 })} (${c} cuotas)`;
                } else {
                    resEl.textContent = '';
                }
            };

            document.getElementById('prest-monto').addEventListener('input', calcularCuota);
            document.getElementById('prest-cuotas').addEventListener('change', calcularCuota);

            document.getElementById('form-prestamo').addEventListener('submit', (ev) => {
                ev.preventDefault();
                const monto = parseFloat(document.getElementById('prest-monto').value);
                saldoActual += monto;
                actualizarSaldoUI();
                agregarMovimiento('Préstamo Acreditado', monto, true);
                mostrarToast(`Préstamo de $${monto.toLocaleString('es-AR')} acreditado`);
                dynamicPanel.style.display = 'none';
            });

            document.getElementById('btn-cerrar-panel').addEventListener('click', () => {
                dynamicPanel.style.display = 'none';
            });
        });
    }

    // --- CERRAR SESIÓN FUNCIONAL ---
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            dashboardSection.style.display = 'none';
            loginSection.style.display = 'flex';
            dynamicPanel.style.display = 'none';
            
            const formLoginEl = document.getElementById('form-login');
            if (formLoginEl) formLoginEl.reset();
        });
    }
});