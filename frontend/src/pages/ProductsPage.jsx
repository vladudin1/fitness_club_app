import { useState, useEffect } from 'react';
import api from '../services/api';

function ProductsPage() {
  const userRole = localStorage.getItem('role');
  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canDelete = userRole === 'admin';

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    purchase_price: '',
    selling_price: '',
    quantity_in_stock: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (searchTerm = '') => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      const response = await api.get('/products/', { params });
      setProducts(response.data);
    } catch (err) {
      console.error('Ошибка загрузки товаров:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    fetchProducts(e.target.value);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setEditingId(null);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '', category: '', purchase_price: '', selling_price: '', quantity_in_stock: '' });
    setShowModal(true);
  };

  const openEditModal = () => {
    if (!selectedProduct) {
      alert('Сначала найдите и выберите товар для редактирования');
      return;
    }
    setEditingId(selectedProduct.id);
    setFormData({
      name: selectedProduct.name || '',
      category: selectedProduct.category || '',
      purchase_price: selectedProduct.purchase_price || '',
      selling_price: selectedProduct.selling_price || '',
      quantity_in_stock: selectedProduct.quantity_in_stock || '',
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedProduct) {
      alert('Сначала найдите и выберите товар для удаления');
      return;
    }
    if (!window.confirm(`Удалить товар "${selectedProduct.name}"?`)) return;
    try {
      await api.delete(`/products/${selectedProduct.id}`);
      setSelectedProduct(null);
      fetchProducts(search);
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
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
        selling_price: formData.selling_price ? parseFloat(formData.selling_price) : null,
        quantity_in_stock: formData.quantity_in_stock ? parseInt(formData.quantity_in_stock) : null,
      };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products/', payload);
      }
      setShowModal(false);
      fetchProducts(search);
      if (editingId) setSelectedProduct(null);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      alert('Ошибка при сохранении');
    }
  };

  return (
    <div>
      <h1 style={styles.pageTitle}>📦 Товары</h1>

      <div className="card" style={styles.toolbar}>
        <div style={styles.searchRow}>
          <input type="text" className="form-control" placeholder="Поиск по названию..." value={search} onChange={handleSearchChange} style={{ flex: 1, maxWidth: '400px' }} />
        </div>
        <div style={styles.actions}>
          {canEdit && (
            <>
              <button onClick={openCreateModal} className="btn btn-success">+ Создать</button>
              <button onClick={openEditModal} className="btn btn-warning" disabled={!selectedProduct}>✎ Редактировать</button>
            </>
          )}
          {canDelete && (
            <button onClick={handleDelete} className="btn btn-danger" disabled={!selectedProduct}>✕ Удалить</button>
          )}
        </div>
      </div>

      {selectedProduct && (
        <div className="card">
          <h2 className="card-title">Выбран: {selectedProduct.name}</h2>
          <div className="grid-2">
            <div><strong>ID:</strong> {selectedProduct.id}</div>
            <div><strong>Категория:</strong> {selectedProduct.category || '—'}</div>
            <div><strong>Цена закупки:</strong> {selectedProduct.purchase_price || '—'} руб.</div>
            <div><strong>Цена продажи:</strong> {selectedProduct.selling_price || '—'} руб.</div>
            <div><strong>На складе:</strong> {selectedProduct.quantity_in_stock || 0} шт.</div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена продажи</th>
              <th>На складе</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="message-empty">Загрузка...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="message-empty">Товары не найдены</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} onClick={() => handleSelectProduct(p)} style={{ cursor: 'pointer', backgroundColor: selectedProduct?.id === p.id ? '#e6f7ff' : 'transparent' }}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.category || '—'}</td>
                  <td>{p.selling_price ? `${p.selling_price} руб.` : '—'}</td>
                  <td>{p.quantity_in_stock ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editingId ? 'Редактировать товар' : 'Создать товар'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название *</label>
                <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Категория</label>
                <select className="form-control" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="">— Выберите —</option>
                  <option value="Абонементы">Абонементы</option>
                  <option value="Аксессуары">Аксессуары</option>
                  <option value="Питание">Питание</option>
                  <option value="Одежда">Одежда</option>
                </select>
              </div>
              <div className="grid-3">
                <div className="form-group">
                  <label>Цена закупки</label>
                  <input type="number" step="0.01" className="form-control" value={formData.purchase_price} onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Цена продажи</label>
                  <input type="number" step="0.01" className="form-control" value={formData.selling_price} onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Количество на складе</label>
                  <input type="number" className="form-control" value={formData.quantity_in_stock} onChange={(e) => setFormData({ ...formData, quantity_in_stock: e.target.value })} />
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

export default ProductsPage;