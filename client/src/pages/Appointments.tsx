import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { appointmentService } from '../services/appointmentService';
import { Appointment } from '../types';
import { useAuth } from '../hooks/AuthContext';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    startTime: '',
    endTime: '',
    court: '',
    paymentMethod: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  const loadAppointments = async () => {
    if (selectedDate) {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const data = await appointmentService.getAppointments(dateStr);
      setAppointments(data);
    }
  };

  const handleCreate = async () => {
    if (!user || !selectedDate) return;
    await appointmentService.createAppointment({
      userId: user.id,
      scheduledDate: selectedDate.format('YYYY-MM-DD'),
      startTime: form.startTime,
      endTime: form.endTime,
      court: form.court,
      paymentMethod: form.paymentMethod,
      status: 'pending',
    });
    setOpen(false);
    loadAppointments();
  };

  const courts = ['Quadra 1', 'Quadra 2', 'Quadra 3'];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Agendamentos
          </Typography>
          <Box sx={{ mb: 2 }}>
            <DatePicker
              label="Selecionar Data"
              value={selectedDate}
              onChange={setSelectedDate}
            />
            <Button variant="contained" onClick={() => setOpen(true)} sx={{ ml: 2 }}>
              Novo Agendamento
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {appointments.map((appt) => (
              <Card key={appt.id} sx={{ minWidth: 300 }}>
                <CardContent>
                  <Typography variant="h6">{appt.court}</Typography>
                  <Typography>{appt.startTime} - {appt.endTime}</Typography>
                  <Typography>Usuário: {appt.user.name}</Typography>
                  <Typography>Status: {appt.status}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogContent>
            <TextField
              select
              label="Quadra"
              fullWidth
              margin="normal"
              value={form.court}
              onChange={(e) => setForm({ ...form, court: e.target.value })}
            >
              {courts.map((court) => (
                <MenuItem key={court} value={court}>
                  {court}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Hora Início"
              type="time"
              fullWidth
              margin="normal"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Hora Fim"
              type="time"
              fullWidth
              margin="normal"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Método de Pagamento"
              fullWidth
              margin="normal"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            >
              <MenuItem value="cash">Dinheiro</MenuItem>
              <MenuItem value="card">Cartão</MenuItem>
              <MenuItem value="pix">PIX</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} variant="contained">Criar</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default Appointments;