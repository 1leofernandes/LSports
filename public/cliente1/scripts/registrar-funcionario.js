const senhaInput = document.getElementById("password");
const toggleSenha = document.getElementById("toggleSenha");

toggleSenha.addEventListener("click", function () {
    if (senhaInput.type === "password") {
        senhaInput.type = "text";
        toggleSenha.classList.remove("fa-eye");
        toggleSenha.classList.add("fa-eye-slash");
    } else {
        senhaInput.type = "password";
        toggleSenha.classList.remove("fa-eye-slash");
        toggleSenha.classList.add("fa-eye");
    }
});

const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://lsports.onrender.com';
// extrai tenant do path (ex: /cliente1/...) — usado pelo backend para identificar tenant
const _pathParts = window.location.pathname.split('/');
const tenant = _pathParts[1] || localStorage.getItem('tenant') || '';
function logout() {
    window.location.href = 'admin.html';
}
const adminEmails = ['leonardoff24@gmail.com', 'BONIEQUES2020@GMAIL.COM', 'bonieques2020@gmail.com', 'guyhenryck06@gmail.com'];
const form = document.getElementById('registrarFuncionarioForm');

document.addEventListener('DOMContentLoaded', () => {
    // Setup modal instances first (so validarUsuario can use modal-based messages early)
    const usuariosModalEl = document.getElementById('usuariosModal');
    if (usuariosModalEl && window.bootstrap && typeof window.bootstrap.Modal === 'function') window.usuariosModal = new bootstrap.Modal(usuariosModalEl);
    const confirmModalEl = document.getElementById('confirmModal');
    if (confirmModalEl && window.bootstrap && typeof window.bootstrap.Modal === 'function') window.confirmModal = new bootstrap.Modal(confirmModalEl);
    const messageModalEl = document.getElementById('messageModal');
    if (messageModalEl && window.bootstrap && typeof window.bootstrap.Modal === 'function') window.messageModal = new bootstrap.Modal(messageModalEl);
    // After modals are ready, proceed with validation
    validarUsuario();
    // Hook 'Ver usuários' button
    const btnVerUsuarios = document.getElementById('btnVerUsuarios');
    if (btnVerUsuarios) btnVerUsuarios.addEventListener('click', abrirListaUsuarios);
    // Modal instances
    // (modals were initialized above)
    // hook confirm buttons
    const confirmOk = document.getElementById('confirmOk');
    const confirmCancel = document.getElementById('confirmCancel');
    if (confirmOk) confirmOk.addEventListener('click', () => {
        if (window.__confirmResolve) window.__confirmResolve(true);
        const el = document.getElementById('confirmModal');
        const inst = (window.bootstrap && window.bootstrap.Modal) ? window.bootstrap.Modal.getInstance(el) : window.confirmModal;
        if (inst && typeof inst.hide === 'function') inst.hide();
    });
    if (confirmCancel) confirmCancel.addEventListener('click', () => {
        if (window.__confirmResolve) window.__confirmResolve(false);
        const el = document.getElementById('confirmModal');
        const inst = (window.bootstrap && window.bootstrap.Modal) ? window.bootstrap.Modal.getInstance(el) : window.confirmModal;
        if (inst && typeof inst.hide === 'function') inst.hide();
    });
    // message modal close: just hide
    // search debounce
    const usuariosSearch = document.getElementById('usuariosSearch');
    if (usuariosSearch) {
        let timer;
        usuariosSearch.addEventListener('input', (e) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                renderUsuariosFilter(e.target.value);
            }, 250);
        });
    }
});

// global cache and render helper
let usuariosCache = [];

