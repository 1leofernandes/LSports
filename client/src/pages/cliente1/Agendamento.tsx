import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getTenant, ensureCss, showToast } from '../../utils/common';
import { useAuth } from '../../hooks/AuthContext';

const Agendamento: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [quadraSelecionada, setQuadraSelecionada] = useState('1');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [horariosFinaisDisponiveis, setHorariosFinaisDisponiveis] = useState<string[]>([]);
  const [meus, setMeus] = useState<any[]>([]);
  const [mostrandoAgendamentos, setMostrandoAgendamentos] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState<any>(null);

  useEffect(() => {
    ensureCss('/cliente1/styles/agendamento.css');
    ensureCss('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
    ensureCss('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css');

    if (!localStorage.getItem('token')) {
      navigate('/cliente1/login');
    }

    carregarMeusAgendamentos();
  }, [navigate]);

  const gerarHorarios = (diaDaSemana: number) => {
    let inicio, fim;
    if (diaDaSemana >= 1 && diaDaSemana <= 5) {
      inicio = 17;
      fim = 24;
    } else if (diaDaSemana === 6) {
      inicio = 10;
      fim = 24;
    } else if (diaDaSemana === 0) {
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
      horarios.push(`${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
    }
    return horarios;
  };

  const carregarHorariosOcupados = async (data: string, quadra: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/horarios-ocupados?data=${encodeURIComponent(data)}&quadra=${encodeURIComponent(quadra)}`, {
        headers: { 'X-Tenant': getTenant() }
      });
      if (!res.ok) throw new Error('Erro ao carregar horários');
      return await res.json();
    } catch {
      return { horariosOcupados: [], reservas: [] };
    }
  };

  const carregarHorariosBloqueados = async (data: string, quadra: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/horarios-bloqueados?data=${encodeURIComponent(data)}&quadra=${encodeURIComponent(quadra)}`, {
        headers: { 'X-Tenant': getTenant() }
      });
      if (!res.ok) throw new Error('Erro ao carregar horários bloqueados');
      return await res.json();
    } catch {
      return { bloqueiosRecorrentes: [], horariosBloqueados: [] };
    }
  };

  const atualizarHorariosDisponiveis = async () => {
    if (!dataSelecionada || !quadraSelecionada) return;

    const [ano, mes, dia] = dataSelecionada.split('-');
    const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    const diaDaSemana = data.getDay();

    const [ocupados, bloqueados] = await Promise.all([
      carregarHorariosOcupados(dataSelecionada, quadraSelecionada),
      carregarHorariosBloqueados(dataSelecionada, quadraSelecionada)
    ]);

    const reservas = (ocupados.reservas || []).map((r: any) => ({
      hora_inicio: r.hora_inicio.slice(0, 5),
      hora_fim: r.hora_fim.slice(0, 5)
    }));

    const bloqueiosEspecificos = (bloqueados.bloqueiosEspecificos || []).map((b: any) => ({
      hora_inicio: b.hora_inicio.slice(0, 5),
      hora_fim: b.hora_fim.slice(0, 5)
    }));
    const bloqueiosRecorrentes = (bloqueados.bloqueiosRecorrentes || []).map((b: any) => ({
      hora_inicio: b.hora_inicio.slice(0, 5),
      hora_fim: b.hora_fim.slice(0, 5)
    }));
    const todosBloqueios = [...bloqueiosEspecificos, ...bloqueiosRecorrentes];

    const horarios = gerarHorarios(diaDaSemana);
    const horariosOcupados = quadraSelecionada === '1'
      ? ocupados.horariosOcupadosQuadra1 || []
      : ocupados.horariosOcupadosQuadra2 || [];

    const horariosFinaisBloqueios = todosBloqueios.map((b: any) => b.hora_fim);
    const horariosFinaisAgendamentos = reservas.map((r: any) => r.hora_fim);
    const todosHorariosFinais = [...horariosFinaisAgendamentos, ...horariosFinaisBloqueios];

    const horariosInicioEventos = [
      ...reservas.map((r: any) => r.hora_inicio),
      ...todosBloqueios.map((b: any) => b.hora_inicio)
    ];

    const horariosDisponiveis = horarios.filter(hora => {
      const estaOcupado = horariosOcupados.includes(hora) && !todosHorariosFinais.includes(hora);
      if (estaOcupado) return false;

      const estaNoMeioReserva = reservas.some((r: any) => hora > r.hora_inicio && hora < r.hora_fim);
      if (estaNoMeioReserva) return false;

      const estaNoMeioBloqueio = todosBloqueios.some((b: any) => hora > b.hora_inicio && hora < b.hora_fim);
      if (estaNoMeioBloqueio) return false;

      const ehInicioEvento = horariosInicioEventos.includes(hora);
      if (ehInicioEvento) return false;

      return true;
    });

    setHorariosDisponiveis(horariosDisponiveis);
    setHoraInicio('');
    setHoraFim('');
  };

  const atualizarHorariosFinais = async (horaInicio: string) => {
    if (!dataSelecionada || !horaInicio) return;

    const [ano, mes, dia] = dataSelecionada.split('-');
    const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    const diaDaSemana = data.getDay();

    const [ocupados, bloqueados] = await Promise.all([
      carregarHorariosOcupados(dataSelecionada, quadraSelecionada),
      carregarHorariosBloqueados(dataSelecionada, quadraSelecionada)
    ]);

    const horarios = gerarHorarios(diaDaSemana);
    const inicioIndex = horarios.indexOf(horaInicio);

    const todosBloqueios = [
      ...(bloqueados.bloqueiosEspecificos || []),
      ...(bloqueados.bloqueiosRecorrentes || [])
    ];

    const eventos: any[] = [];
    if (ocupados.reservas) {
      ocupados.reservas.forEach((r: any) => {
        eventos.push({
          tipo: 'reserva',
          inicio: r.hora_inicio.slice(0, 5),
          fim: r.hora_fim.slice(0, 5)
        });
      });
    }
    todosBloqueios.forEach((b: any) => {
      eventos.push({
        tipo: 'bloqueio',
        inicio: b.hora_inicio.slice(0, 5),
        fim: b.hora_fim.slice(0, 5)
      });
    });

    const eventosFuturos = eventos.filter(evento => evento.inicio > horaInicio);
    eventosFuturos.sort((a, b) => a.inicio.localeCompare(b.inicio));
    const proximoEvento = eventosFuturos[0];
    const horarioFinalMaximo = proximoEvento ? proximoEvento.inicio : null;

    const horariosDisponiveis = horarios
      .slice(inicioIndex + 1)
      .filter(hora => {
        if (horarioFinalMaximo && hora > horarioFinalMaximo) return false;
        const estaEmBloqueio = todosBloqueios.some((b: any) => hora > b.hora_inicio.slice(0, 5) && hora < b.hora_fim.slice(0, 5));
        if (estaEmBloqueio) return false;
        const emReserva = (ocupados.reservas || []).some((r: any) => hora > r.hora_inicio.slice(0, 5) && hora < r.hora_fim.slice(0, 5));
        if (emReserva) return false;
        return true;
      });

    setHorariosFinaisDisponiveis(horariosDisponiveis);
    setHoraFim('');
  };

  const calcularValor = (inicio: string, fim: string) => {
    const [inicioH, inicioM] = inicio.split(':').map(Number);
    const [fimH, fimM] = fim.split(':').map(Number);
    const minutosTotais = (fimH * 60 + fimM) - (inicioH * 60 + inicioM);
    const horasCheias = Math.floor(minutosTotais / 60);
    const meiasHoras = (minutosTotais % 60) / 30;
    return (horasCheias * 50) + (meiasHoras * 25);
  };

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const carregarMeusAgendamentos = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/meus-agendamentos`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant': getTenant() }
      });
      if (!res.ok) throw new Error('Erro ao carregar');
      const agendamentos = await res.json();
      setMeus(agendamentos);
    } catch {
      showToast('Erro ao carregar agendamentos', 'error');
    }
  };

  const enviarAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataSelecionada || !quadraSelecionada || !horaInicio || !horaFim || !paymentMethod) {
      showToast('Preencha todos os campos obrigatórios, incluindo a forma de pagamento!', 'error');
      return;
    }

    const usuario_id = localStorage.getItem('usuario_id');
    const valor = calcularValor(horaInicio, horaFim);
    const token = localStorage.getItem('token');

    // Dados para confirmação
    const dadosConfirmacao = {
      quadra: quadraSelecionada,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      data_agendada: dataSelecionada,
      formaPagamento: paymentMethod === 'cartao' ? 'Cartão' : paymentMethod === 'dinheiro' ? 'Dinheiro' : 'Pix',
      valor: valor
    };

    // Mostrar confirmação
    const confirmado = await mostrarConfirmacao(dadosConfirmacao);
    if (!confirmado) return;

    try {
      const verifResponse = await fetch(`${API_BASE_URL}/verificar-disponibilidade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant': getTenant()
        },
        body: JSON.stringify({
          data_agendada: dataSelecionada,
          hora_inicio: horaInicio,
          hora_fim: horaFim,
          quadra: quadraSelecionada
        })
      });

      const verifResult = await verifResponse.json();
      if (!verifResult.disponivel) {
        let motivo = '';
        if (verifResult.conflitos.agendamentos) motivo += 'Conflito com agendamento existente. ';
        if (verifResult.conflitos.bloqueios) motivo += 'Conflito com bloqueio específico. ';
        if (verifResult.conflitos.recorrentes) motivo += 'Há uma aula ou um bloqueio recorrente no intervalo do horário selecionado.';
        throw new Error(`Horário indisponível. ${motivo}`);
      }

      const response = await fetch(`${API_BASE_URL}/agendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant': getTenant()
        },
        body: JSON.stringify({
          usuario_id,
          data_agendada: dataSelecionada,
          hora_inicio: horaInicio,
          hora_fim: horaFim,
          quadra: quadraSelecionada,
          valor,
          payment_method: paymentMethod
        })
      });

      if (!response.ok) throw new Error('Erro ao agendar');
      showToast('Agendamento realizado com sucesso!', 'success');
      setDataSelecionada('');
      setQuadraSelecionada('1');
      setHoraInicio('');
      setHoraFim('');
      setPaymentMethod('');
      setHorariosDisponiveis([]);
      setHorariosFinaisDisponiveis([]);
      setMeus([]);
      carregarMeusAgendamentos();
    } catch (error: any) {
      showToast(error.message || 'Erro ao realizar agendamento', 'error');
    }
  };

  const mostrarConfirmacao = (dados: any): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmData({ ...dados, resolve });
      setShowConfirmModal(true);
    });
  };

  const handleConfirm = () => {
    if (confirmData?.resolve) {
      confirmData.resolve(true);
    }
    setShowConfirmModal(false);
    setConfirmData(null);
  };

  const handleCancel = () => {
    if (confirmData?.resolve) {
      confirmData.resolve(false);
    }
    setShowConfirmModal(false);
    setConfirmData(null);
  };

  const cancelarAgendamento = async (id: number) => {
    if (!window.confirm('Deseja realmente cancelar este agendamento?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/cancelar-agendamento/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant': getTenant() }
      });
      if (!res.ok) throw new Error('Erro ao cancelar');
      showToast('Agendamento cancelado com sucesso!', 'success');
      carregarMeusAgendamentos();
    } catch {
      showToast('Erro ao cancelar agendamento', 'error');
    }
  };

  return (
    <>
      <header className="header">
        <button onClick={logout} className="btn btn-sm btn-light">
          <i className="bi bi-box-arrow-right" /> Sair
        </button>
        <img src="/cliente1/assets/lsports-icon.png" alt="Logo" className="imgheader" />
        <h1>Reserva de Quadras</h1>
        <a href="https://maps.app.goo.gl/Mp9EvZqcGLJJ8dAVA" target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>
          <span>Av. Rio Verde - QD 01 LT 02</span><br />
          <span>Jardins Mônaco - Goiânia</span>
        </a>
        <br />
        <div className="date-box">
          Seg a Sex: 17h - 00h | Sáb: 10h - 00h | Dom 10h - 23h
        </div>
        <div className="social-icons">
          <a href="https://wa.me/5562984894774" target="_blank" rel="noreferrer" className="whatsapp-icon">
            <img src="/cliente1/assets/whatsapp.png" alt="WhatsApp" />
          </a>
          <a href="https://www.instagram.com/lfsoftwares" target="_blank" rel="noreferrer">
            <img src="/cliente1/assets/instagram.png" alt="Instagram" />
          </a>
          <a href="https://wa.me/5562984894774?text=Preciso de ajuda com o agendamento, ou quero relatar um problema:" target="_blank" rel="noreferrer">
            <img src="/cliente1/assets/ajuda.png" alt="Ajuda" />
          </a>
        </div>
      </header>

      <div className="container">
        <h2 className="mb-4">Olá, <span className="username">{localStorage.getItem('nome') || 'Usuário'}</span></h2>

        <form id="agendamentoForm" className="needs-validation" onSubmit={enviarAgendamento}>
          <div className="mb-4">
            <label className="form-label">Data do Agendamento</label>
            <input type="date" className="form-control" value={dataSelecionada} onChange={e => { setDataSelecionada(e.target.value); atualizarHorariosDisponiveis(); }} required />
          </div>

          <div className="mb-4">
            <label className="form-label">Escolha a Quadra</label>
            <div id="quadra" className="d-flex gap-2">
              <button type="button" className={`btn ${quadraSelecionada === '1' ? 'btn-secondary' : 'btn-outline-secondary'} quadra-btn`} onClick={() => { setQuadraSelecionada('1'); atualizarHorariosDisponiveis(); }}>Quadra 1</button>
              <button type="button" className={`btn ${quadraSelecionada === '2' ? 'btn-secondary' : 'btn-outline-secondary'} quadra-btn`} onClick={() => { setQuadraSelecionada('2'); atualizarHorariosDisponiveis(); }}>Quadra 2</button>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Horário de Início</label>
            <div className="time-grid">
              {horariosDisponiveis.map(hora => (
                <div key={hora} className={`time-slot ${horaInicio === hora ? 'selected' : ''}`} onClick={() => { setHoraInicio(hora); atualizarHorariosFinais(hora); }}>
                  {hora}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Horário Final</label>
            <div className="time-grid">
              {horariosFinaisDisponiveis.map(hora => (
                <div key={hora} className={`time-slot ${horaFim === hora ? 'selected' : ''}`} onClick={() => setHoraFim(hora)}>
                  {hora}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Forma de Pagamento</label>
            <select className="form-control" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} required>
              <option value="">Selecione...</option>
              <option value="cartao">Cartão</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">Pix</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2">
            <i className="bi bi-calendar-check" /> Reservar Agora
          </button>
        </form>
      </div>

      <div className="text-center mt-4">
        <button id="btn-meus-agendamentos" className="btn btn-info" onClick={() => setMostrandoAgendamentos(!mostrandoAgendamentos)}>
          <i className="bi bi-list-task" /> Meus Agendamentos
        </button>
      </div>

      {mostrandoAgendamentos && (
        <div id="lista-agendamentos" className="mt-4" style={{ maxHeight: 400, overflowY: 'auto', background: 'white', border: '1px solid #ddd', borderRadius: 8, padding: 15 }}>
          <h5 className="text-center mb-3"><i className="bi bi-calendar3" /> Meus Agendamentos</h5>
          {meus.length === 0 ? (
            <div className="text-center text-muted">Nenhum agendamento encontrado</div>
          ) : (
            meus.map(agendamento => (
              <div key={agendamento.id} className="booking-card mb-3" style={{ border: '1px solid #eee', padding: 10, borderRadius: 5 }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="quadra-badge">Quadra {agendamento.quadra}</span>
                  <small className="text-muted">{formatarData(agendamento.data_agendada.split('T')[0])}</small>
                </div>
                <div className="booking-time">
                  <i className="bi bi-clock" /> {agendamento.hora_inicio} - {agendamento.hora_fim}
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <span><i className="bi bi-cash-coin" /> R$ {calcularValor(agendamento.hora_inicio, agendamento.hora_fim).toFixed(2)}</span>
                  <button className="btn btn-sm btn-danger" onClick={() => cancelarAgendamento(agendamento.id)}>
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de Confirmação */}
      {showConfirmModal && confirmData && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-calendar2-check text-success me-2"></i>
                  Confirmar Reserva
                </h5>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <h4>Quadra {confirmData.quadra}</h4>
                </div>
                <div className="row">
                  <div className="col-6">
                    <p><i className="bi bi-clock text-primary me-2"></i><strong>Horário:</strong></p>
                    <p className="ms-3">{confirmData.hora_inicio} - {confirmData.hora_fim}</p>
                  </div>
                  <div className="col-6">
                    <p><i className="bi bi-calendar-date text-primary me-2"></i><strong>Data:</strong></p>
                    <p className="ms-3">{formatarData(confirmData.data_agendada)}</p>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-6">
                    <p><i className="bi bi-credit-card text-primary me-2"></i><strong>Pagamento:</strong></p>
                    <p className="ms-3">{confirmData.formaPagamento}</p>
                  </div>
                  <div className="col-6">
                    <p><i className="bi bi-cash-coin text-success me-2"></i><strong>Total:</strong></p>
                    <p className="ms-3 fs-5 fw-bold text-success">R$ {confirmData.valor.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  <i className="bi bi-x-circle me-1"></i>Cancelar
                </button>
                <button type="button" className="btn btn-success" onClick={handleConfirm}>
                  <i className="bi bi-check-circle me-1"></i>Confirmar Reserva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Agendamento;
