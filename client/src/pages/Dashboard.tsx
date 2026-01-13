import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../hooks/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Bem-vindo, {user?.name}!
        </Typography>
        <Typography variant="body1" gutterBottom>
          Role: {user?.role}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => navigate('/appointments')} sx={{ mr: 2 }}>
            Agendamentos
          </Button>
          {user?.role === 'admin' && (
            <Button variant="contained" onClick={() => navigate('/admin')}>
              Administração
            </Button>
          )}
          <Button variant="outlined" onClick={logout} sx={{ ml: 2 }}>
            Sair
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;