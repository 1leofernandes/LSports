const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://lsports.onrender.com';

// extrai tenant do path (ex: /cliente1/...) — usado pelo backend para identificar tenant
const _pathParts = window.location.pathname.split('/');
const tenant = _pathParts[1] || localStorage.getItem('tenant') || '';

// Funções básicas
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    const nomeUsuario = localStorage.getItem('nome');
    if (nomeUsuario) {
        document.getElementById('nomeUsuario').textContent = nomeUsuario;
    }

    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
    }

    // Event listeners
    document.getElementById('data').addEventListener('change', atualizarHorariosDisponiveis);
    document.getElementById('quadra').addEventListener('change', atualizarHorariosDisponiveis);
    document.getElementById('btn-meus-agendamentos').addEventListener('click', toggleAgendamentos);
    document.getElementById('agendamentoForm').addEventListener('submit', enviarAgendamento);

    document.querySelectorAll('.quadra-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove classe 'active' de todos os botões
            document.querySelectorAll('.quadra-btn').forEach(b => b.classList.remove('active'));

            // Adiciona classe 'active' no botão clicado
            btn.classList.add('active');

            // Atualiza o valor oculto
            const quadraSelecionada = btn.getAttribute('data-quadra');
            document.getElementById('quadraSelecionada').value = quadraSelecionada;

            // Atualiza os horários
            atualizarHorariosDisponiveis();
        });
    });

    
    carregarMeusAgendamentos();
});

// Funções de agendamento
async function carregarHorariosOcupados(data, quadra) {
    try {
        const response = await fetch(`${API_BASE_URL}/horarios-ocupados?data=${encodeURIComponent(data)}&quadra=${encodeURIComponent(quadra)}`, {
            headers: { 'X-Tenant': tenant }
        });
        if (!response.ok) throw new Error('Erro ao carregar horários');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        return { horariosOcupados: [], reservas: [] };
    }
}

async function carregarHorariosBloqueados(data, quadra) {
    try {
        const response = await fetch(`${API_BASE_URL}/horarios-bloqueados?data=${encodeURIComponent(data)}&quadra=${encodeURIComponent(quadra)}`, {
            headers: { 'X-Tenant': tenant }
        });
        if (!response.ok) throw new Error('Erro ao carregar horários bloqueados');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        return { bloqueiosRecorrentes: [], horariosBloqueados: [] };
    }
}

