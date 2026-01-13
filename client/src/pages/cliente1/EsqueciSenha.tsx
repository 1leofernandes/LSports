import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getTenant, ensureCss, showToast } from '../../utils/common';

const EsqueciSenha: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ensureCss('/cliente1/styles/esqueci-senha.css');
    ensureCss('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
    ensureCss('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Preencha o email!', 'error');
      return;
    }

    setLoading(true);
    const tenant = getTenant();

    try {
      const res = await fetch(`${API_BASE_URL}/esqueci-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant': tenant },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Email de recuperação enviado! Verifique sua caixa de entrada.', 'success');
        setEmail('');
      } else {
        showToast(data.message || 'Erro ao enviar email', 'error');
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
      <h2 className="text-center">Esqueci minha Senha</h2>
      <form id="esqueci-senhaForm" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="form-control" id="email" placeholder="email@email.com" required />
        </div>
        <div className="d-grid gap-2">
          <button type="submit" disabled={loading} className="btn btn-custom-red">
            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </button>
        </div>
      </form>
      <p className="mt-3"><a href="/cliente1/login" className="custom-link">Voltar ao Login</a></p>
    </div>
  );
};

export default EsqueciSenha;
