const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://lsports-bufv.onrender.com';

// extrai tenant do path (ex: /cliente1/...) — usado pelo backend para identificar tenant
const _pathParts = window.location.pathname.split('/');
const tenant = _pathParts[1] || localStorage.getItem('tenant') || '';

// Variáveis globais
let modoHistorico = false;
let todosAgendamentos = [];
let agendamentosFiltrados = [];

// Função para formatar data corrigindo fuso horário
function formatarData(dataString) {
    const data = new Date(dataString);
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString('pt-BR');
}

document.addEventListener('DOMContentLoaded', () => {
    M.AutoInit();
    validarUsuario();
    carregarAgendamentos();
    carregarBloqueios();
    configurarBuscaAgendamentos();
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

async function validarUsuario() {
    const token = localStorage.getItem('token');
    if (!token) {
        await showToast('Você não está logado. Redirecionando para o login...', { type: 'warning' });
        window.location.href = 'login.html';
        return;
    }
    try {
        const res = await fetch(`${API_BASE_URL}/user-info`, {
            headers: { Authorization: `Bearer ${token}`, 'X-Tenant': tenant }
        });
        if (!res.ok) throw new Error('Erro ao validar usuário.');
        const data = await res.json();
        if (data.role !== 'funcionario') {
            await showToast('Acesso negado. Somente funcionários podem acessar esta página.', { type: 'error' });
            window.location.href = 'login.html';
            return;
        }
    } catch (error) {
        console.error('Erro na autenticação:', error);
        await showToast('Erro na autenticação. Tente novamente.', { type: 'error' });
        window.location.href = 'login.html';
    }
}

function calcularValorFront(horaInicio, horaFim) {
    const [inicioH, inicioM] = horaInicio.split(':').map(Number);
    const [fimH, fimM] = horaFim.split(':').map(Number);
    
    const minutosTotais = ((fimH * 60 + fimM) - (inicioH * 60 + inicioM));
    const horasCheias = Math.floor(minutosTotais / 60);
    const meiasHoras = (minutosTotais % 60) / 30;
    return (horasCheias * 50) + (meiasHoras * 25);
}

// Função para carregar histórico completo
async function carregarHistoricoCompleto() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE_URL}/agendamentos/historico`, {
            headers: { Authorization: `Bearer ${token}`, 'X-Tenant': tenant }
        });
        
        if (!res.ok) throw new Error('Erro ao carregar histórico');
        
        const agendamentos = await res.json();
        todosAgendamentos = agendamentos;
        agendamentosFiltrados = [...agendamentos];
        
        // Atualizar interface
        document.getElementById('titulo-agendamentos').textContent = 'Histórico Completo de Agendamentos';
        document.getElementById('btn-historico').innerHTML = `
            <i class="material-icons left">calendar_today</i>Voltar para Recentes
        `;
        
        renderizarAgendamentos(agendamentos);
        modoHistorico = true;
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        M.toast({html: 'Erro ao carregar histórico', classes: 'red'});
    }
}

// Função para voltar aos agendamentos recentes
function voltarAgendamentosRecentes() {
    carregarAgendamentos();
    document.getElementById('titulo-agendamentos').textContent = 'Agendamentos Recentes';
    document.getElementById('btn-historico').innerHTML = `
        <i class="material-icons left">history</i>Histórico
    `;
    modoHistorico = false;
}

// Função para renderizar agendamentos - CORREÇÃO APLICADA
function renderizarAgendamentos(agendamentos) {
    const lista = document.getElementById('agendamentos-list');
    
    if (agendamentos.length) {
        lista.innerHTML = agendamentos.map(a => {
            // CORREÇÃO: Padronizar o status para minúsculas e remover espaços
            const status = a.status ? a.status.toLowerCase().trim() : 'nao-pago';
            const statusText = status === 'pago' ? 'Pago' : 'Não pago';
            const statusClass = status === 'pago' ? 'pago' : 'nao-pago';
            
            // Mapear métodos de pagamento
            const paymentMethods = {
                'cartao': 'Cartão',
                'dinheiro': 'Dinheiro',
                'pix': 'Pix'
            };
            const paymentText = paymentMethods[a.payment_method] || 'Não informado';
            
            // CORREÇÃO: Remover a verificação de data passada para pagamento
            // O botão deve aparecer para qualquer agendamento não pago, independente da data
            const hoje = new Date();
            const dataAgendamento = new Date(a.data_agendada);
            const isPassado = dataAgendamento < hoje;
            
            return `
                <div class="booking-item">
                    <div class="booking-details">
                        <strong>${a.nome_cliente}</strong> - ${a.telefone_cliente}
                    </div>
                    <div class="booking-details">
                        <i class="material-icons tiny">date_range</i> 
                        ${formatarData(a.data_agendada)}
                    </div>
                    <div class="booking-details">
                        <i class="material-icons tiny">access_time</i> 
                        ${a.hora_inicio} - ${a.hora_fim}
                    </div>
                    <div class="booking-details">
                        <i class="material-icons tiny">sports_soccer</i> 
                        Quadra ${a.quadra}
                    </div>
                    <div class="booking-details">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                        <span class="payment-method">(${paymentText})</span>
                    </div>
                    <div class="booking-details" style="margin-top: 10px;">
                        <span class="badge white-text">
                            R$ ${calcularValorFront(a.hora_inicio, a.hora_fim).toFixed(2).replace('.', ',')}
                        </span>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                        <!-- CORREÇÃO: Remover verificação de data passada para pagamento -->
                        ${status !== 'pago' ? `
                            <button onclick="marcarComoPago(${a.id})" class="btn btn-success waves-effect waves-light">
                                <i class="material-icons left">check</i>Confirmar Pagamento
                            </button>
                        ` : ''}
                        
                        <button onclick="excluirAgendamento(${a.id})" class="btn btn-danger waves-effect waves-light">
                            <i class="material-icons left">delete</i>Excluir
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        lista.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
    }
}

