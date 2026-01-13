import api from './api';

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/api/auth/login', { email, senha: password });
    return response.data;
  },

  async register(name: string, email: string, password: string, phone?: string) {
    const response = await api.post('/api/auth/register', {
      nome: name,
      email,
      senha: password,
      telefone: phone,
    });
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },
};