import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL, getTenant, ensureCss, showToast } from '../../utils/common';

const ResetarSenha: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
    ensureCss('/cliente1/styles/resetar-senha.css');
    ensureCss('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
    ensureCss('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');

    if (!token) {
      showToast('Token inválido!', 'error');
      navigate('/cliente1/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaSenha || !confirmarSenha) {
      showToast('Preencha todos os campos!', 'error');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      showToast('As senhas não coincidem!', 'error');
      return;
    }

    setLoading(true);
    const tenant = getTenant();

    try {
      const res = await fetch(`${API_BASE_URL}/resetar-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant': tenant },
        body: JSON.stringify({ token, novaSenha })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Senha redefinida com sucesso!', 'success');
        navigate('/cliente1/login');
      } else {
        showToast(data.message || 'Erro ao redefinir senha', 'error');
      }
    } catch {
      showToast('Erro ao conectar ao servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container 20px">
      <div className="logoCountainer">
        <img src="/cliente1/assets/lsports-icon.png" alt="lsports-icon" className="lsports-icon" />
      </div>
      <h2 className="text-center">Resetar Senha</h2>
      <form id="resetar-senhaForm" onSubmit={handleSubmit}>
        <div className="mb-3 position-relative">
          <label htmlFor="novaSenha" className="form-label">Nova Senha</label>
          <input value={novaSenha} onChange={e => setNovaSenha(e.target.value)} type="password" className="form-control" id="novaSenha" placeholder="Digite sua nova senha" required />
          <i className="fa-solid fa-eye eye-icon" />
        </div>
        <div className="mb-3 position-relative">
          <label htmlFor="confirmarSenha" className="form-label">Confirmar Senha</label>
          <input value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} type="password" className="form-control" id="confirmarSenha" placeholder="Confirme sua senha" required />
          <i className="fa-solid fa-eye eye-icon" />
        </div>
        <div className="d-grid gap-2">
          <button type="submit" disabled={loading} className="btn btn-custom-red">
            {loading ? 'Processando...' : 'Redefinir Senha'}
          </button>
        </div>
      </form>
      <p className="mt-3"><a href="/cliente1/login" className="custom-link">Voltar ao Login</a></p>
    </div>
  );
};

export default ResetarSenha;