async function validarUsuario() {
    const token = localStorage.getItem('token');
    if (!token) {
        await showMessage('Você não está logado. Redirecionando para o login...');
        window.location.href = 'login.html';
        return;
    }
    try {
        // Decodifica o token JWT manualmente para obter o role / id
            const payloadUser = JSON.parse(atob(token.split('.')[1])); // Decodifica o payload do token
        const payloadRole = payload.role; // role do token
            const userId = payloadUser.id;

        // Verifica se o role do usuário é admin
        if (payloadRole !== 'admin') {
            await showMessage('Acesso negado. Somente administradores podem acessar esta página.');
            window.location.href = 'login.html';
            return;
        }
    } catch (error) {
        console.error('Erro na autenticação:', error);
        await showMessage('Erro na autenticação. Tente novamente.');
        window.location.href = 'login.html';
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const senha = document.getElementById('password').value;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/registrar-funcionario`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-Tenant': tenant
            },
            body: JSON.stringify({ nome, telefone, email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            await showMessage('Funcionário registrado com sucesso!');
            window.location.href = 'admin.html';
        } else {
            await showMessage(data.mensagem || 'Erro ao registrar funcionário');
        }
    } catch (error) {
        console.error('Erro ao registrar funcionário:', error);
    }
});

async function abrirListaUsuarios() {
    const modalEl = document.getElementById('usuariosModal');
    const inst = (window.bootstrap && window.bootstrap.Modal) ? window.bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl) : window.usuariosModal;
    if (!inst) return;
    await carregarUsuarios();
    if (typeof inst.show === 'function') inst.show();
}

async function carregarUsuarios() {
    const token = localStorage.getItem('token');
    const listEl = document.getElementById('usuarios-list');
    if (!listEl) return;
    listEl.innerHTML = '<p>Carregando usuários...</p>';

    try {
        const res = await fetch(`${API_BASE_URL}/admin/usuarios`, {
            headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant': tenant }
        });
        if (!res.ok) throw new Error('Erro ao carregar usuários.');
            const usuarios = await res.json();
            usuariosCache = usuarios; // cache for filtering
            const payloadUser = JSON.parse(atob(token.split('.')[1]));
            const currentUserId = payloadUser.id;
        if (!Array.isArray(usuarios) || usuarios.length === 0) {
            listEl.innerHTML = '<p>Nenhum usuário encontrado.</p>';
            return;
        }

        listEl.innerHTML = usuarios.map(u => {
                const isSelf = (currentUserId == u.id);
            let actionBtn = '';
            if (!isSelf) {
                if (u.role === 'cliente') {
                    actionBtn = `<button class="btn btn-sm btn-primary me-1" onclick="alterarRole(${u.id}, 'funcionario')">Promover para funcionário</button>`;
                } else if (u.role === 'funcionario') {
                    actionBtn = `<button class="btn btn-sm btn-warning me-1" onclick="alterarRole(${u.id}, 'cliente')">Rebaixar para cliente</button>`;
                } else { // admin or other - no actions
                    actionBtn = `<span class="badge bg-danger">Admin</span>`;
                }
            } else {
                actionBtn = `<span class="badge bg-secondary">Você</span>`;
            }
            return `
                <div class="card mb-2 p-2 d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${u.nome}</strong><br/>
                        <small>${u.email}</small>
                    </div>
                    <div>
                        ${actionBtn}
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Erro ao carregar usuarios:', err);
        listEl.innerHTML = '<p>Erro ao carregar usuários.</p>';
    }
}


    function renderUsuariosFilter(searchTerm) {
        const listEl = document.getElementById('usuarios-list');
        if (!listEl) return;
        const q = (searchTerm || '').toLowerCase().trim();
        const filtered = usuariosCache.filter(u => {
            if (!q) return true;
            return (u.nome && u.nome.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q));
        });
        listEl.innerHTML = '';
        if (filtered.length === 0) {
            listEl.innerHTML = '<p>Nenhum usuário encontrado.</p>';
            return;
        }
        // event delegation container
        const token = localStorage.getItem('token');
        const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).id : null;
        filtered.forEach(u => {
            const isSelf = (currentUserId == u.id);
            const card = document.createElement('div');
            card.className = 'card mb-2 p-2 d-flex justify-content-between align-items-center';

            const left = document.createElement('div');
            const strong = document.createElement('strong');
            strong.textContent = u.nome;
            const br = document.createElement('br');
            const small = document.createElement('small');
            small.textContent = u.email;
            left.appendChild(strong);
            left.appendChild(br);
            left.appendChild(small);

            const right = document.createElement('div');
            if (!isSelf) {
                if (u.role === 'cliente') {
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-sm btn-primary me-1 action-btn';
                    btn.dataset.userId = u.id;
                    btn.dataset.action = 'promote';
                    btn.textContent = 'Promover para funcionário';
                    right.appendChild(btn);
                } else if (u.role === 'funcionario') {
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-sm btn-warning me-1 action-btn';
                    btn.dataset.userId = u.id;
                    btn.dataset.action = 'demote';
                    btn.textContent = 'Rebaixar para cliente';
                    right.appendChild(btn);
                } else {
                    const span = document.createElement('span');
                    span.className = 'badge bg-danger';
                    span.textContent = 'Admin';
                    right.appendChild(span);
                }
            } else {
                const span = document.createElement('span');
                span.className = 'badge bg-secondary';
                span.textContent = 'Você';
                right.appendChild(span);
            }

            card.appendChild(left);
            card.appendChild(right);
            listEl.appendChild(card);
        });
        // attach event handler via delegation
        const usuariosListDom = document.getElementById('usuarios-list');
        usuariosListDom.removeEventListener('click', usuariosListClickHandler);
        usuariosListDom.addEventListener('click', usuariosListClickHandler);
    }

    function usuariosListClickHandler(ev) {
        const btn = ev.target.closest('.action-btn');
        if (!btn) return;
        const id = btn.dataset.userId;
        const action = btn.dataset.action;
        if (!id || !action) return;
        if (action === 'promote') alterarRole(parseInt(id, 10), 'funcionario');
        else if (action === 'demote') alterarRole(parseInt(id, 10), 'cliente');
    }
