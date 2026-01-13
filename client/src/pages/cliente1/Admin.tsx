import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getTenant, ensureCss, showToast } from '../../utils/common';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState<any[]>([]);
  const [bloqueios, setBloqueios] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [modoHistorico, setModoHistorico] = useState(false);
  const [dataBloqueio, setDataBloqueio] = useState('');
  const [quadraBloqueio, setQuadraBloqueio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [nomeBloqueio, setNomeBloqueio] = useState('');
  const [diaSemana, setDiaSemana] = useState('');
  const [horaInicioBloqueioRec, setHoraInicioBloqueioRec] = useState('');
  const [horaFimBloqueioRec, setHoraFimBloqueioRec] = useState('');
  const [quadraBloqueioRec, setQuadraBloqueioRec] = useState('');
  const [buscaTermo, setBuscaTermo] = useState('');

  useEffect(() => {
    ensureCss('https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css');
    ensureCss('https://fonts.googleapis.com/icon?family=Material+Icons');
    ensureCss('/cliente1/styles/admin.css');

    if (!localStorage.getItem('token')) {
      navigate('/cliente1/login');
      return;
    }

    validarUsuario();
    carregarAgendamentos();
    carregarBloqueios();
    carregarFuncionarios();
  }, [navigate]);

  const validarUsuario = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Você não está logado. Redirecionando para o login...', 'error');
      navigate('/cliente1/login');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') {
        showToast('Acesso negado. Somente administradores podem acessar esta página.', 'error');
        navigate('/cliente1/login');
      }
    } catch {
      showToast('Erro na autenticação. Tente novamente.', 'error');
      navigate('/cliente1/login');
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const calcularValorFront = (horaInicio: string, horaFim: string) => {
    const [inicioH, inicioM] = horaInicio.split(':').map(Number);
    const [fimH, fimM] = horaFim.split(':').map(Number);
    const minutosTotais = ((fimH * 60 + fimM) - (inicioH * 60 + inicioM));
    const horasCheias = Math.floor(minutosTotais / 60);
    const meiasHoras = (minutosTotais % 60) / 30;
    return (horasCheias * 50) + (meiasHoras * 25);
  };

  const carregarAgendamentos = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/agendamentos`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Tenant': getTenant() }
      });
      if (!res.ok) throw new Error('Erro ao carregar agendamentos.');
      const data = await res.json();
      setAgendamentos(data);
      setAgendamentosFiltrados(data);
    } catch (error: any) {
      showToast('Erro ao carregar agendamentos.', 'error');
    }
  };

  const carregarHistoricoCompleto = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/agendamentos/historico`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Tenant': getTenant() }
      });
      if (!res.ok) throw new Error('Erro ao carregar histórico');
      const data = await res.json();
      setAgendamentos(data);
      setAgendamentosFiltrados(data);
      setModoHistorico(true);
    } catch {
      showToast('Erro ao carregar histórico', 'error');
    }
  };

  const voltarAgendamentosRecentes = () => {
    carregarAgendamentos();
    setModoHistorico(false);
  };

  const filtrarAgendamentos = (termo: string) => {
    setBuscaTermo(termo);
    if (!termo.trim()) {
      setAgendamentosFiltrados(agendamentos);
      return;
    }
    const termoLower = termo.toLowerCase();
    const filtrados = agendamentos.filter(a =>
      a.nome_cliente?.toLowerCase().includes(termoLower) ||
      a.telefone_cliente?.includes(termoLower) ||
      formatarData(a.data_agendada).includes(termoLower) ||
      a.hora_inicio?.includes(termoLower) ||
      a.hora_fim?.includes(termoLower) ||
      a.quadra?.toString().includes(termoLower)
    );
    setAgendamentosFiltrados(filtrados);
  };

  const carregarBloqueios = async () => {
    const token = localStorage.getItem('token');
    try {
      const [bloqueiosRes, recurrentesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/bloqueios`, {
          headers: { Authorization: `Bearer ${token}`, 'X-Tenant': getTenant() }
        }),
        fetch(`${API_BASE_URL}/bloqueios-recorrentes`, {
          headers: { Authorization: `Bearer ${token}`, 'X-Tenant': getTenant() }
        })
      ]);

      if (!bloqueiosRes.ok || !recurrentesRes.ok) throw new Error('Erro ao carregar bloqueios');

      const normais = await bloqueiosRes.json();
      const recorrentes = await recurrentesRes.json();
      setBloqueios([...normais, ...recorrentes]);
    } catch {
      showToast('Erro ao carregar bloqueios.', 'error');
    }
  };

  const carregarFuncionarios = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/funcionarios`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Tenant': getTenant() }
      });
      if (!res.ok) throw new Error('Erro ao carregar funcionários');
      const data = await res.json();
      setFuncionarios(data);
    } catch {
      showToast('Erro ao carregar funcionários.', 'error');
    }
  };

  const bloquearDia = async () => {
    if (!dataBloqueio) {
      showToast('Selecione uma data!', 'error');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/bloquear-dia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'X-Tenant': getTenant() },
        body: JSON.stringify({ data: dataBloqueio, quadra: quadraBloqueio || null })
      });
      const result = await res.json();
      showToast(result.message, 'success');
      setDataBloqueio('');
      carregarBloqueios();
    } catch {
      showToast('Erro ao bloquear dia.', 'error');
    }
  };

  const bloquearHorario = async () => {
    if (!dataBloqueio || !horaInicio || !horaFim) {
      showToast('Preencha todos os campos!', 'error');
      return;
    }
    if (horaInicio >= horaFim) {
      showToast('Hora fim deve ser após hora início!', 'error');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/bloquear-horario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'X-Tenant': getTenant() },
        body: JSON.stringify({ data: dataBloqueio, hora_inicio: horaInicio, hora_fim: horaFim, quadra: quadraBloqueio || null })
      });
      const result = await res.json();
      showToast(result.message, 'success');
      carregarBloqueios();
    } catch {
      showToast('Erro ao bloquear horário.', 'error');
    }
  };

  const bloquearHorarioRecorrente = async () => {
    if (!nomeBloqueio.trim()) {
      showToast('Informe um nome para o bloqueio!', 'error');
      return;
    }
    if (!diaSemana || !horaInicioBloqueioRec || !horaFimBloqueioRec) {
      showToast('Preencha todos os campos obrigatórios!', 'error');
      return;
    }
    if (horaInicioBloqueioRec >= horaFimBloqueioRec) {
      showToast('Hora fim deve ser após hora início!', 'error');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/bloquear-horario-recorrente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant': getTenant()
        },
        body: JSON.stringify({
          nome: nomeBloqueio,
          dia_semana: diaSemana,
          hora_inicio: horaInicioBloqueioRec,
          hora_fim: horaFimBloqueioRec,
          quadra: quadraBloqueioRec || null
        })
      });
      const result = await res.json();
      if (res.ok) {
        showToast('Horário recorrente bloqueado com sucesso!', 'success');
        setNomeBloqueio('');
        setDiaSemana('');
        setHoraInicioBloqueioRec('');
        setHoraFimBloqueioRec('');
        setQuadraBloqueioRec('');
        carregarBloqueios();
      }
    } catch {
      showToast('Erro ao bloquear horário recorrente', 'error');
    }
  };

  const marcarComoPago = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja marcar este agendamento como pago?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/agendamentos/${id}/marcar-pago`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'X-Tenant': getTenant(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pago' })
      });
      const result = await res.json();
      showToast(result.message, 'success');
      carregarAgendamentos();
    } catch {
      showToast('Erro ao marcar como pago.', 'error');
    }
  };

  const excluirAgendamento = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/agendamentos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'X-Tenant': getTenant() }
      });
      const result = await res.json();
      showToast(result.message, 'success');
      if (modoHistorico) {
        carregarHistoricoCompleto();
      } else {
        carregarAgendamentos();
      }
    } catch {
      showToast('Erro ao excluir agendamento.', 'error');
    }
  };

  const removerBloqueio = async (id: number, isRecorrente: boolean) => {
    if (!window.confirm('Tem certeza que deseja remover este bloqueio?')) return;
    const token = localStorage.getItem('token');
    try {
      const endpoint = isRecorrente ? 'bloqueios-recorrentes' : 'bloqueios';
      const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant': getTenant(),
          'Content-Type': 'application/json'
        }
      });
      const result = await res.json();
      showToast(result.message, 'success');
      carregarBloqueios();
    } catch {
      showToast('Erro ao remover bloqueio.', 'error');
    }
  };

  const excluirFuncionario = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este funcionário?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/funcionarios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant': getTenant(),
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        showToast('Funcionário excluído com sucesso', 'success');
        carregarFuncionarios();
      } else {
        const erro = await res.json();
        showToast(`Erro: ${erro.message}`, 'error');
      }
    } catch {
      showToast('Erro ao excluir funcionário', 'error');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/cliente1/login');
  };

  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <div>
      <div className="dashboard-header">
        <nav className="navheader">
          <div className="nav-wrapper">
            <a href="#" className="brand-logo">Painel Admin</a>
            <ul className="right hide-on-med-and-down">
              <li className="sairbutton"><a onClick={logout} style={{ cursor: 'pointer' }}>Sair</a></li>
            </ul>
          </div>
        </nav>
      </div>

      <main style={{ paddingTop: '20px', paddingLeft: '20px', paddingRight: '20px' }}>
        <div className="row">
          <div className="col s12 l8">
            <div className="card-panel white">
              <h5 className="section-title">
                <i className="material-icons">calendar_today</i>
                <span id="titulo-agendamentos">{modoHistorico ? 'Histórico Completo de Agendamentos' : 'Agendamentos Recentes'}</span>
              </h5>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div className="input-field" style={{ flex: 1, marginRight: '10px' }}>
                  <i className="material-icons prefix">search</i>
                  <input
                    type="text"
                    id="busca-agendamentos"
                    value={buscaTermo}
                    onChange={(e) => filtrarAgendamentos(e.target.value)}
                    placeholder="nome, data, horário ou quadra..."
                  />
                  <label htmlFor="busca-agendamentos">Buscar Agendamentos</label>
                </div>
                <button
                  id="btn-historico"
                  className="btn waves-effect waves-light blue"
                  onClick={() => modoHistorico ? voltarAgendamentosRecentes() : carregarHistoricoCompleto()}
                  style={{ marginTop: '5px' }}
                >
                  <i className="material-icons left">{modoHistorico ? 'calendar_today' : 'history'}</i>
                  {modoHistorico ? 'Voltar para Recentes' : 'Histórico'}
                </button>
              </div>
              <div id="agendamentos-list">
                {agendamentosFiltrados.length ? (
                  agendamentosFiltrados.map((a: any) => {
                    const status = a.status ? a.status.toLowerCase().trim() : 'nao-pago';
                    const statusText = status === 'pago' ? 'Pago' : 'Não pago';
                    const statusClass = status === 'pago' ? 'pago' : 'nao-pago';
                    const paymentMethods: any = { 'cartao': 'Cartão', 'dinheiro': 'Dinheiro', 'pix': 'Pix' };
                    const paymentText = paymentMethods[a.payment_method] || 'Não informado';

                    return (
                      <div key={a.id} className="booking-item">
                        <div className="booking-details">
                          <strong>{a.nome_cliente}</strong> - {a.telefone_cliente}
                        </div>
                        <div className="booking-details">
                          <i className="material-icons tiny">date_range</i>
                          {formatarData(a.data_agendada)}
                        </div>
                        <div className="booking-details">
                          <i className="material-icons tiny">access_time</i>
                          {a.hora_inicio} - {a.hora_fim}
                        </div>
                        <div className="booking-details">
                          <i className="material-icons tiny">sports_soccer</i>
                          Quadra {a.quadra}
                        </div>
                        <div className="booking-details">
                          <span className={`status-badge ${statusClass}`}>{statusText}</span>
                          <span className="payment-method">({paymentText})</span>
                        </div>
                        <div className="booking-details" style={{ marginTop: 10 }}>
                          <span className="badge white-text">
                            R$ {calcularValorFront(a.hora_inicio, a.hora_fim).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 15, flexWrap: 'wrap' }}>
                          {status !== 'pago' && (
                            <button onClick={() => marcarComoPago(a.id)} className="btn btn-success waves-effect waves-light">
                              <i className="material-icons left">check</i>Confirmar Pagamento
                            </button>
                          )}
                          <button onClick={() => excluirAgendamento(a.id)} className="btn btn-danger waves-effect waves-light">
                            <i className="material-icons left">delete</i>Excluir
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>Nenhum agendamento encontrado.</p>
                )}
              </div>
            </div>
          </div>

          <div className="col s12 l4">
            <div className="card-panel white">
              <h5 className="section-title"><i className="material-icons">lock</i>Bloquear Horários</h5>
              <div className="input-field">
                <input type="date" value={dataBloqueio} onChange={(e) => setDataBloqueio(e.target.value)} />
                <label>Data</label>
              </div>
              <div className="input-field">
                <select value={quadraBloqueio} onChange={(e) => setQuadraBloqueio(e.target.value)}>
                  <option value="">Todas as Quadras</option>
                  <option value="1">Quadra 1</option>
                  <option value="2">Quadra 2</option>
                </select>
                <label>Quadra</label>
              </div>
              <button onClick={bloquearDia} className="btn waves-effect waves-light btn-warning">
                <i className="material-icons left">block</i>Bloquear Dia
              </button>

              <div className="row">
                <div className="col s12 m6">
                  <div className="input-field">
                    <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
                    <label>Hora Início</label>
                  </div>
                </div>
                <div className="col s12 m6">
                  <div className="input-field">
                    <input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
                    <label>Hora Fim</label>
                  </div>
                </div>
              </div>
              <button onClick={bloquearHorario} className="btn waves-effect waves-light btn-warning">
                <i className="material-icons left">schedule</i>Bloquear Horário
              </button>

              <div className="divider" style={{ margin: '20px 0' }} />

              <h6 className="section-subtitle"><i className="material-icons">repeat</i> Bloqueio Recorrente</h6>
              <div className="input-field">
                <input type="text" value={nomeBloqueio} onChange={(e) => setNomeBloqueio(e.target.value)} />
                <label>Nome do Cliente</label>
              </div>
              <div className="input-field">
                <select value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)}>
                  <option value="">Selecione o dia da semana</option>
                  <option value="1">Segunda-feira</option>
                  <option value="2">Terça-feira</option>
                  <option value="3">Quarta-feira</option>
                  <option value="4">Quinta-feira</option>
                  <option value="5">Sexta-feira</option>
                  <option value="6">Sábado</option>
                  <option value="0">Domingo</option>
                </select>
                <label>Dia da Semana</label>
              </div>
              <div className="row">
                <div className="col s12 m6">
                  <div className="input-field">
                    <input type="time" value={horaInicioBloqueioRec} onChange={(e) => setHoraInicioBloqueioRec(e.target.value)} />
                    <label>Hora Início</label>
                  </div>
                </div>
                <div className="col s12 m6">
                  <div className="input-field">
                    <input type="time" value={horaFimBloqueioRec} onChange={(e) => setHoraFimBloqueioRec(e.target.value)} />
                    <label>Hora Fim</label>
                  </div>
                </div>
              </div>
              <div className="input-field">
                <select value={quadraBloqueioRec} onChange={(e) => setQuadraBloqueioRec(e.target.value)}>
                  <option value="">Todas as Quadras</option>
                  <option value="1">Quadra 1</option>
                  <option value="2">Quadra 2</option>
                </select>
                <label>Quadra</label>
              </div>
              <button onClick={bloquearHorarioRecorrente} className="btn waves-effect waves-light btn-warning">
                <i className="material-icons left">repeat</i> Bloquear Semanalmente
              </button>

              <div className="card-panel white" style={{ marginTop: '20px' }}>
                <h5 className="section-title"><i className="material-icons">lock_clock</i>Horários Bloqueados</h5>
                <div id="bloqueios-list">
                  {bloqueios.length ? (
                    bloqueios.map((b: any, i: number) => {
                      const isRecorrente = b.day_of_week !== undefined;
                      const diaSemanaStr = isRecorrente ? diasSemana[b.day_of_week] : '';
                      const horaInicioBloq = isRecorrente ? b.start_time?.slice(0, 5) : b.hora_inicio?.slice(0, 5);
                      const horaFimBloq = isRecorrente ? b.end_time?.slice(0, 5) : b.hora_fim?.slice(0, 5);

                      return (
                        <div key={i} className="booking-item">
                          {b.nome && (
                            <div className="booking-details">
                              <strong>{b.nome}</strong>
                            </div>
                          )}
                          <div className="booking-details">
                            <i className="material-icons tiny">{isRecorrente ? 'repeat' : 'event'}</i>
                            {isRecorrente ? diaSemanaStr + ' (Recorrente)' : formatarData(b.data)}
                          </div>
                          <div className="booking-details">
                            <i className="material-icons tiny">schedule</i>
                            {horaInicioBloq} - {horaFimBloq}
                            {b.quadra && <span className="quadra-badge">Quadra {b.quadra}</span>}
                          </div>
                          <div style={{ marginTop: 10 }}>
                            <button onClick={() => removerBloqueio(b.id, isRecorrente)} className="btn btn-danger waves-effect waves-light btn-small">
                              <i className="material-icons left">delete</i>Remover
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>Nenhum horário bloqueado.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="card-panel white">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href="/cliente1/agendamento" className="btn btn-primary w-100 py-2">
                  <i className="material-icons left">calendar_today</i> Agendar para um Cliente
                </a>
              </div>
              <p style={{ marginTop: '10px' }}>Agende um horário por um cliente e salve!</p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col s12">
            <div className="card-panel white">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h5 className="section-title"><i className="material-icons">people</i>Funcionários</h5>
                <button
                  id="btnRegistrarFuncionario"
                  className="btn waves-effect waves-light"
                  onClick={() => navigate('/cliente1/registrar-funcionario')}
                >
                  <i className="material-icons left">person_add</i>Novo Funcionário
                </button>
              </div>
              <div id="funcionarios-list">
                {funcionarios.length ? (
                  funcionarios.map((f: any) => (
                    <div key={f.id} className="booking-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{f.nome}</strong><br />
                          <span className="grey-text">{f.email}</span>
                        </div>
                        <button onClick={() => excluirFuncionario(f.id)} className="btn btn-danger waves-effect waves-light btn-small">
                          <i className="material-icons left">delete</i>Excluir
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Nenhum funcionário cadastrado.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col s12">
            <div className="card-panel white">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h5 className="section-title"><a href="/cliente1/financeiro"><i className="material-icons left">attach_money</i>Financeiro</a></h5>
                <a href="/cliente1/financeiro" className="btn btn-primary w-100 py-2">
                  <i className="material-icons left">attach_money</i> Gerenciar Finanças
                </a>
              </div>
              <div className="card-panel white">
                <p>Gerencie suas finanças e veja detalhes sobre o rendimento das quadras, lucros mensais, diários e muito mais!</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
