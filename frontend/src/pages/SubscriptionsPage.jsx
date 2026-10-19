import { useState, useEffect } from 'react';
import api from '../services/api';

function SubscriptionsPage() {
  const userRole = localStorage.getItem('role');
  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canDelete = userRole === 'admin';

  const [subscriptions, setSubscriptions] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    product_id: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [subRes, cliRes, prodRes] = await Promise.all([
        api.get('/subscriptions/'),
        api.get('/clients/'),
        api.get('/products/'),
      ]);
      setSubscriptions(subRes.data);
      setClients(cliRes.data);
      setProducts(prodRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSelect = (sub) => setSelectedSubscription(sub);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ client_id: clients[0]?.id || '', product_id: products[0]?.id || '', start_date: '', end_date: '', is_active: true });
    setShowModal(true);
  };

  const openEditModal = () => {
    if (!selectedSubscription) { alert('Сначала выберите абонемент'); return; }
    setEditingId(selectedSubscription.id);
    setFormData({
      client_id: selectedSubscription.client_id,
      product_id: selectedSubscription.product_id,
      start_date: selectedSubscription.start_date || '',
      end_date: selectedSubscription.end_date || '',
      is_active: selectedSubscription.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedSubscription) { alert('Сначала выберите абонемент'); return; }
    if (!window.confirm('Удалить абонемент?')) return;
    try {
      await api.delete(`/subscriptions/${selectedSubscription.id}`);
      setSelectedSubscription(null);
      fetchAll();
    } catch (err) { alert('Ошибка при удалении'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, client_id: parseInt(formData.client_id), product_id: parseInt(formData.product_id) };
      if (editingId) {
        await api.put(`/subscriptions/${editingId}`, payload);
      } else {
        await api.post('/subscriptions/', payload);
      }
      setShowModal(false);
      fetchAll();
      if (editingId) setSelectedSubscription(null);
    } catch (err) { alert('Ошибка при сохранении'); }
  };

  return (
    <div>
      <h1 style={styles.pageTitle}>🎫 Абонементы</h1>
      <div className="card" style={styles.toolbar}>
        <div></div>
        <div style={styles.actions}>
          {canEdit && <><button onClick={openCreateModal} className="btn btn-success">+ Создать</button><button onClick={openEditModal} className="btn btn-warning" disabled={!selectedSubscription}>✎ Редактировать</button></>}
          {canDelete && <button onClick={handleDelete} className="btn btn-danger" disabled={!selectedSubscription}>✕ Удалить</button>}
        </div>
      </div>

      {selectedSubscription && (
        <div className="card">
          <h2 className="card-title">Абонемент №{selectedSubscription.id}</h2>
          <div className="grid-2">
            <div><strong>Клиент:</strong> {selectedSubscription.client?.full_name || '—'}</div>
            <div><strong>Товар:</strong> {selectedSubscription.product?.name || '—'}</div>
            <div><strong>Начало:</strong> {selectedSubscription.start_date || '—'}</div>
            <div><strong>Окончание:</strong> {selectedSubscription.end_date || '—'}</div>
            <div><strong>Статус:</strong> <span className={`badge ${selectedSubscription.is_active ? 'badge-active' : 'badge-inactive'}`}>{selectedSubscription.is_active ? 'Активен' : 'Неактивен'}</span></div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead><tr><th>ID</th><th>Клиент</th><th>Товар</th><th>Начало</th><th>Окончание</th><th>Статус</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="message-empty">Загрузка...</td></tr> :
             subscriptions.length === 0 ? <tr><td colSpan={6} className="message-empty">Абонементов нет</td></tr> :
             subscriptions.map(s => (
               <tr key={s.id} onClick={() => handleSelect(s)} style={{ cursor: 'pointer', backgroundColor: selectedSubscription?.id === s.id ? '#e6f7ff' : 'transparent' }}>
                 <td>{s.id}</td><td>{s.client?.full_name || '—'}</td><td>{s.product?.name || '—'}</td>
                 <td>{s.start_date || '—'}</td><td>{s.end_date || '—'}</td>
                 <td><span className={`badge ${s.is_active ? 'badge-active' : 'badge-inactive'}`}>{s.is_active ? 'Активен' : 'Неактивен'}</span></td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editingId ? 'Редактировать абонемент' : 'Создать абонемент'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group"><label>Клиент *</label><select className="form-control" value={formData.client_id} onChange={(e) => setFormData({ ...formData, client_id: e.target.value })} required><option value="">— Выберите —</option>{clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}</select></div>
                <div className="form-group"><label>Товар *</label><select className="form-control" value={formData.product_id} onChange={(e) => setFormData({ ...formData, product_id: e.target.value })} required><option value="">— Выберите —</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Дата начала</label><input type="date" className="form-control" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} /></div>
                <div className="form-group"><label>Дата окончания</label><input type="date" className="form-control" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} /></div>
              </div>
              <div className="form-group"><label><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} style={{ marginRight: '8px' }} />Активен</label></div>
              <div className="form-actions"><button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Отмена</button><button type="submit" className="btn btn-success">{editingId ? 'Сохранить' : 'Создать'}</button></div>
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

export default SubscriptionsPage;