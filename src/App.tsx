import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import PerfilCidadaoPage from './pages/Dashboard/PerfilCidadao/PerfilCidadaoPage';
import AgendarPage from './pages/Dashboard/Agendar/AgendarPage';
import EstadoPage from './pages/Dashboard/Estado/EstadoPage';
import AtualizacaoPage from './pages/Dashboard/Atualizacao/AtualizacaoPage';

export default function App() {
  return (
    <Routes>
      {/* Public routes (login/register) */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Protected routes (dashboard) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="perfil" element={<PerfilCidadaoPage />} />
          <Route path="agendar" element={<AgendarPage />} />
          <Route path="estado" element={<EstadoPage />} />
          <Route path="atualizacao" element={<AtualizacaoPage />} />
          <Route index element={<Navigate to="perfil" replace />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
