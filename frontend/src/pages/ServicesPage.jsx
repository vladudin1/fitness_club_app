import { useState, useEffect } from 'react';
import api from '../services/api';

function ServicesPage() {
  const userRole = localStorage.getItem('role');
  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canDelete = userRole === 'admin';

  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost: '',
    duration: '',
    is_available: true,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async (searchTerm = '') => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      const response = await api.get('/services/', { params });
      setServices(response.data);
    } catch (err) {
      console.error('Ошибка загрузки услуг:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    fetchServices(e.target.value);
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
    setEditingId(null);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', cost: '', duration: '', is_available: true });
    setShowModal(true);
  };

  const openEditModal = () => {
    if (!selectedService) {
      alert('Сначала найдите и выберите услугу для редактирования');
      return;
    }
    setEditingId(selectedService.id);
    setFormData({
      name: selectedService.name || '',
      description: selectedService.description || '',
      cost: selectedService.cost || '',
      duration: selectedService.duration || '',
      is_available: selectedService.is_available,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedService) {
      alert('Сначала найдите и выберите услугу для удаления');
      return;
    }
    if (!window.confirm(`Удалить услугу "${selectedService.name}"?`)) return;
    try {
      await api.delete(`/services/${selectedService.id}`);
      setSelectedService(null);
      fetchServices(search);
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Ошибка при удалении');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : null,
      };
      if (editingId) {
        await api.put(`/services/${editingId}`, payload);
      } else {
        await api.post('/services/', payload);
      }
      setShowModal(false);
      fetchServices(search);
      if (editingId) setSelectedService(null);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      alert('Ошибка при сохранении');
    }
  };

  return (
    <div>
      <h1 style={styles.pageTitle}>🔧 Услуги</h1>

      <div className="card" style={styles.toolbar}>
        <div style={styles.searchRow}>
          <input type="text" className="form-control" placeholder="Поиск по названию..." value={search} onChange={handleSearchChange} style={{ flex: 1, maxWidth: '400px' }} />
        </div>
        <div style={styles.actions}>
          {canEdit && (
            <>
              <button onClick={openCreateModal} className="btn btn-success">+ Создать</button>
              <button onClick={openEditModal} className="btn btn-warning" disabled={!selectedService}>✎ Редактировать</button>
            </>
          )}
          {canDelete && (
            <button onClick={handleDelete} className="btn btn-danger" disabled={!selectedService}>✕ Удалить</button>
          )}
        </div>
      </div>

      {selectedService && (
        <div className="card">
          <h2 className="card-title">Выбрана: {selectedService.name}</h2>
          <div className="grid-2">
            <div><strong>ID:</strong> {selectedService.id}</div>
            <div><strong>Стоимость:</strong> {selectedService.cost || '—'} руб.</div>
            <div><strong>Длительность:</strong> {selectedService.duration || '—'}</div>
            <div><strong>Статус:</strong> <span className={`badge ${selectedService.is_available ? 'badge-active' : 'badge-inactive'}`}>{selectedService.is_available ? 'Доступна' : 'Недоступна'}</span></div>
            <div><strong>Описание:</strong> {selectedService.description || '—'}</div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Стоимость</th>
              <th>Длительность</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="message-empty">Загрузка...</td></tr>
            ) : services.length === 0 ? (
              <tr><td colSpan={5} className="message-empty">Услуги не найдены</td></tr>
            ) : (
              services.map((s) => (
                <tr key={s.id} onClick={() => handleSelectService(s)} style={{ cursor: 'pointer', backgroundColor: selectedService?.id === s.id ? '#e6f7ff' : 'transparent' }}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.cost ? `${s.cost} руб.` : '—'}</td>
                  <td>{s.duration || '—'}</td>
                  <td><span className={`badge ${s.is_available ? 'badge-active' : 'badge-inactive'}`}>{s.is_available ? 'Доступна' : 'Недоступна'}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editingId ? 'Редактировать услугу' : 'Создать услугу'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название *</label>
                <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea className="form-control" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Стоимость (руб.)</label>
                  <input type="number" step="0.01" className="form-control" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Длительность</label>
                  <select className="form-control" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })}>
                    <option value="">— Выберите —</option>
                    <option value="30 мин">30 мин</option>
                    <option value="45 мин">45 мин</option>
                    <option value="60 мин">60 мин</option>
                    <option value="90 мин">90 мин</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" checked={formData.is_available} onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })} style={{ marginRight: '8px' }} />
                  Доступна
                </label>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Отмена</button>
                <button type="submit" className="btn btn-success">{editingId ? 'Сохранить' : 'Создать'}</button>
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
  searchRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  actions: { display: 'flex', gap: '8px' },
};

export default ServicesPage;