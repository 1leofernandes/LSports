import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, ensureCss, getTenant, showToast } from '../../utils/common';

const Registrar: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');

  useEffect(() => {
    ensureCss('/cliente1/styles/registrar.css');
    ensureCss('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
    ensureCss('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = getTenant();
    if (!name || !email || !telefone || !senha) {
      showToast('Preencha todos os campos!', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Tenant': tenant },
        body: JSON.stringify({ nome: name, email, telefone, senha })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Usuário registrado com sucesso!', 'success');
        navigate('/cliente1/login');
      } else {
        showToast(data.message || 'Erro ao registrar', 'error');
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
      <h2 className="text-center">Registrar</h2>
      <form id="registerForm" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nome</label>
          <input value={name} onChange={e => setName(e.target.value)} type="text" className="form-control" id="name" name="nome" placeholder="Nome Sobrenome" required />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="form-control" id="email" name="email" placeholder="email@email.com" required />
        </div>
        <div className="mb-3">
          <label htmlFor="telefone" className="form-label">Telefone</label>
          <input value={telefone} onChange={e => setTelefone(e.target.value)} type="tel" className="form-control" id="telefone" name="telefone" placeholder="(62) 12345-6789" required />
        </div>
        <div className="mb-3 position-relative">
          <label htmlFor="password" className="form-label">Senha</label>
          <input value={senha} onChange={e => setSenha(e.target.value)} type="password" className="form-control" id="password" placeholder="senha" required />
          <i className="fa-solid fa-eye eye-icon" id="toggleSenha" />
        </div>
        <div className="d-grid gap-2">
          <button type="submit" className="btn btn-custom-red">Registrar</button>
        </div>
      </form>
      <p className="mt-3">Já tem uma conta? <a href="/cliente1/login" className="custom-link">Fazer login</a></p>
    </div>
  );
};

export default Registrar;