async function carregarAgendamentos() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE_URL}/agendamentos`, {
            headers: { Authorization: `Bearer ${token}`, 'X-Tenant': tenant }
        });
        if (!res.ok) throw new Error('Erro ao carregar agendamentos.');
        const agendamentos = await res.json();
        todosAgendamentos = agendamentos;
        agendamentosFiltrados = [...agendamentos];
        renderizarAgendamentos(agendamentos);
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        document.getElementById('agendamentos-list').innerHTML = 
            '<div class="card-panel red lighten-4">Erro ao carregar agendamentos.</div>';
    }
}

// Configurar busca de agendamentos
function configurarBuscaAgendamentos() {
    const buscaInput = document.getElementById('busca-agendamentos');
    
    buscaInput.addEventListener('input', function() {
        const termo = this.value.toLowerCase().trim();
        
        if (!termo) {
            agendamentosFiltrados = [...todosAgendamentos];
            renderizarAgendamentos(todosAgendamentos);
            return;
        }
        
        agendamentosFiltrados = todosAgendamentos.filter(a => {
            return (
                a.nome_cliente.toLowerCase().includes(termo) ||
                a.telefone_cliente.includes(termo) ||
                formatarData(a.data_agendada).includes(termo) ||
                a.hora_inicio.includes(termo) ||
                a.hora_fim.includes(termo) ||
                a.quadra.toString().includes(termo)
            );
        });
        
        renderizarAgendamentos(agendamentosFiltrados);
    });
    
    // Adicionar evento ao botão de histórico
    document.getElementById('btn-historico').addEventListener('click', () => {
        if (modoHistorico) {
            voltarAgendamentosRecentes();
        } else {
            carregarHistoricoCompleto();
        }
    });
}

async function marcarComoPago(id) {
    const token = localStorage.getItem('token');
    
    if (!confirm('Tem certeza que deseja marcar este agendamento como pago?')) return;
    
    try {
        const res = await fetch(`${API_BASE_URL}/agendamentos/${id}/marcar-pago`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tenant': tenant,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ status: 'pago' })
        });
        if (!res.ok) throw new Error('Erro ao marcar como pago.');
        const result = await res.json();
        M.toast({html: result.message, classes: 'green'});
        
        // Atualizar a lista
        if (modoHistorico) {
            carregarHistoricoCompleto();
        } else {
            carregarAgendamentos();
        }
    } catch (error) {
        console.error('Erro ao marcar como pago:', error);
        M.toast({html: 'Erro ao marcar como pago.', classes: 'red'});
    }
}

async function excluirAgendamento(id) {
    const token = localStorage.getItem('token');
    
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
    
    try {
        const res = await fetch(`${API_BASE_URL}/agendamentos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tenant': tenant,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if (!res.ok) throw new Error('Erro ao excluir agendamento.');
        const result = await res.json();
        M.toast({html: result.message, classes: 'green'});
        
        // Atualizar a lista
        if (modoHistorico) {
            carregarHistoricoCompleto();
        } else {
            carregarAgendamentos();
        }
    } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
        M.toast({html: 'Erro ao excluir agendamento.', classes: 'red'});
    }
}

