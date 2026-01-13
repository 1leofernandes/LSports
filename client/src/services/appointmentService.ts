import api from './api';
import { Appointment, Block } from '../types';

export const appointmentService = {
  async getAppointments(date?: string) {
    const params = date ? { date } : {};
    const response = await api.get('/api/appointments/appointments', { params });
    return response.data as Appointment[];
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'user'>) {
    const response = await api.post('/api/appointments/appointments', appointment);
    return response.data;
  },

  async updateAppointment(id: number, updates: Partial<Appointment>) {
    const response = await api.put(`/api/appointments/appointments/${id}`, updates);
    return response.data;
  },

  async deleteAppointment(id: number) {
    await api.delete(`/api/appointments/appointments/${id}`);
  },

  async getBlocks() {
    const response = await api.get('/api/appointments/blocks');
    return response.data as Block[];
  },

  async createBlock(block: Omit<Block, 'id'>) {
    const response = await api.post('/api/appointments/blocks', block);
    return response.data;
  },
};