// Expose function to global scope so onclick in generated HTML can call it
window.alterarRole = async function(id, newRole) {
    const action = newRole === 'funcionario' ? 'promover' : 'rebaixar';
    if (!(await showConfirm(`Deseja realmente ${action} este usuário para ${newRole === 'funcionario' ? 'funcionário' : 'cliente'}?`))) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE_URL}/admin/usuarios/${id}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Tenant': tenant },
            body: JSON.stringify({ role: newRole })
        });
        const data = await res.json();
        if (res.ok) {
            await showMessage(data.message || 'Role atualizada com sucesso');
            await carregarUsuarios();
        } else {
            await showMessage(data.message || 'Erro ao atualizar role');
        }
    } catch (err) {
        console.error('Erro ao alterar role do usuário:', err);
        await showMessage('Erro ao alterar role do usuário');
    }
}

// showConfirm: returns Promise<boolean>
function showConfirm(message) {
    return new Promise((resolve) => {
        if (!window.confirmModal) {
            // fallback
            const res = window.confirm(message);
            return resolve(res);
        }
        const body = document.getElementById('confirmModalBody');
        if (body) body.textContent = message;
        window.__confirmResolve = (v) => { window.__confirmResolve = null; resolve(v); };
        const el = document.getElementById('confirmModal');
        const inst = (window.bootstrap && window.bootstrap.Modal) ? window.bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el) : window.confirmModal;
        if (inst && typeof inst.show === 'function') inst.show();
    });
}

// showMessage: returns Promise<void> when modal gets closed
function showMessage(message) {
    // Prefer to use toast-based non-blocking UI; fallback to modal or native alert
    return showToast(message);
}

// showToast: returns Promise that resolves once the toast is hidden
function showToast(message, options = {}) {
    return new Promise((resolve) => {
        const container = document.getElementById('toastContainer');
        if (!container || !(window.bootstrap && window.bootstrap.Toast)) {
            // fallback to modal or native alert
            if (window.messageModal) {
                // use modal as fallback
                const body = document.getElementById('messageModalBody');
                if (body) body.textContent = message;
                const el = document.getElementById('messageModal');
                const instModal = (window.bootstrap && window.bootstrap.Modal) ? window.bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el) : window.messageModal;
                const handler = () => resolve();
                el.addEventListener('hidden.bs.modal', handler, { once: true });
                instModal.show();
                return;
            }
            window.alert(message);
            return resolve();
        }

        // Build toast element
        const toastEl = document.createElement('div');
        toastEl.className = 'toast align-items-center text-white bg-primary border-0';
        toastEl.role = 'alert';
        toastEl.ariaLive = 'assertive';
        toastEl.ariaAtomic = 'true';
        toastEl.style.minWidth = '200px';
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        container.appendChild(toastEl);
        const toast = new bootstrap.Toast(toastEl, { autohide: true, delay: options.delay || 4000 });
        // Resolve when hidden
        toastEl.addEventListener('hidden.bs.toast', () => {
            container.removeChild(toastEl);
            resolve();
        }, { once: true });
        toast.show();
    });
}