async function bloquearDia() {
    const data = document.getElementById('data-bloqueio').value;
    const quadra = document.getElementById('quadra-bloqueio-normal').value || null;
    
    if (!data) {
        M.toast({html: 'Selecione uma data!', classes: 'red'});
        return;
    }
    
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE_URL}/bloquear-dia`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-Tenant': tenant,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ data, quadra })
        });
        const result = await res.json();
        M.toast({html: result.message, classes: 'green'});
        carregarBloqueios();
    } catch (error) {
        console.error('Erro ao bloquear dia:', error);
        M.toast({html: 'Erro ao bloquear dia.', classes: 'red'});
    }
}

async function bloquearHorario() {
    const data = document.getElementById('data-bloqueio').value;
    const hora_inicio = document.getElementById('hora-inicio').value;
    const hora_fim = document.getElementById('hora-fim').value;
    const quadra = document.getElementById('quadra-bloqueio-normal').value || null;
    
    if (!data || !hora_inicio || !hora_fim) {
        M.toast({html: 'Preencha todos os campos!', classes: 'red'});
        return;
    }
    
    if (hora_inicio >= hora_fim) {
        M.toast({html: 'Hora fim deve ser após hora início!', classes: 'red'});
        return;
    }
    
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE_URL}/bloquear-horario`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-Tenant': tenant,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ data, hora_inicio, hora_fim, quadra })
        });
        const result = await res.json();
        M.toast({html: result.message, classes: 'green'});
        carregarBloqueios();
    } catch (error) {
        console.error('Erro ao bloquear horário:', error);
        M.toast({html: 'Erro ao bloquear horário.', classes: 'red'});
    }
}

async function carregarBloqueios() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/bloqueios`, {
            headers: { Authorization: `Bearer ${token}`, 'X-Tenant': tenant }
        });
        
        if (!res.ok) throw new Error('Erro ao carregar bloqueios.');
        
        const bloqueios = await res.json();
        const lista = document.getElementById('bloqueios-list');
        
        if (bloqueios.length) {
            lista.innerHTML = bloqueios.map(b => `
                <div class="booking-item">
                    <div class="booking-details">
                        <i class="material-icons tiny">event</i> 
                        ${formatarData(b.data)}
                    </div>
                    <div class="booking-details">
                        <i class="material-icons tiny">schedule</i> 
                        ${b.hora_inicio.slice(0,5)} - ${b.hora_fim.slice(0,5)}
                    </div>
                    <div style="margin-top: 10px;">
                        <button onclick="removerBloqueio(${b.id})" class="btn btn-danger waves-effect waves-light btn-small">
                            <i class="material-icons left">delete</i>Remover
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            lista.innerHTML = '<p>Nenhum horário bloqueado.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar bloqueios:', error);
        document.getElementById('bloqueios-list').innerHTML = 
            '<div class="card-panel red lighten-4">Erro ao carregar bloqueios.</div>';
    }
}

async function removerBloqueio(id) {
    const token = localStorage.getItem('token');
    
    if (!confirm('Tem certeza que deseja remover este bloqueio?')) return;
    
    try {
        const res = await fetch(`${API_BASE_URL}/bloqueios/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tenant': tenant,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        const result = await res.json();
        M.toast({html: result.message, classes: 'green'});
        carregarBloqueios();
    } catch (error) {
        console.error('Erro ao remover bloqueio:', error);
        M.toast({html: 'Erro ao remover bloqueio.', classes: 'red'});
    }
}

// Inicializar sidenav (menu mobile)
document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(elems);
});