function gerarHorarios(diaDaSemana) {
    let inicio, fim;

    // getDay(): 0 = domingo, 1 = segunda, ..., 6 = sábado
    if (diaDaSemana >= 1 && diaDaSemana <= 5) { // Segunda a sexta
        inicio = 17;
        fim = 24;
    } else if (diaDaSemana === 6) { // Sábado
        inicio = 10;
        fim = 24;
    } else if (diaDaSemana === 0) { // Domingo (corrigido)
        inicio = 10;
        fim = 23;
    } else {
        return [];
    }

    const horarios = [];
    const startMin = inicio * 60;
    const endMin = fim * 60;

    for (let m = startMin; m <= endMin; m += 30) {
        const h = Math.floor(m / 60);
        const mm = m % 60;
        if (h === fim && mm > 0) break;
        horarios.push(
            `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
        );
    }

    return horarios;
}

async function atualizarHorariosDisponiveis() {
    const dataSelecionada = document.getElementById('data').value;
    const quadraSelecionada = document.getElementById('quadraSelecionada').value;
    const timeGrid = document.getElementById('timeGrid');
    
    if (!dataSelecionada || !quadraSelecionada) return;

    const quadraNum = parseInt(quadraSelecionada);
    if (isNaN(quadraNum)) return;

    timeGrid.innerHTML = '<div class="time-loader"><i class="bi bi-arrow-repeat"></i></div>';
    
    try {
        const [ano, mes, dia] = dataSelecionada.split('-');
        const data = new Date(ano, mes - 1, dia);
        const diaDaSemana = data.getDay();

        const [ocupados, bloqueados] = await Promise.all([
            carregarHorariosOcupados(dataSelecionada, quadraNum),
            carregarHorariosBloqueados(dataSelecionada, quadraNum)
        ]);

        // Normaliza todas as reservas
        const reservas = (ocupados.reservas || []).map(r => ({
            hora_inicio: r.hora_inicio.slice(0, 5),
            hora_fim:    r.hora_fim.slice(0, 5)
        }));

        // Normaliza bloqueios
        const bloqueiosEspecificos = (bloqueados.bloqueiosEspecificos || []).map(b => ({
            hora_inicio: b.hora_inicio.slice(0,5),
            hora_fim: b.hora_fim.slice(0,5)
        }));
        const bloqueiosRecorrentes = (bloqueados.bloqueiosRecorrentes || []).map(b => ({
            hora_inicio: b.hora_inicio.slice(0,5),
            hora_fim: b.hora_fim.slice(0,5)
        }));
        const todosBloqueios = [...bloqueiosEspecificos, ...bloqueiosRecorrentes];

        const horarios = gerarHorarios(diaDaSemana);
        const horariosOcupados = quadraSelecionada === "1"
            ? ocupados.horariosOcupadosQuadra1 || []
            : ocupados.horariosOcupadosQuadra2 || [];

        // Horários finais de eventos
        const horariosFinaisBloqueios = todosBloqueios.map(b => b.hora_fim);
        const horariosFinaisAgendamentos = reservas.map(r => r.hora_fim);
        const todosHorariosFinais = [
            ...horariosFinaisAgendamentos,
            ...horariosFinaisBloqueios
        ];

        // Horários iniciais de eventos que devem ser ocultados
        const horariosInicioEventos = [
            ...reservas.map(r => r.hora_inicio),
            ...todosBloqueios.map(b => b.hora_inicio)
        ];

        // Identificar horários que são finais mas são seguidos por outros eventos
        const horariosFinaisComEventoSeguinte = [];
        todosHorariosFinais.forEach(horaFinal => {
            const horaFinalIndex = horarios.indexOf(horaFinal);
            if (horaFinalIndex !== -1 && horaFinalIndex < horarios.length - 1) {
                const proximaHora = horarios[horaFinalIndex + 1];
                const temEventoComecando = horariosInicioEventos.includes(proximaHora);
                if (temEventoComecando) {
                    horariosFinaisComEventoSeguinte.push(horaFinal);
                }
            }
        });

        const horariosDisponiveis = horarios.filter(hora => {
            // 1) Remove horários ocupados que não são finais de eventos
            const estaOcupado = horariosOcupados.includes(hora) &&
                                !todosHorariosFinais.includes(hora);
            if (estaOcupado) {
                return false;
            }

            // 2) Remove horários dentro de reservas
            const estaNoMeioReserva = reservas.some(r =>
                hora > r.hora_inicio && hora < r.hora_fim
            );
            if (estaNoMeioReserva) {
                return false;
            }

            // 3) Remove horários dentro de bloqueios
            const estaNoMeioBloqueio = todosBloqueios.some(b => 
                hora > b.hora_inicio && hora < b.hora_fim
            );
            if (estaNoMeioBloqueio) {
                return false;
            }

            // 4) Remove horários que são início de eventos
            const ehInicioEvento = horariosInicioEventos.includes(hora);
            if (ehInicioEvento) {
                return false;
            }

            // 5) Remove horários que são finais seguidos por outros eventos
            const ehFinalComEventoSeguinte = horariosFinaisComEventoSeguinte.includes(hora);
            if (ehFinalComEventoSeguinte) {
                return false;
            }

            return true;
        });

        renderizarTimeGrid(horariosDisponiveis);
    } catch (error) {
        timeGrid.innerHTML = '<div class="time-error"><i class="bi bi-exclamation-triangle"></i> Erro ao carregar</div>';
        console.error(error);
    }
}

function renderizarTimeGrid(horarios) {
    const timeGrid = document.getElementById('timeGrid');
    const horaInicioSelect = document.getElementById('horaInicio');
    
    timeGrid.innerHTML = '';
    horaInicioSelect.innerHTML = '<option value="">Selecione...</option>';
    
    horarios.forEach(hora => {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = hora;
        timeSlot.addEventListener('click', () => {
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            timeSlot.classList.add('selected');
            horaInicioSelect.value = hora;
            atualizarHorariosFinais(hora);
        });
        timeGrid.appendChild(timeSlot);
        
        const option = document.createElement('option');
        option.value = hora;
        option.textContent = hora;
        horaInicioSelect.appendChild(option);
    });
}

async function atualizarHorariosFinais(horaInicio) {
    const dataSelecionada = document.getElementById('data').value;
    const quadraSelecionada = document.getElementById('quadraSelecionada').value;
    const timeGridFim = document.getElementById('timeGridFim');
    const horaFimSelect = document.getElementById('horaFim');
    
    if (!dataSelecionada || !horaInicio) return;

    timeGridFim.innerHTML = '<div class="time-loader"><i class="bi bi-arrow-repeat"></i></div>';
    horaFimSelect.innerHTML = '<option value="">Carregando...</option>';
    horaFimSelect.disabled = true;

    try {
        const [ano, mes, dia] = dataSelecionada.split('-');
        const data = new Date(ano, mes - 1, dia);
        const diaDaSemana = data.getDay();
        const [ocupados, bloqueados] = await Promise.all([
            carregarHorariosOcupados(dataSelecionada, quadraSelecionada),
            carregarHorariosBloqueados(dataSelecionada, quadraSelecionada)
        ]);

        const horarios = gerarHorarios(diaDaSemana);
        const inicioIndex = horarios.indexOf(horaInicio);
        if (inicioIndex === -1) {
            throw new Error('Horário inicial não encontrado na lista de horários do dia');
        }

        // Junta todos os bloqueios específicos e recorrentes
        const todosBloqueios = [
            ...(bloqueados.bloqueiosEspecificos || []),
            ...(bloqueados.bloqueiosRecorrentes || [])
        ];

        // Coletar todos os eventos (reservas e bloqueios)
        const eventos = [];
        
        // Adicionar reservas
        if (ocupados.reservas) {
            ocupados.reservas.forEach(r => {
                eventos.push({
                    tipo: 'reserva',
                    inicio: r.hora_inicio.slice(0,5),
                    fim: r.hora_fim.slice(0,5)
                });
            });
        }

        // Adicionar bloqueios
        todosBloqueios.forEach(b => {
            eventos.push({
                tipo: 'bloqueio',
                inicio: b.hora_inicio.slice(0,5),
                fim: b.hora_fim.slice(0,5)
            });
        });

        // Encontrar o próximo evento (menor horário de início que é maior que horaInicio)
        const eventosFuturos = eventos.filter(evento => evento.inicio > horaInicio);
        eventosFuturos.sort((a, b) => a.inicio.localeCompare(b.inicio));
        const proximoEvento = eventosFuturos[0]; // o primeiro evento após horaInicio

        // Se existir um próximo evento, então o horário final máximo permitido é o início desse evento
        const horarioFinalMaximo = proximoEvento ? proximoEvento.inicio : null;

        // Filtra, a partir de “horaInicio”, todos os slots possíveis de término:
        const horariosDisponiveis = horarios
            .slice(inicioIndex + 1)
            .filter(hora => {
                // 1) Se houver um horarioFinalMaximo e a hora for maior que ele, remover
                if (horarioFinalMaximo && hora > horarioFinalMaximo) {
                    return false;
                }

                // 2) Se estiver no meio de qualquer bloqueio => remover
                const estaEmBloqueio = todosBloqueios.some(b => {
                    const inicioBloqueio = b.hora_inicio.slice(0,5);
                    const fimBloqueio = b.hora_fim.slice(0,5);
                    return hora > inicioBloqueio && hora < fimBloqueio;
                });
                if (estaEmBloqueio) {
                    return false;
                }

                // 3) Se estiver no meio de um agendamento já existente => remover
                const emReserva = (ocupados.reservas || []).some(r => {
                    const inicioReserva = r.hora_inicio.slice(0,5);
                    const fimReserva = r.hora_fim.slice(0,5);
                    return hora > inicioReserva && hora < fimReserva;
                });
                if (emReserva) {
                    return false;
                }

                // 4) Permitir horários finais mesmo que coincidam com início de eventos
                return true;
            });

        timeGridFim.innerHTML = '';
        horaFimSelect.innerHTML = horariosDisponiveis.length 
            ? '<option value="">Selecione</option>'
            : '<option value="">Nenhum horário disponível</option>';
        
        horariosDisponiveis.forEach(hora => {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = hora;
            timeSlot.addEventListener('click', () => {
                document.querySelectorAll('#timeGridFim .time-slot').forEach(s => s.classList.remove('selected'));
                timeSlot.classList.add('selected');
                horaFimSelect.value = hora;
            });
            timeGridFim.appendChild(timeSlot);
            
            const option = document.createElement('option');
            option.value = hora;
            option.textContent = hora;
            horaFimSelect.appendChild(option);
        });

        horaFimSelect.disabled = false;
    } catch (error) {
        timeGridFim.innerHTML = '<div class="time-error"><i class="bi bi-exclamation-triangle"></i> Erro ao carregar</div>';
        horaFimSelect.innerHTML = '<option value="">Erro ao carregar</option>';
        console.error(error);
    }
}

// Gerenciamento de agendamentos
async function carregarMeusAgendamentos() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const conteudo = document.getElementById('conteudo-agendamentos');
    conteudo.innerHTML = '<div class="text-center"><i class="bi bi-arrow-repeat"></i> Carregando...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/meus-agendamentos`, {
            headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant': tenant }
        });

        if (!response.ok) throw new Error('Erro ao carregar');
        
        const agendamentos = await response.json();
        exibirAgendamentos(agendamentos);
    } catch (error) {
        conteudo.innerHTML = '<div class="text-danger"><i class="bi bi-exclamation-triangle"></i> Erro ao carregar</div>';
        console.error(error);
    }
}

