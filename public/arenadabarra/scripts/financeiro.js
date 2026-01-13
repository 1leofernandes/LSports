const API_BASE_URL = 'https://lsports-bufv.onrender.com';
// extrai tenant do path (ex: /cliente1/...) — usado pelo backend para identificar tenant
const _pathParts = window.location.pathname.split('/');
const tenant = _pathParts[1] || localStorage.getItem('tenant') || '';
let chartDiario, chartDiasSemana, chartMensal;
let currentData = {};
let periodoSelecionado = 3;
let quadraSelecionada = 'todas';

document.addEventListener('DOMContentLoaded', () => {
    M.AutoInit();
    M.FormSelect.init(document.querySelectorAll('select'));
    
    // DEBUG: Verificar tenant e token
    console.log('=== DEBUG INICIAL ===');
    console.log('URL atual:', window.location.href);
    console.log('Path parts:', _pathParts);
    console.log('Tenant extraído:', tenant);
    console.log('Token disponível:', !!localStorage.getItem('token'));
    console.log('Token:', localStorage.getItem('token'));
    console.log('=====================');
    
    setupFilterButtons();
    loadData(periodoSelecionado);
});

function setupFilterButtons() {
    // Filtro por período
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active-filter'));
            this.classList.add('active-filter');
            periodoSelecionado = parseInt(this.dataset.months);
            console.log('Período selecionado:', periodoSelecionado, 'meses');
            loadData(periodoSelecionado);
        });
    });
    
    // Filtro por quadra
    document.getElementById('quadra-filter').addEventListener('change', function() {
        quadraSelecionada = this.value;
        console.log('Quadra selecionada:', quadraSelecionada);
        updateMetrics();
        renderCharts();
    });
}

