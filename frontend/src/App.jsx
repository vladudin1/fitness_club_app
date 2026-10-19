import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import EmployeesPage from './pages/EmployeesPage';
import ProductsPage from './pages/ProductsPage';
import ServicesPage from './pages/ServicesPage';
import OrdersPage from './pages/OrdersPage';
import AppointmentsPage from './pages/AppointmentsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import ReportsPage from './pages/ReportsPage';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Заставка при загрузке
  if (loading) {
    return <SplashScreen />;
  }

  const isLoggedIn = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Если не вошёл — показываем только логин и регистрацию
  if (!isLoggedIn) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Все остальные адреса ведут на логин */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Если вошёл — показываем основное приложение с Layout
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route
            path="/reports"
            element={
              userRole === 'admin' || userRole === 'manager' ? (
                <ReportsPage />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          {/* Корневой путь и всё остальное → дашборд */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;