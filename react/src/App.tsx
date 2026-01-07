import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './services/auth';
import { notificationService } from './services/notification';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Medicines from './pages/Medicines';
import Categories from './pages/Categories';
import CategoryMedicines from './pages/CategoryMedicines';
import Customers from './pages/Customers';
import Stock from './pages/Stock';
import Sales from './pages/Sales';
import Logs from './pages/Logs';
import Users from './pages/Users';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    
    if (currentUser?.role !== 'ADMIN') {
      notificationService.error(
        'Acesso Negado',
        'Você não tem permissão para acessar esta página. Apenas administradores podem realizar esta ação.'
      );
      navigate('/inicio', { replace: true });
    }
  }, [currentUser, isAuthenticated, navigate]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (currentUser?.role !== 'ADMIN') {
    return null;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/inicio" replace />} />
        <Route path="inicio" element={<Home />} />
        <Route path="medicamentos" element={<Medicines />} />
        <Route path="categorias" element={<Categories />} />
        <Route path="categorias/:id/medicamentos" element={<CategoryMedicines />} />
        <Route path="clientes" element={<Customers />} />
        <Route path="estoque" element={<Stock />} />
        <Route path="vendas" element={<Sales />} />
        <Route
          path="logs"
          element={
            <AdminRoute>
              <Logs />
            </AdminRoute>
          }
        />
        <Route
          path="usuarios"
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

