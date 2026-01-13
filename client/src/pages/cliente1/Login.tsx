import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getTenant, ensureCss, showToast } from '../../utils/common';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // load styles used by the legacy pages from public/cliente1
    ensureCss('/cliente1/styles/login.css');
    ensureCss('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
    ensureCss('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = getTenant();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Tenant': tenant },
        body: JSON.stringify({ email, senha: password })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('nome', data.nome);
        localStorage.setItem('usuario_id', data.usuario_id);
        localStorage.setItem('tenant', tenant);
        const role = JSON.parse(atob(data.token.split('.')[1])).role;
        if (role === 'cliente') navigate('/cliente1/agendamento');
        else if (role === 'funcionario') navigate('/cliente1/funcionario');
        else if (role === 'admin') navigate('/cliente1/admin');
      } else {
        showToast(data.message || 'Erro no login', 'error');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      showToast('Erro ao conectar ao servidor', 'error');
    }
  };

  return (
    <div className="container 20px">
      <div className="logoCountainer">
        <img src="/cliente1/assets/lsports-icon.png" alt="lsports-icon" className="lsports-icon" />
      </div>
      <h2 className="text-center">BEM VINDO</h2>
      <form id="loginForm" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="form-control" id="email" placeholder="email@email.com" required />
        </div>
        <div className="mb-3 position-relative">
          <label htmlFor="password" className="form-label">Senha</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="form-control" id="password" placeholder="senha" required />
          <i className="fa-solid fa-eye eye-icon" id="toggleSenha" />
        </div>
        <div className="d-grid gap-2">
          <button type="submit" className="btn btn-custom-red">Entrar</button>
        </div>
      </form>
      <p className="mt-3">Não tem uma conta? <a href="/cliente1/registrar" className="custom-link">Registrar-se</a></p>
      <p><a href="/cliente1/esqueci-senha" className="custom-link">Esqueci minha senha</a></p>
    </div>
  );
};

export default Login;
