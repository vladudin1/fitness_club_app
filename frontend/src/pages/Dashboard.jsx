import { useState, useEffect } from 'react';
import api from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalEmployees: 0,
    totalProducts: 0,
    totalServices: 0,
    totalOrders: 0,
    totalAppointments: 0,
    upcomingAppointments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [clientsRes, employeesRes, productsRes, servicesRes, ordersRes, appointmentsRes] = await Promise.all([
        api.get('/clients/'),
        api.get('/employees/'),
        api.get('/products/'),
        api.get('/services/'),
        api.get('/orders/'),
        api.get('/appointments/'),
      ]);

      // Получаем ближайшие записи (сегодняшние)
      const now = new Date();
      const upcoming = appointmentsRes.data
        .filter(app => app.status !== 'cancelled')
        .sort((a, b) => new Date(a.appointment_datetime) - new Date(b.appointment_datetime))
        .slice(0, 5);

      setStats({
        totalClients: clientsRes.data.length,
        totalEmployees: employeesRes.data.length,
        totalProducts: productsRes.data.length,
        totalServices: servicesRes.data.length,
        totalOrders: ordersRes.data.length,
        totalAppointments: appointmentsRes.data.length,
        upcomingAppointments: upcoming,
      });
    } catch (err) {
      console.error('Ошибка загрузки данных дашборда:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="message-empty">Загрузка...</div>;
  }

  return (
    <div>
      <h1 style={styles.pageTitle}>Дашборд</h1>
      <p style={styles.pageSubtitle}>Обзор информационной системы фитнес-клуба</p>

      <div className="grid-3" style={{ marginTop: '24px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statNumber}>{stats.totalClients}</div>
          <div style={styles.statLabel}>Клиентов</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={styles.statIcon}>👨‍💼</div>
          <div style={styles.statNumber}>{stats.totalEmployees}</div>
          <div style={styles.statLabel}>Сотрудников</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={styles.statIcon}>📦</div>
          <div style={styles.statNumber}>{stats.totalProducts}</div>
          <div style={styles.statLabel}>Товаров</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={styles.statIcon}>🔧</div>
          <div style={styles.statNumber}>{stats.totalServices}</div>
          <div style={styles.statLabel}>Услуг</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={styles.statIcon}>🛒</div>
          <div style={styles.statNumber}>{stats.totalOrders}</div>
          <div style={styles.statLabel}>Заказов</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={styles.statIcon}>📅</div>
          <div style={styles.statNumber}>{stats.totalAppointments}</div>
          <div style={styles.statLabel}>Записей</div>
        </div>
      </div>

      {/* Ближайшие записи */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h2 className="card-title">📅 Ближайшие записи на услуги</h2>
        {stats.upcomingAppointments.length === 0 ? (
          <p className="message-empty">Нет предстоящих записей</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Дата и время</th>
                  <th>Клиент</th>
                  <th>Сотрудник</th>
                  <th>Статус</th>
                  <th>Услуги</th>
                </tr>
              </thead>
              <tbody>
                {stats.upcomingAppointments.map((app) => (
                  <tr key={app.id}>
                    <td>{new Date(app.appointment_datetime).toLocaleString('ru-RU')}</td>
                    <td>{app.client?.full_name || '—'}</td>
                    <td>{app.employee?.full_name || '—'}</td>
                    <td>
                      <span className={`badge badge-${app.status}`}>
                        {app.status === 'scheduled' ? 'Запланирована' :
                         app.status === 'confirmed' ? 'Подтверждена' :
                         app.status === 'cancelled' ? 'Отменена' : app.status}
                      </span>
                    </td>
                    <td>
                      {app.services?.map(s => s.service?.name).join(', ') || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '4px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#808090',
  },
  statIcon: {
    fontSize: '36px',
    marginBottom: '8px',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  statLabel: {
    fontSize: '14px',
    color: '#808090',
    marginTop: '4px',
  },
};

export default Dashboard;