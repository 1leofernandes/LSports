import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './hooks/AuthContext';
// import Login from './pages/Login';
import Register from './pages/Register';
// cliente1 legacy-converted pages
import ClienteLogin from './pages/cliente1/Login';
import ClienteRegister from './pages/cliente1/Registrar';
import ClienteAgendamento from './pages/cliente1/Agendamento';
import ClienteAdmin from './pages/cliente1/Admin';
import ClienteFinanceiro from './pages/cliente1/Financeiro';
import ClienteFuncionario from './pages/cliente1/Funcionario';
import ClienteRegistrarFuncionario from './pages/cliente1/RegistrarFuncionario';
import ClienteEsqueciSenha from './pages/cliente1/EsqueciSenha';
import ClienteResetarSenha from './pages/cliente1/ResetarSenha';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Admin from './pages/Admin';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* <Route path="/login" element={<Login />} /> */}
            <Route path="/register" element={<Register />} />
            <Route path="/cliente1/login" element={<ClienteLogin />} />
            <Route path="/cliente1/registrar" element={<ClienteRegister />} />
            <Route path="/cliente1/agendamento" element={<ClienteAgendamento />} />
            <Route path="/cliente1/admin" element={<ClienteAdmin />} />
            <Route path="/cliente1/financeiro" element={<ClienteFinanceiro />} />
            <Route path="/cliente1/funcionario" element={<ClienteFuncionario />} />
            <Route path="/cliente1/registrar-funcionario" element={<ClienteRegistrarFuncionario />} />
            <Route path="/cliente1/esqueci-senha" element={<ClienteEsqueciSenha />} />
            <Route path="/cliente1/resetar-senha" element={<ClienteResetarSenha />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <PrivateRoute>
                  <Appointments />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
