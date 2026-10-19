import { useState, useEffect } from 'react';
import api from '../services/api';

function EmployeesPage() {
  const userRole = localStorage.getItem('role');
  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canDelete = userRole === 'admin';

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    position: '',
    birth_date: '',
    hire_date: '',
    address: '',
    postal_code: '',
    country: '',
    phone: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async (searchTerm = '') => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      const response = await api.get('/employees/', { params });
      setEmployees(response.data);
    } catch (err) {
      console.error('Ошибка загрузки сотрудников:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchEmployees(search);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    fetchEmployees(e.target.value);
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEditingId(null);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      full_name: '',
      position: '',
      birth_date: '',
      hire_date: '',
      address: '',
      postal_code: '',
      country: '',
      phone: '',
    });
    setShowModal(true);
  };

  const openEditModal = () => {
    if (!selectedEmployee) {
      alert('Сначала найдите и выберите сотрудника для редактирования');
      return;
    }
    setEditingId(selectedEmployee.id);
    setFormData({
      full_name: selectedEmployee.full_name || '',
      position: selectedEmployee.position || '',
      birth_date: selectedEmployee.birth_date || '',
      hire_date: selectedEmployee.hire_date || '',
      address: selectedEmployee.address || '',
      postal_code: selectedEmployee.postal_code || '',
      country: selectedEmployee.country || '',
      phone: selectedEmployee.phone || '',
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedEmployee) {
      alert('Сначала найдите и выберите сотрудника для удаления');
      return;
    }
    if (!window.confirm(`Удалить сотрудника "${selectedEmployee.full_name}"?`)) return;
    try {
      await api.delete(`/employees/${selectedEmployee.id}`);
      setSelectedEmployee(null);
      fetchEmployees(search);
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Ошибка при удалении');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, formData);
      } else {
        await api.post('/employees/', formData);
      }
      setShowModal(false);
      fetchEmployees(search);
      if (editingId) setSelectedEmployee(null);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      alert('Ошибка при сохранении');
    }
  };

  return (
    <div>
      <h1 style={styles.pageTitle}>👨‍💼 Сотрудники</h1>

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
          <button onClick={handleSearch} className="btn btn-primary">Найти</button>
        </div>
        <div style={styles.actions}>
          {canEdit && (
            <>
              <button onClick={openCreateModal} className="btn btn-success">+ Создать</button>
              <button onClick={openEditModal} className="btn btn-warning" disabled={!selectedEmployee}>✎ Редактировать</button>
            </>
          )}
          {canDelete && (
            <button onClick={handleDelete} className="btn btn-danger" disabled={!selectedEmployee}>✕ Удалить</button>
          )}
        </div>
      </div>

      {selectedEmployee && (
        <div className="card">
          <h2 className="card-title">Выбран: {selectedEmployee.full_name}</h2>
          <div className="grid-2">
            <div><strong>ID:</strong> {selectedEmployee.id}</div>
            <div><strong>Должность:</strong> {selectedEmployee.position || '—'}</div>
            <div><strong>Телефон:</strong> {selectedEmployee.phone || '—'}</div>
            <div><strong>Дата найма:</strong> {selectedEmployee.hire_date || '—'}</div>
            <div><strong>Адрес:</strong> {selectedEmployee.address || '—'}</div>
            <div><strong>Страна:</strong> {selectedEmployee.country || '—'}</div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>ФИО</th>
              <th>Должность</th>
              <th>Телефон</th>
              <th>Дата найма</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="message-empty">Загрузка...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={5} className="message-empty">Сотрудники не найдены</td></tr>
            ) : (
              employees.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => handleSelectEmployee(emp)}
                  style={{ cursor: 'pointer', backgroundColor: selectedEmployee?.id === emp.id ? '#e6f7ff' : 'transparent' }}
                >
                  <td>{emp.id}</td>
                  <td>{emp.full_name}</td>
                  <td>{emp.position || '—'}</td>
                  <td>{emp.phone || '—'}</td>
                  <td>{emp.hire_date || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editingId ? 'Редактировать сотрудника' : 'Создать сотрудника'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>ФИО *</label>
                <input type="text" className="form-control" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Должность</label>
                  <input type="text" className="form-control" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Телефон</label>
                  <input type="text" className="form-control" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Дата рождения</label>
                  <input type="date" className="form-control" value={formData.birth_date} onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Дата найма</label>
                  <input type="date" className="form-control" value={formData.hire_date} onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Адрес</label>
                <input type="text" className="form-control" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="grid-3">
                <div className="form-group">
                  <label>Индекс</label>
                  <input type="text" className="form-control" value={formData.postal_code} onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Страна</label>
                  <input type="text" className="form-control" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                </div>
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

export default EmployeesPage;