const API_BASE_URL = 'https://lsports.onrender.com';
let chartDiario, chartDiasSemana, chartMensal;
let currentData = {};
let periodoSelecionado = 3;
let quadraSelecionada = 'todas';

document.addEventListener('DOMContentLoaded', () => {
    M.AutoInit();
    M.FormSelect.init(document.querySelectorAll('select'));
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
            loadData(periodoSelecionado);
        });
    });
    
    // Filtro por quadra
    document.getElementById('quadra-filter').addEventListener('change', function() {
        quadraSelecionada = this.value;
        updateMetrics();
        renderCharts();
    });
}

async function loadData(months) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Usuário não autenticado');
        }

        const response = await fetch(`${API_BASE_URL}/relatorio-financeiro?periodo=${months}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }
        
        currentData = await response.json();
        
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
        
        updateMetrics();
        renderCharts();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        M.toast({html: `Erro: ${error.message}`, classes: 'red'});
        
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
    }
}

function updateMetrics() {
    try {
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
        
        // Total de agendamentos
        const agendamentos = Object.values(currentData.mensal).reduce((sum, m) => {
            const mFiltrado = filtrarPorQuadra(m);
            return sum + (mFiltrado.agendamentos || 0);
        }, 0);
        document.getElementById('total-agendamentos').textContent = agendamentos;
        
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
        } else {
            document.getElementById('dia-frequente').textContent = '-';
            document.getElementById('agendamentos-dia').textContent = 'Nenhum agendamento';
        }
        
        // Taxa de ocupação
        const horasDisponiveis = 14 * 30 * periodoSelecionado;
        const horasOcupadas = Object.values(currentData.mensal).reduce((sum, m) => {
            const mFiltrado = filtrarPorQuadra(m);
            return sum + ((mFiltrado.total || 0) / 50);
        }, 0);
        const taxaOcupacao = horasDisponiveis > 0 ? (horasOcupadas / horasDisponiveis * 100).toFixed(1) : 0;
        document.getElementById('taxa-ocupacao').textContent = `${taxaOcupacao}% de ocupação`;
        
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
        }
    } catch (error) {
        console.error('Erro ao atualizar métricas:', error);
    }
}

function renderCharts() {
    try {
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

        // --- Gráfico Diário ---
        const diarioCtx = document.getElementById('graficoDiario').getContext('2d');
        const diarioLabels = Object.keys(currentData.diario).length > 0 ? 
            Object.keys(currentData.diario) : 
            ['Nenhum dado'];
        
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
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Erro ao renderizar gráficos:', error);
        M.toast({html: 'Erro ao exibir gráficos', classes: 'red'});
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}