import { useState, useEffect } from 'react';
import api from '../services/api';

function AppointmentsPage() {
  const userRole = localStorage.getItem('role');
  const canCreate = userRole === 'admin' || userRole === 'manager' || userRole === 'client';
  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canDelete = userRole === 'admin';

  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    employee_id: '',
    appointment_datetime: '',
    status: 'scheduled',
    services: [],
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [appRes, cliRes, empRes, srvRes] = await Promise.all([
        api.get('/appointments/'),
        api.get('/clients/'),
        api.get('/employees/'),
        api.get('/services/'),
      ]);
      setAppointments(appRes.data);
      setClients(cliRes.data);
      setEmployees(empRes.data);
      setServices(srvRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSelect = (app) => setSelectedAppointment(app);

  const openCreateModal = () => {
    setFormData({
      client_id: clients[0]?.id || '',
      employee_id: employees[0]?.id || '',
      appointment_datetime: new Date().toISOString().slice(0, 16),
      status: 'scheduled',
      services: [],
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedAppointment) { alert('Сначала выберите запись'); return; }
    if (!window.confirm('Удалить запись?')) return;
    try {
      await api.delete(`/appointments/${selectedAppointment.id}`);
      setSelectedAppointment(null);
      fetchAll();
    } catch (err) { alert('Ошибка при удалении'); }
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { service_id: services[0]?.id || '', price: '0', quantity: '1', discount: '0', appointment_date: new Date().toISOString().split('T')[0] }],
    });
  };

  const removeService = (i) => {
    setFormData({ ...formData, services: formData.services.filter((_, idx) => idx !== i) });
  };

  const updateService = (i, field, value) => {
    const arr = [...formData.services];
    arr[i][field] = value;
    if (field === 'service_id') {
      const srv = services.find(s => s.id === parseInt(value));
      if (srv) arr[i].price = srv.cost;
    }
    setFormData({ ...formData, services: arr });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        client_id: parseInt(formData.client_id),
        employee_id: parseInt(formData.employee_id),
        appointment_datetime: formData.appointment_datetime,
        status: formData.status,
        services: formData.services.map(s => ({
          service_id: parseInt(s.service_id),
          price: parseFloat(s.price) || 0,
          quantity: parseInt(s.quantity) || 1,
          discount: parseFloat(s.discount) || 0,
          appointment_date: s.appointment_date,
        })),
      };
      await api.post('/appointments/', payload);
      setShowModal(false);
      fetchAll();
    } catch (err) { alert('Ошибка при сохранении'); }
  };

  return (
    <div>
      <h1 style={styles.pageTitle}>📅 Записи на услуги</h1>

      <div className="card" style={styles.toolbar}>
        <div></div>
        <div style={styles.actions}>
          {canCreate && <button onClick={openCreateModal} className="btn btn-success">+ Создать запись</button>}
          {canDelete && <button onClick={handleDelete} className="btn btn-danger" disabled={!selectedAppointment}>✕ Удалить</button>}
        </div>
      </div>

      {selectedAppointment && (
        <div className="card">
          <h2 className="card-title">Запись №{selectedAppointment.id}</h2>
          <div className="grid-2">
            <div><strong>Клиент:</strong> {selectedAppointment.client?.full_name || '—'}</div>
            <div><strong>Сотрудник:</strong> {selectedAppointment.employee?.full_name || '—'}</div>
            <div><strong>Дата/время:</strong> {selectedAppointment.appointment_datetime ? new Date(selectedAppointment.appointment_datetime).toLocaleString('ru-RU') : '—'}</div>
            <div><strong>Статус:</strong> <span className={`badge badge-${selectedAppointment.status}`}>{selectedAppointment.status}</span></div>
          </div>
          {selectedAppointment.services?.length > 0 && (
            <div className="table-container" style={{ marginTop: '12px' }}>
              <table>
                <thead><tr><th>Услуга</th><th>Цена</th><th>Кол-во</th><th>Скидка</th></tr></thead>
                <tbody>
                  {selectedAppointment.services.map((s, i) => (
                    <tr key={i}><td>{s.service?.name || `Услуга №${s.service_id}`}</td><td>{s.price} руб.</td><td>{s.quantity}</td><td>{s.discount}%</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="table-container">
        <table>
          <thead><tr><th>ID</th><th>Клиент</th><th>Сотрудник</th><th>Дата/время</th><th>Статус</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="message-empty">Загрузка...</td></tr> :
             appointments.length === 0 ? <tr><td colSpan={5} className="message-empty">Записей нет</td></tr> :
             appointments.map(a => (
               <tr key={a.id} onClick={() => handleSelect(a)} style={{ cursor: 'pointer', backgroundColor: selectedAppointment?.id === a.id ? '#e6f7ff' : 'transparent' }}>
                 <td>{a.id}</td>
                 <td>{a.client?.full_name || '—'}</td>
                 <td>{a.employee?.full_name || '—'}</td>
                 <td>{a.appointment_datetime ? new Date(a.appointment_datetime).toLocaleString('ru-RU') : '—'}</td>
                 <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <h2 className="modal-title">Создать запись</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Клиент *</label>
                  <select className="form-control" value={formData.client_id} onChange={(e) => setFormData({ ...formData, client_id: e.target.value })} required>
                    <option value="">— Выберите —</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Сотрудник *</label>
                  <select className="form-control" value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })} required>
                    <option value="">— Выберите —</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Дата и время</label>
                  <input type="datetime-local" className="form-control" value={formData.appointment_datetime} onChange={(e) => setFormData({ ...formData, appointment_datetime: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Статус</label>
                  <select className="form-control" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="scheduled">Запланирована</option>
                    <option value="confirmed">Подтверждена</option>
                    <option value="cancelled">Отменена</option>
                  </select>
                </div>
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '12px' }}>Услуги</h3>
              {formData.services.map((s, i) => (
                <div key={i} className="grid-3" style={{ alignItems: 'end', marginBottom: '8px', gap: '8px' }}>
                  <div className="form-group">
                    <label>Услуга</label>
                    <select className="form-control" value={s.service_id} onChange={(e) => updateService(i, 'service_id', e.target.value)}>
                      <option value="">— Выберите —</option>
                      {services.map(srv => <option key={srv.id} value={srv.id}>{srv.name} ({srv.cost} руб.)</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Цена</label><input type="number" className="form-control" value={s.price} onChange={(e) => updateService(i, 'price', e.target.value)} /></div>
                  <div className="form-group"><label>Кол-во</label><input type="number" className="form-control" value={s.quantity} onChange={(e) => updateService(i, 'quantity', e.target.value)} /></div>
                  <div className="form-group"><label>Скидка %</label><input type="number" className="form-control" value={s.discount} onChange={(e) => updateService(i, 'discount', e.target.value)} /></div>
                  <button type="button" onClick={() => removeService(i)} className="btn btn-danger" style={{ height: '36px' }}>✕</button>
                </div>
              ))}
              <button type="button" onClick={addService} className="btn btn-secondary">+ Добавить услугу</button>

              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Отмена</button>
                <button type="submit" className="btn btn-success">Создать запись</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageTitle: { fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '16px' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' },
  actions: { display: 'flex', gap: '8px' },
};

export default AppointmentsPage;