function exibirAgendamentos(agendamentos) {
    const conteudo = document.getElementById('conteudo-agendamentos');
    
    if (!agendamentos || agendamentos.length === 0) {
        conteudo.innerHTML = '<div class="text-center text-muted">Nenhum agendamento encontrado</div>';
        return;
    }

    conteudo.innerHTML = '';
    agendamentos.forEach(agendamento => {
        const card = document.createElement('div');
        card.className = 'booking-card mb-3';
        
        const dataFormatada = formatarData(agendamento.data_agendada.split('T')[0]);
        const valor = calcularValor(agendamento.hora_inicio, agendamento.hora_fim);
        
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="quadra-badge">Quadra ${agendamento.quadra}</span>
                <small class="text-muted">${dataFormatada}</small>
            </div>
            <div class="booking-time">
                <i class="bi bi-clock"></i>
                ${agendamento.hora_inicio} - ${agendamento.hora_fim}
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2">
                <span><i class="bi bi-cash-coin"></i> R$ ${valor.toFixed(2)}</span>
                <button class="btn btn-sm btn-danger" onclick="cancelarAgendamento(${agendamento.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        conteudo.appendChild(card);
    });
}

function calcularValor(horaInicio, horaFim) {
    const [inicioH, inicioM] = horaInicio.split(':').map(Number);
    const [fimH, fimM] = horaFim.split(':').map(Number);
    
    const minutosTotais = (fimH * 60 + fimM) - (inicioH * 60 + inicioM);
    const horasCheias = Math.floor(minutosTotais / 60);
    const meiasHoras = (minutosTotais % 60) / 30;
    
    return (horasCheias * 50) + (meiasHoras * 25);
}

