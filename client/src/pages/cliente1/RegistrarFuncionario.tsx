import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getTenant, ensureCss, showToast } from '../../utils/common';

const RegistrarFuncionario: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');

  useEffect(() => {
    ensureCss('/cliente1/styles/registrar-funcionario.css');
    ensureCss('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
    ensureCss('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');

    if (!localStorage.getItem('token')) {
      navigate('/cliente1/login');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !telefone || !senha) {
      showToast('Preencha todos os campos!', 'error');
      return;
    }

    const tenant = getTenant();
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_BASE_URL}/registrar-funcionario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant': tenant
        },
        body: JSON.stringify({ nome, email, telefone, senha })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Funcionário registrado com sucesso!', 'success');
        navigate('/cliente1/admin');
      } else {
        showToast(data.message || 'Erro ao registrar funcionário', 'error');
      }
    } catch {
      showToast('Erro ao conectar ao servidor', 'error');
    }
  };

  return (
    <div className="container 20px">
      <div className="logoCountainer">
        <img src="/cliente1/assets/lsports-icon.png" alt="lsports-icon" className="lsports-icon" />
      </div>
      <h2 className="text-center">Registrar Funcionário</h2>
      <form id="registerFuncionarioForm" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nome" className="form-label">Nome</label>
          <input value={nome} onChange={e => setNome(e.target.value)} type="text" className="form-control" id="nome" placeholder="Nome Sobrenome" required />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="form-control" id="email" placeholder="email@email.com" required />
        </div>
        <div className="mb-3">
          <label htmlFor="telefone" className="form-label">Telefone</label>
          <input value={telefone} onChange={e => setTelefone(e.target.value)} type="tel" className="form-control" id="telefone" placeholder="(62) 12345-6789" required />
        </div>
        <div className="mb-3 position-relative">
          <label htmlFor="senha" className="form-label">Senha</label>
          <input value={senha} onChange={e => setSenha(e.target.value)} type="password" className="form-control" id="senha" placeholder="senha" required />
          <i className="fa-solid fa-eye eye-icon" id="toggleSenha" />
        </div>
        <div className="d-grid gap-2">
          <button type="submit" className="btn btn-custom-red">Registrar</button>
        </div>
      </form>
      <p className="mt-3"><a href="/cliente1/admin" className="custom-link">Voltar ao Painel</a></p>
    </div>
  );
};

export default RegistrarFuncionario;
