import { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ReportsPage() {
  const [popularServices, setPopularServices] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [ordersReport, setOrdersReport] = useState(null);
  const [appointmentsReport, setAppointmentsReport] = useState(null);
  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    setLoadingChart(true);
    try {
      const [popRes, topRes] = await Promise.all([
        api.get('/reports/popular-services').catch(() => ({ data: [] })),
        api.get('/reports/top-clients').catch(() => ({ data: [] })),
      ]);
      setPopularServices(popRes.data || []);
      setTopClients(topRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoadingChart(false); }
  };

  const fetchOrdersReport = async () => {
    setLoadingReport(true);
    try {
      const res = await api.get('/reports/orders-by-date', { params: { start_date: startDate, end_date: endDate } });
      setOrdersReport(res.data);
    } catch (err) {
      setOrdersReport({ message: 'Данных нет', orders: [] });
    } finally { setLoadingReport(false); }
  };

  const fetchAppointmentsReport = async () => {
    setLoadingReport(true);
    try {
      const res = await api.get('/reports/appointments-by-date', { params: { start_date: startDate, end_date: endDate } });
      setAppointmentsReport(res.data);
    } catch (err) {
      setAppointmentsReport({ message: 'Данных нет', appointments: [] });
    } finally { setLoadingReport(false); }
  };

  return (
    <div>
      <h1 style={styles.pageTitle}>📈 Отчёты и аналитика</h1>

      {/* Диаграмма: Популярные услуги */}
      <div className="card">
        <h2 className="card-title">🏆 Самые популярные услуги</h2>
        {popularServices.length === 0 ? (
          <p className="message-empty">Данных нет</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularServices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="service_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_quantity" name="Количество записей" fill="#1890ff" />
              <Bar dataKey="total_revenue" name="Выручка (руб.)" fill="#52c41a" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Отчёт по заказам (с параметром) */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h2 className="card-title">🛒 Отчёт по заказам за период</h2>
        <div style={styles.dateRow}>
          <label>С: </label>
          <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '180px' }} />
          <label>По: </label>
          <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '180px' }} />
          <button onClick={fetchOrdersReport} className="btn btn-primary" disabled={loadingReport}>
            {loadingReport ? 'Загрузка...' : 'Сформировать'}
          </button>
        </div>
        {ordersReport && (
          ordersReport.message === 'Данных нет' ? (
            <p className="message-empty" style={{ marginTop: '16px' }}>Данных нет</p>
          ) : (
            <div style={{ marginTop: '16px' }}>
              <p><strong>Найдено заказов:</strong> {ordersReport.count}</p>
              <div className="table-container" style={{ marginTop: '12px' }}>
                <table>
                  <thead><tr><th>ID</th><th>Дата</th><th>Получатель</th><th>Доставка</th><th>Сумма</th></tr></thead>
                  <tbody>
                    {ordersReport.orders.map(o => (
                      <tr key={o.order_id}>
                        <td>{o.order_id}</td><td>{o.order_date || '—'}</td><td>{o.recipient_name || '—'}</td>
                        <td>{o.delivery_method || '—'}</td><td>{o.total_order?.toFixed(2)} руб.</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>

      {/* Отчёт по записям (с параметром) */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h2 className="card-title">📅 Отчёт по записям за период</h2>
        <button onClick={fetchAppointmentsReport} className="btn btn-primary" disabled={loadingReport}>
          {loadingReport ? 'Загрузка...' : 'Сформировать'}
        </button>
        {appointmentsReport && (
          appointmentsReport.message === 'Данных нет' ? (
            <p className="message-empty" style={{ marginTop: '16px' }}>Данных нет</p>
          ) : (
            <div style={{ marginTop: '16px' }}>
              <p><strong>Найдено записей:</strong> {appointmentsReport.count}</p>
              <div className="table-container" style={{ marginTop: '12px' }}>
                <table>
                  <thead><tr><th>ID</th><th>Клиент</th><th>Сотрудник</th><th>Дата/время</th><th>Статус</th></tr></thead>
                  <tbody>
                    {appointmentsReport.appointments.map(a => (
                      <tr key={a.appointment_id}>
                        <td>{a.appointment_id}</td><td>{a.client_name}</td><td>{a.employee_name}</td>
                        <td>{a.datetime ? new Date(a.datetime).toLocaleString('ru-RU') : '—'}</td>
                        <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

const styles = {
  pageTitle: { fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '16px' },
  dateRow: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
};

export default ReportsPage;