async function cancelarAgendamento(id) {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/cancelar-agendamento/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant': tenant }
        });

        if (!response.ok) throw new Error('Erro ao cancelar');
        
        Toastify({
            text: "Agendamento cancelado com sucesso!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "center",
            backgroundColor: "var(--vermelho)",
        }).showToast();
        
        carregarMeusAgendamentos();
    } catch (error) {
        console.error(error);
        alert('Erro ao cancelar agendamento');
    }
}

function toggleAgendamentos() {
    const lista = document.getElementById('lista-agendamentos');
    lista.style.display = lista.style.display === 'none' ? 'block' : 'none';
    
    if (lista.style.display === 'block') {
        carregarMeusAgendamentos();
    }
}



// Envio de agendamento
// Envio de agendamento - FUNÇÃO CORRIGIDA
async function enviarAgendamento(event) {
    event.preventDefault();
    
    const form = document.getElementById('agendamentoForm');
    const btn = form.querySelector('button[type="submit"]');
    const originalBtnText = btn.innerHTML;
    
    // Validação dos campos obrigatórios
    const data = document.getElementById('data').value;
    const quadra = document.getElementById('quadraSelecionada').value;
    const formaPagamento = document.getElementById('paymentMethod').value; // Novo campo capturado
    
    // Obter os horários selecionados
    const timeSlotInicioSelected = document.querySelector('#timeGrid .time-slot.selected');
    const timeSlotFimSelected = document.querySelector('#timeGridFim .time-slot.selected');
    
    const horaInicio = timeSlotInicioSelected ? timeSlotInicioSelected.textContent : document.getElementById('horaInicio').value;
    const horaFim = timeSlotFimSelected ? timeSlotFimSelected.textContent : document.getElementById('horaFim').value;

    if (!data || !quadra || !horaInicio || !horaFim || !formaPagamento) { // Adicionada validação
        Toastify({
            text: "Preencha todos os campos obrigatórios, incluindo a forma de pagamento!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "center",
            backgroundColor: "var(--vermelho)",
        }).showToast();
        return;
    }

    // Dados do formulário
    const usuario_id = localStorage.getItem('usuario_id');
    const valor = calcularValor(horaInicio, horaFim);

    // Loading state
    btn.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Processando...';
    btn.disabled = true;

    try {
        const token = localStorage.getItem('token');
        const verifResponse = await fetch(`${API_BASE_URL}/verificar-disponibilidade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-Tenant': tenant
            },
            body: JSON.stringify({
                data_agendada: data,
                hora_inicio: horaInicio,
                hora_fim: horaFim,
                quadra: quadra
            })
        });

        const verifResult = await verifResponse.json();
        
        if (!verifResult.disponivel) {
            let motivo = "";
            if (verifResult.conflitos.agendamentos) motivo += "Conflito com agendamento existente. ";
            if (verifResult.conflitos.bloqueios) motivo += "Conflito com bloqueio específico. ";
            if (verifResult.conflitos.recorrentes) motivo += "Há uma aula ou um bloqueio recorrente no intervalo do horário selecionado.";
            
            throw new Error(`Horário indisponível. ${motivo}`);
        }

        // Mostrar confirmação (atualizada para mostrar a forma de pagamento)
        const confirmado = await mostrarConfirmacao({
            quadra,
            data_agendada: data,
            hora_inicio: horaInicio,
            hora_fim: horaFim,
            valor,
            formaPagamento // Adicionado ao objeto de confirmação
        });

        if (!confirmado) {
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
            return;
        }

        // Enviar para API com forma de pagamento
        const response = await fetch(`${API_BASE_URL}/agendar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-Tenant': tenant
            },
            body: JSON.stringify({
                usuario_id,
                data_agendada: data,
                hora_inicio: horaInicio,
                hora_fim: horaFim,
                quadra,
                valor,
                payment_method: formaPagamento // Novo campo enviado
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Erro ao agendar');
        }

        // Sucesso
        Toastify({
            text: "Agendamento realizado com sucesso!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "center",
            backgroundColor: "#28a745",
        }).showToast();

        // Resetar formulário
        form.reset();
        document.getElementById('timeGrid').innerHTML = '';
        document.getElementById('horaInicio').innerHTML = '';
        document.getElementById('timeGridFim').innerHTML = '';
        document.getElementById('horaFim').innerHTML = '';
        carregarMeusAgendamentos();
    } catch (error) {
        console.error(error);
        Toastify({
            text: error.message || "Erro ao realizar agendamento",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "center",
            backgroundColor: "var(--vermelho)",
        }).showToast();
    } finally {
        btn.innerHTML = originalBtnText;
        btn.disabled = false;
    }
}

function mostrarConfirmacao(dados) {
    return new Promise((resolve) => {
        // Primeiro criamos um container para o toast
        const toastContainer = document.createElement('div');
        toastContainer.innerHTML = `
            <div class="toast-card">
                <i class="bi bi-calendar2-check toast-icon"></i>
                <h5>Confirmar reserva na Quadra ${dados.quadra}?</h5>
                <div class="toast-details">
                    <p><i class="bi bi-clock"></i> ${dados.hora_inicio} - ${dados.hora_fim}</p>
                    <p><i class="bi bi-calendar-date"></i> ${formatarData(dados.data_agendada)}</p>
                    <p><i class="bi bi-credit-card"></i> ${dados.formaPagamento}</p>
                    <div class="toast-price">
                        <span class="toast-text-price">Total:</span>
                        <span class="price">R$ ${dados.valor.toFixed(2)}</span>
                    </div>
                </div>
                <div class="toast-actions">
                    <button class="btn-confirm">
                        <i class="bi bi-check-circle"></i> Confirmar
                    </button>
                    <button class="btn-cancel">
                        <i class="bi bi-x-circle"></i> Cancelar
                    </button>
                </div>
            </div>
        `;

        // Configuração do Toastify
        const toast = Toastify({
            node: toastContainer,
            duration: -1,
            gravity: "center",
            position: "center",
            stopOnFocus: true,
            style: {
                background: 'none',
                padding: '0',
                margin: '0',
                width: 'auto',
                maxWidth: '95vw',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: 'none'
                
            }
        }).showToast();

        // Adicionamos os event listeners após um pequeno delay
        setTimeout(() => {
            const confirmBtn = document.querySelector('.btn-confirm');
            const cancelBtn = document.querySelector('.btn-cancel');
            
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    toast.hideToast();
                    resolve(true);
                });
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    toast.hideToast();
                    resolve(false);
                });
            }
        }, 50);
    });
}

// Animação de spin
const style = document.createElement('style');
style.textContent = `
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { 
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);