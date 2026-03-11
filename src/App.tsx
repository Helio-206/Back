import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import CenterLayout from './layouts/CenterLayout';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import PrivacyPolicyPage from './pages/PrivacyPolicy/PrivacyPolicyPage';
import PerfilCidadaoPage from './pages/Dashboard/PerfilCidadao/PerfilCidadaoPage';
import AgendarPage from './pages/Dashboard/Agendar/AgendarPage';
import EstadoPage from './pages/Dashboard/Estado/EstadoPage';
import AtualizacaoPage from './pages/Dashboard/Atualizacao/AtualizacaoPage';
import AdminDashboardPage from './pages/Admin/Dashboard/AdminDashboardPage';
import EstatisticaPage from './pages/Admin/Estatistica/EstatisticaPage';
import GestaoServicosPage from './pages/Admin/GestaoServicos/GestaoServicosPage';
import GestaoCentrosPage from './pages/Admin/GestaoCentros/GestaoCentrosPage';
import GestaoUtilizadoresPage from './pages/Admin/GestaoUtilizadores/GestaoUtilizadoresPage';
import RelatorioPage from './pages/Admin/Relatorio/RelatorioPage';
import PerfilAdminPage from './pages/Admin/Perfil/PerfilAdminPage';
import CenterDashboardPage from './pages/Center/Dashboard/CenterDashboardPage';
import CenterAgendamentosPage from './pages/Center/Agendamentos/CenterAgendamentosPage';
import CenterEstatisticasPage from './pages/Center/Estatisticas/CenterEstatisticasPage';
import CenterRelatoriosPage from './pages/Center/Relatorios/CenterRelatoriosPage';
import AdminLogsPage from './pages/Admin/Logs/AdminLogsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="perfil" element={<PerfilCidadaoPage />} />
          <Route path="agendar" element={<AgendarPage />} />
          <Route path="estado" element={<EstadoPage />} />
          <Route path="atualizacao" element={<AtualizacaoPage />} />
          <Route index element={<Navigate to="perfil" replace />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/addadd" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="estatistica" element={<EstatisticaPage />} />
          <Route path="servicos" element={<GestaoServicosPage />} />
          <Route path="centros" element={<GestaoCentrosPage />} />
          <Route path="utilizadores" element={<GestaoUtilizadoresPage />} />
          <Route path="relatorio" element={<RelatorioPage />} />
          <Route path="logs" element={<AdminLogsPage />} />
          <Route path="perfil" element={<PerfilAdminPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/centro" element={<CenterLayout />}>
          <Route index element={<CenterDashboardPage />} />
          <Route path="agendamentos" element={<CenterAgendamentosPage />} />
          <Route path="estatisticas" element={<CenterEstatisticasPage />} />
          <Route path="relatorios" element={<CenterRelatoriosPage />} />
        </Route>
      </Route>

      <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
