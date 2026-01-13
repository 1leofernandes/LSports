import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getTenant, ensureCss, showToast } from '../../utils/common';

const Financeiro: React.FC = () => {
  const navigate = useNavigate();
  const [financeiro, setFinanceiro] = useState<any>({});

  useEffect(() => {
    ensureCss('https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css');
    ensureCss('https://fonts.googleapis.com/icon?family=Material+Icons');
    ensureCss('/cliente1/styles/financeiro.css');

    if (!localStorage.getItem('token')) {
      navigate('/cliente1/login');
      return;
    }

    validarUsuario();
    carregarFinanceiro();
  }, [navigate]);

  const validarUsuario = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Você não está logado.', 'error');
      navigate('/cliente1/login');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') {
        showToast('Acesso negado.', 'error');
        navigate('/cliente1/login');
      }
    } catch {
      showToast('Erro na autenticação.', 'error');
      navigate('/cliente1/login');
    }
  };

  const carregarFinanceiro = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/relatorio-financeiro?periodo=3`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Tenant': getTenant() }
      });
      if (!res.ok) throw new Error('Erro ao carregar financeiro');
      const data = await res.json();
      setFinanceiro(data);
    } catch {
      showToast('Erro ao carregar dados financeiros.', 'error');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/cliente1/login');
  };

  return (
    <div>
      <div className="dashboard-header">
        <nav className="navheader">
          <div className="nav-wrapper">
            <a href="#" className="brand-logo">Painel Financeiro</a>
            <ul className="right">
              <li className="sairbutton"><a onClick={logout} style={{ cursor: 'pointer' }}>Sair</a></li>
            </ul>
          </div>
        </nav>
      </div>

      <main>
        <div className="row">
          <div className="col s12">
            <div className="card-panel white">
              <h5>Resumo Financeiro</h5>
              <div className="row">
                <div className="col s12 m6">
                  <div className="card blue lighten-2">
                    <div className="card-content white-text">
                      <span className="card-title">Receita Total</span>
                      <p>R$ {(financeiro.totalReceita || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <div className="col s12 m6">
                  <div className="card green lighten-2">
                    <div className="card-content white-text">
                      <span className="card-title">Agendamentos</span>
                      <p>{financeiro.totalAgendamentos || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col s12">
            <div className="card-panel white">
              <h5>Últimos Agendamentos Pagos</h5>
              <table className="striped">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Valor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(financeiro.agendamentosPagos || []).map((a: any) => (
                    <tr key={a.id}>
                      <td>{a.nome_cliente}</td>
                      <td>{new Date(a.data_agendada).toLocaleDateString('pt-BR')}</td>
                      <td>R$ {a.valor.toFixed(2)}</td>
                      <td><span className="badge green white-text">Pago</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col s12">
            <a href="/cliente1/admin" className="btn btn-primary">Voltar ao Painel</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Financeiro;