async function loadData(months) {
    try {
        console.log(`=== CARREGANDO DADOS (${months} meses) ===`);
        
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Usuário não autenticado. Faça login novamente.');
        }

        // DEBUG: Mostrar detalhes da requisição
        const url = `${API_BASE_URL}/relatorio-financeiro?periodo=${months}`;
        console.log('URL da requisição:', url);
        console.log('Tenant:', tenant);
        console.log('Token (primeiros 20 chars):', token.substring(0, 20) + '...');

        const response = await fetch(url, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'X-Tenant': tenant,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Status da resposta:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            let errorMsg = `Erro ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                console.error('Dados do erro:', errorData);
                errorMsg = errorData.error || errorData.message || errorMsg;
            } catch (e) {
                console.error('Não foi possível parsear erro como JSON');
            }
            throw new Error(errorMsg);
        }
        
        const data = await response.json();
        console.log('Dados recebidos do backend:', data);
        console.log('Total de meses com dados:', Object.keys(data.mensal || {}).length);
        console.log('Total de dias com dados:', Object.keys(data.diario || {}).length);
        console.log('Total agendamentos no período:', Object.values(data.mensal || {}).reduce((sum, m) => sum + (m.agendamentos || 0), 0));
        
        currentData = data;
        
        // Garantir estrutura dos dados
        currentData.mensal = currentData.mensal || {};
        currentData.diario = currentData.diario || {};
        currentData.por_dia_semana = currentData.por_dia_semana || Array(7).fill().map((_, i) => ({
            dia: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
            total: 0,
            agendamentos: 0,
            quadras: {}
        }));
        currentData.quadras = currentData.quadras || {};
        
        // Mostrar mensagem se não houver dados
        const totalAgendamentos = Object.values(currentData.mensal).reduce((sum, m) => sum + (m.agendamentos || 0), 0);
        if (totalAgendamentos === 0) {
            console.warn('Nenhum agendamento encontrado no período selecionado');
            M.toast({html: 'Nenhum agendamento encontrado no período selecionado', classes: 'orange'});
        }
        
        updateMetrics();
        renderCharts();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        console.error('Stack:', error.stack);
        
        let errorMessage = error.message;
        if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Erro de conexão com o servidor. Verifique sua internet.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
            errorMessage = 'Sessão expirada. Faça login novamente.';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
        
        M.toast({html: `Erro: ${errorMessage}`, classes: 'red', displayLength: 5000});
        
        // Resetar para estado vazio
        currentData = {
            mensal: {},
            diario: {},
            por_dia_semana: Array(7).fill().map((_, i) => ({
                dia: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
                total: 0,
                agendamentos: 0,
                quadras: {}
            })),
            quadras: {}
        };
        updateMetrics();
        renderCharts();
    }
}

function updateMetrics() {
    try {
        console.log('=== ATUALIZANDO MÉTRICAS ===');
        
        // Filtrar dados por quadra selecionada
        const filtrarPorQuadra = (dados) => {
            if (quadraSelecionada === 'todas') return dados;
            
            const filtrado = { ...dados };
            if (filtrado.quadras && filtrado.quadras[quadraSelecionada]) {
                filtrado.total = filtrado.quadras[quadraSelecionada].total || 0;
                filtrado.agendamentos = filtrado.quadras[quadraSelecionada].agendamentos || 0;
            } else {
                filtrado.total = 0;
                filtrado.agendamentos = 0;
            }
            return filtrado;
        };

        // Faturamento total
        const total = Object.values(currentData.mensal).reduce((sum, m) => {
            const mFiltrado = filtrarPorQuadra(m);
            return sum + (mFiltrado.total || 0);
        }, 0);
        document.getElementById('faturamento-total').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        console.log('Faturamento total:', total);
        
        // Total de agendamentos
        const agendamentos = Object.values(currentData.mensal).reduce((sum, m) => {
            const mFiltrado = filtrarPorQuadra(m);
            return sum + (mFiltrado.agendamentos || 0);
        }, 0);
        document.getElementById('total-agendamentos').textContent = agendamentos;
        console.log('Total agendamentos:', agendamentos);
        
        // Melhor dia (maior faturamento)
        const diasOrdenados = Object.entries(currentData.diario)
            .map(([dia, dados]) => ({
                dia,
                ...filtrarPorQuadra(dados)
            }))
            .sort((a, b) => (b.total || 0) - (a.total || 0));
        
        if (diasOrdenados.length > 0 && diasOrdenados[0].total > 0) {
            document.getElementById('melhor-dia').textContent = diasOrdenados[0].dia;
            document.getElementById('valor-melhor-dia').textContent = 
                `R$ ${diasOrdenados[0].total.toFixed(2).replace('.', ',')}`;
            console.log('Melhor dia:', diasOrdenados[0].dia, 'valor:', diasOrdenados[0].total);
        } else {
            document.getElementById('melhor-dia').textContent = '-';
            document.getElementById('valor-melhor-dia').textContent = 'Nenhum dado';
        }
        
        // Dia mais frequente
        const diasFrequentes = Object.entries(currentData.diario)
            .map(([dia, dados]) => ({
                dia,
                ...filtrarPorQuadra(dados)
            }))
            .sort((a, b) => (b.agendamentos || 0) - (a.agendamentos || 0));
        
        if (diasFrequentes.length > 0 && diasFrequentes[0].agendamentos > 0) {
            document.getElementById('dia-frequente').textContent = diasFrequentes[0].dia;
            document.getElementById('agendamentos-dia').textContent = 
                `${diasFrequentes[0].agendamentos} agendamentos`;
            console.log('Dia mais frequente:', diasFrequentes[0].dia, 'agendamentos:', diasFrequentes[0].agendamentos);
        } else {
            document.getElementById('dia-frequente').textContent = '-';
            document.getElementById('agendamentos-dia').textContent = 'Nenhum agendamento';
        }
        
        // Taxa de ocupação
        const diasNoPeriodo = periodoSelecionado * 30; // Aproximação
        const horasDisponiveis = 14 * diasNoPeriodo; // 14 horas por dia (7h-21h)
        const horasOcupadas = Object.values(currentData.mensal).reduce((sum, m) => {
            const mFiltrado = filtrarPorQuadra(m);
            return sum + ((mFiltrado.total || 0) / 50); // Cada R$50 = 1 hora
        }, 0);
        const taxaOcupacao = horasDisponiveis > 0 ? (horasOcupadas / horasDisponiveis * 100).toFixed(1) : 0;
        document.getElementById('taxa-ocupacao').textContent = `${taxaOcupacao}% de ocupação`;
        console.log('Taxa de ocupação:', taxaOcupacao, '%', 'horas ocupadas:', horasOcupadas, 'horas disponíveis:', horasDisponiveis);
        
        // Atualizar comparação mensal
        const meses = Object.keys(currentData.mensal).sort();
        if (meses.length > 1) {
            const mesAtual = meses[meses.length-1];
            const mesAnterior = meses[meses.length-2];
            const faturamentoAtual = filtrarPorQuadra(currentData.mensal[mesAtual]).total || 0;
            const faturamentoAnterior = filtrarPorQuadra(currentData.mensal[mesAnterior]).total || 0;
            
            const diferenca = faturamentoAnterior ? 
                ((faturamentoAtual - faturamentoAnterior) / faturamentoAnterior * 100) : 0;
            
            const comparativoElement = document.getElementById('comparativo-mensal');
            comparativoElement.textContent = diferenca >= 0 ? 
                `↑ ${Math.abs(diferenca).toFixed(1)}% em relação ao mês anterior` : 
                `↓ ${Math.abs(diferenca).toFixed(1)}% em relação ao mês anterior`;
            comparativoElement.className = diferenca >= 0 ? 'green-text' : 'red-text';
            
            console.log('Comparativo mensal:', diferenca, '%', 'atual:', faturamentoAtual, 'anterior:', faturamentoAnterior);
        } else if (meses.length === 1) {
            document.getElementById('comparativo-mensal').textContent = 'Apenas um mês de dados';
            document.getElementById('comparativo-mensal').className = 'grey-text';
        } else {
            document.getElementById('comparativo-mensal').textContent = 'Sem dados para comparar';
            document.getElementById('comparativo-mensal').className = 'grey-text';
        }
        
    } catch (error) {
        console.error('Erro ao atualizar métricas:', error);
    }
}

function renderCharts() {
    try {
        console.log('=== RENDERIZANDO GRÁFICOS ===');
        
        // Filtrar dados por quadra selecionada
        function filtrarPorQuadra(dados) {
            if (!dados) return { total: 0, agendamentos: 0 };
            
            if (quadraSelecionada === 'todas') return dados;
            
            const filtrado = { ...dados };
            if (filtrado.quadras && filtrado.quadras[quadraSelecionada]) {
                filtrado.total = filtrado.quadras[quadraSelecionada].total || 0;
                filtrado.agendamentos = filtrado.quadras[quadraSelecionada].agendamentos || 0;
            } else {
                filtrado.total = 0;
                filtrado.agendamentos = 0;
            }
            return filtrado;
        }

        // --- Gráfico Diário ---
        const diarioCtx = document.getElementById('graficoDiario').getContext('2d');
        const diarioLabels = Object.keys(currentData.diario).length > 0 ? 
            Object.keys(currentData.diario).sort((a, b) => {
                // Ordenar por data (dd/mm)
                const [diaA, mesA] = a.split('/');
                const [diaB, mesB] = b.split('/');
                return new Date(`2024-${mesA}-${diaA}`) - new Date(`2024-${mesB}-${diaB}`);
            }) : 
            ['Nenhum dado'];
        
        console.log('Dados diários:', diarioLabels.length, 'dias');
        
        if (chartDiario) chartDiario.destroy();
        chartDiario = new Chart(diarioCtx, {
            type: 'line',
            data: {
                labels: diarioLabels,
                datasets: [{
                    label: `Faturamento Diário (${quadraSelecionada === 'todas' ? 'Todas' : 'Quadra '+quadraSelecionada})`,
                    data: diarioLabels.map(d => filtrarPorQuadra(currentData.diario[d]).total || 0),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: '#2c3e50',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const agendamentos = filtrarPorQuadra(currentData.diario[diarioLabels[context.dataIndex]]).agendamentos || 0;
                                return `R$ ${context.raw.toFixed(2)} (${agendamentos} agend.)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 10 // Limitar número de labels no eixo X
                        }
                    }
                }
            }
        });

        // --- Gráfico Dias da Semana ---
        const diasSemanaCtx = document.getElementById('graficoDiasSemana').getContext('2d');
        if (chartDiasSemana) chartDiasSemana.destroy();
        
        const diasSemanaData = currentData.por_dia_semana || Array(7).fill().map((_, i) => ({
            dia: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
            total: 0,
            agendamentos: 0,
            quadras: {}
        }));
        
        console.log('Dados dias da semana:', diasSemanaData.map(d => d.total));
        
        chartDiasSemana = new Chart(diasSemanaCtx, {
            type: 'bar',
            data: {
                labels: diasSemanaData.map(d => d.dia),
                datasets: [{
                    label: `Faturamento (${quadraSelecionada === 'todas' ? 'Todas' : 'Quadra '+quadraSelecionada})`,
                    data: diasSemanaData.map(d => filtrarPorQuadra(d).total),
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.7)',
                        'rgba(155, 89, 182, 0.7)',
                        'rgba(46, 204, 113, 0.7)',
                        'rgba(241, 196, 15, 0.7)',
                        'rgba(230, 126, 34, 0.7)',
                        'rgba(231, 76, 60, 0.7)',
                        'rgba(149, 165, 166, 0.7)'
                    ],
                    borderColor: [
                        '#3498db',
                        '#9b59b6',
                        '#2ecc71',
                        '#f1c40f',
                        '#e67e22',
                        '#e74c3c',
                        '#95a5a6'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const dia = filtrarPorQuadra(diasSemanaData[context.dataIndex]);
                                return `R$ ${context.raw.toFixed(2)} (${dia.agendamentos} agend.)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });

        // --- Gráfico Mensal Comparativo ---
        const mensalCtx = document.getElementById('graficoMensal').getContext('2d');
        const meses = Object.keys(currentData.mensal || {}).sort();
        
        console.log('Meses com dados:', meses);
        
        if (chartMensal) chartMensal.destroy();
        chartMensal = new Chart(mensalCtx, {
            type: 'bar',
            data: {
                labels: meses.length > 0 ? 
                    meses.map(m => {
                        try {
                            const [ano, mes] = m.split('-');
                            return `${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][parseInt(mes)-1]}/${ano}`;
                        } catch {
                            return m;
                        }
                    }) : 
                    ['Nenhum dado'],
                datasets: [{
                    label: `Faturamento (${quadraSelecionada === 'todas' ? 'Todas' : 'Quadra '+quadraSelecionada})`,
                    data: meses.map(m => filtrarPorQuadra(currentData.mensal[m]).total || 0),
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: '#27ae60',
                    borderWidth: 1
                }, {
                    label: `Agendamentos (${quadraSelecionada === 'todas' ? 'Todas' : 'Quadra '+quadraSelecionada})`,
                    data: meses.map(m => filtrarPorQuadra(currentData.mensal[m]).agendamentos || 0),
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: '#2980b9',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Faturamento (R$)' },
                        ticks: { callback: value => 'R$ ' + value.toFixed(2) }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Agendamentos' },
                        grid: { drawOnChartArea: false },
                        beginAtZero: true
                    }
                }
            }
        });

        console.log('Gráficos renderizados com sucesso');
        
    } catch (error) {
        console.error('Erro ao renderizar gráficos:', error);
        M.toast({html: 'Erro ao exibir gráficos', classes: 'red'});
    }
}

// Função para testar conexão com backend
async function testarConexao() {
    try {
        const token = localStorage.getItem('token');
        console.log('=== TESTANDO CONEXÃO ===');
        
        // Teste 1: Verificar se o endpoint existe
        const response = await fetch(`${API_BASE_URL}/ping`);
        console.log('Teste ping:', response.ok ? 'OK' : 'FALHA');
        
        // Teste 2: Verificar se o token é válido
        if (token) {
            const userResponse = await fetch(`${API_BASE_URL}/user-info`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'X-Tenant': tenant
                }
            });
            console.log('Teste user-info:', userResponse.ok ? 'OK' : 'FALHA');
            if (userResponse.ok) {
                const userData = await userResponse.json();
                console.log('Dados do usuário:', userData);
            }
        }
        
        // Teste 3: Verificar histórico (outra rota que funciona)
        if (token) {
            const historicoResponse = await fetch(`${API_BASE_URL}/agendamentos/historico`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'X-Tenant': tenant
                }
            });
            console.log('Teste histórico:', historicoResponse.ok ? 'OK' : 'FALHA');
            if (historicoResponse.ok) {
                const historicoData = await historicoResponse.json();
                console.log('Total de agendamentos no histórico:', historicoData.length);
            }
        }
        
    } catch (error) {
        console.error('Erro no teste de conexão:', error);
    }
}

// Adicionar botão de teste (opcional - para debug)
function adicionarBotaoDebug() {
    const debugBtn = document.createElement('button');
    debugBtn.textContent = 'Debug Conexão';
    debugBtn.className = 'btn red';
    debugBtn.style.position = 'fixed';
    debugBtn.style.bottom = '20px';
    debugBtn.style.right = '20px';
    debugBtn.style.zIndex = '1000';
    debugBtn.onclick = testarConexao;
    document.body.appendChild(debugBtn);
}

// Inicializar botão de debug (opcional)
// document.addEventListener('DOMContentLoaded', () => {
//     adicionarBotaoDebug();
// });

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}