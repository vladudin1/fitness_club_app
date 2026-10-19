import { useState, useEffect } from 'react';
import api from '../services/api';

function ClientsPage() {
  const userRole = localStorage.getItem('role');
  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canDelete = userRole === 'admin';

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    phone: '',
    is_active: true,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async (searchTerm = '') => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      const response = await api.get('/clients/', { params });
      setClients(response.data);
    } catch (err) {
      console.error('Ошибка загрузки клиентов:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchClients(search);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    // Автопоиск при изменении
    fetchClients(e.target.value);
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setEditingId(null);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      full_name: '',
      birth_date: '',
      address: '',
      city: '',
      postal_code: '',
      country: '',
      phone: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = () => {
    if (!selectedClient) {
      alert('Сначала найдите и выберите клиента для редактирования');
      return;
    }
    setEditingId(selectedClient.id);
    setFormData({
      full_name: selectedClient.full_name || '',
      birth_date: selectedClient.birth_date || '',
      address: selectedClient.address || '',
      city: selectedClient.city || '',
      postal_code: selectedClient.postal_code || '',
      country: selectedClient.country || '',
      phone: selectedClient.phone || '',
      is_active: selectedClient.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedClient) {
      alert('Сначала найдите и выберите клиента для удаления');
      return;
    }
    if (!window.confirm(`Удалить клиента "${selectedClient.full_name}"?`)) return;
    try {
      await api.delete(`/clients/${selectedClient.id}`);
      setSelectedClient(null);
      fetchClients(search);
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Ошибка при удалении');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, formData);
      } else {
        await api.post('/clients/', formData);
      }
      setShowModal(false);
      fetchClients(search);
      if (editingId) setSelectedClient(null);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      alert('Ошибка при сохранении');
    }
  };

  return (
    <div>
      <h1 style={styles.pageTitle}>👥 Клиенты</h1>

      {/* Панель поиска и действий */}
      <div className="card" style={styles.toolbar}>
        <div style={styles.searchRow}>
          <input
            type="text"
            className="form-control"
            placeholder="Поиск по ФИО..."
            value={search}
            onChange={handleSearchChange}
            style={{ flex: 1, maxWidth: '400px' }}
          />
          <button onClick={handleSearch} className="btn btn-primary">
            Найти
          </button>
        </div>
        <div style={styles.actions}>
          {canEdit && (
            <>
              <button onClick={openCreateModal} className="btn btn-success">
                + Создать
              </button>
              <button onClick={openEditModal} className="btn btn-warning" disabled={!selectedClient}>
                ✎ Редактировать
              </button>
            </>
          )}
          {canDelete && (
            <button onClick={handleDelete} className="btn btn-danger" disabled={!selectedClient}>
              ✕ Удалить
            </button>
          )}
        </div>
      </div>

      {/* Информация о выбранном клиенте */}
      {selectedClient && (
        <div className="card">
          <h2 className="card-title">Выбран: {selectedClient.full_name}</h2>
          <div className="grid-2">
            <div><strong>ID:</strong> {selectedClient.id}</div>
            <div><strong>Телефон:</strong> {selectedClient.phone || '—'}</div>
            <div><strong>Город:</strong> {selectedClient.city || '—'}</div>
            <div><strong>Страна:</strong> {selectedClient.country || '—'}</div>
            <div><strong>Адрес:</strong> {selectedClient.address || '—'}</div>
            <div>
              <strong>Статус:</strong>{' '}
              <span className={`badge ${selectedClient.is_active ? 'badge-active' : 'badge-inactive'}`}>
                {selectedClient.is_active ? 'Активен' : 'Неактивен'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Таблица клиентов */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>ФИО</th>
              <th>Город</th>
              <th>Телефон</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="message-empty">Загрузка...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan={5} className="message-empty">Клиенты не найдены</td></tr>
            ) : (
              clients.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedClient?.id === client.id ? '#e6f7ff' : 'transparent',
                  }}
                >
                  <td>{client.id}</td>
                  <td>{client.full_name}</td>
                  <td>{client.city || '—'}</td>
                  <td>{client.phone || '—'}</td>
                  <td>
                    <span className={`badge ${client.is_active ? 'badge-active' : 'badge-inactive'}`}>
                      {client.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Модальное окно создания/редактирования */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {editingId ? 'Редактировать клиента' : 'Создать клиента'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>ФИО *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Дата рождения</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Телефон</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Адрес</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid-3">
                <div className="form-group">
                  <label>Город</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Индекс</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Страна</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ marginRight: '8px' }}
                  />
                  Активен
                </label>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Отмена
                </button>
                <button type="submit" className="btn btn-success">
                  {editingId ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '16px',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '16px',
  },
  searchRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
};

export default ClientsPage;