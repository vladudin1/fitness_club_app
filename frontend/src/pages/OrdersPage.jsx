import { useState, useEffect } from 'react';
import api from '../services/api';

function OrdersPage() {
  const userRole = localStorage.getItem('role');
  const canCreate = userRole === 'admin' || userRole === 'manager' || userRole === 'client';
  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canDelete = userRole === 'admin';

  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    order_date: new Date().toISOString().split('T')[0],
    delivery_method: 'Самовывоз',
    delivery_cost: '0',
    recipient_name: '',
    recipient_address: '',
    items: [],
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchEmployees();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/');
      setOrders(response.data);
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees/');
      setEmployees(response.data);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/');
      setProducts(response.data);
    } catch (err) { console.error(err); }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setEditingId(null);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      employee_id: employees[0]?.id || '',
      order_date: new Date().toISOString().split('T')[0],
      delivery_method: 'Самовывоз',
      delivery_cost: '0',
      recipient_name: '',
      recipient_address: '',
      items: [],
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedOrder) { alert('Сначала выберите заказ'); return; }
    if (!window.confirm(`Удалить заказ №${selectedOrder.id}?`)) return;
    try {
      await api.delete(`/orders/${selectedOrder.id}`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) { alert('Ошибка при удалении'); }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: products[0]?.id || '', price: '0', quantity: '1', discount: '0' }],
    });
  };

  const removeItem = (index) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    if (field === 'product_id') {
      const product = products.find(p => p.id === parseInt(value));
      if (product) newItems[index].price = product.selling_price;
    }
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        employee_id: parseInt(formData.employee_id),
        delivery_cost: parseFloat(formData.delivery_cost) || 0,
        items: formData.items.map(item => ({
          product_id: parseInt(item.product_id),
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 1,
          discount: parseFloat(item.discount) || 0,
        })),
      };
      await api.post('/orders/', payload);
      setShowModal(false);
      fetchOrders();
    } catch (err) { alert('Ошибка при сохранении'); }
  };

   const totalOrderSum = (order) => {
    if (!order || !order.items || !Array.isArray(order.items) || order.items.length === 0) return 0;
    let sum = 0;
    for (const item of order.items) {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      const discount = Number(item.discount) || 0;
      sum += price * qty * (1 - discount / 100);
    }
    sum += Number(order.delivery_cost) || 0;
    return sum;
  };

  return (
    <div>
      <h1 style={styles.pageTitle}>🛒 Заказы</h1>

      <div className="card" style={styles.toolbar}>
        <div></div>
        <div style={styles.actions}>
          {canCreate && <button onClick={openCreateModal} className="btn btn-success">+ Создать заказ</button>}
          {canDelete && <button onClick={handleDelete} className="btn btn-danger" disabled={!selectedOrder}>✕ Удалить</button>}
        </div>
      </div>

      {selectedOrder && (
        <div className="card">
          <h2 className="card-title">Заказ №{selectedOrder.id}</h2>
          <div className="grid-2">
            <div><strong>Дата:</strong> {selectedOrder.order_date || '—'}</div>
            <div><strong>Получатель:</strong> {selectedOrder.recipient_name || '—'}</div>
            <div><strong>Доставка:</strong> {selectedOrder.delivery_method || '—'}</div>
            <div><strong>Стоимость доставки:</strong> {selectedOrder.delivery_cost || 0} руб.</div>
            <div><strong>Сумма заказа:</strong> {Number(totalOrderSum(selectedOrder)).toFixed(2)} руб.</div>
          </div>
          {selectedOrder.items && selectedOrder.items.length > 0 && (
            <div className="table-container" style={{ marginTop: '12px' }}>
              <table>
                <thead><tr><th>Товар</th><th>Цена</th><th>Кол-во</th><th>Скидка</th><th>Сумма</th></tr></thead>
                <tbody>
                  {selectedOrder.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.product?.name || `Товар №${item.product_id}`}</td>
                      <td>{item.price} руб.</td>
                      <td>{item.quantity}</td>
                      <td>{item.discount}%</td>
                      <td>{(item.price * item.quantity * (1 - item.discount / 100)).toFixed(2)} руб.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr><th>ID</th><th>Дата</th><th>Получатель</th><th>Доставка</th><th>Сумма</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="message-empty">Загрузка...</td></tr> :
             orders.length === 0 ? <tr><td colSpan={5} className="message-empty">Заказов нет</td></tr> :
             orders.map(o => (
               <tr key={o.id} onClick={() => handleSelectOrder(o)} style={{ cursor: 'pointer', backgroundColor: selectedOrder?.id === o.id ? '#e6f7ff' : 'transparent' }}>
                 <td>{o.id}</td>
                 <td>{o.order_date || '—'}</td>
                 <td>{o.recipient_name || '—'}</td>
                 <td>{o.delivery_method || '—'}</td>
                 <td>{Number(totalOrderSum(o)).toFixed(2)} руб.</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <h2 className="modal-title">Создать заказ</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Сотрудник *</label>
                  <select className="form-control" value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })} required>
                    <option value="">— Выберите —</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Дата заказа</label>
                  <input type="date" className="form-control" value={formData.order_date} onChange={(e) => setFormData({ ...formData, order_date: e.target.value })} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Способ доставки</label>
                  <select className="form-control" value={formData.delivery_method} onChange={(e) => setFormData({ ...formData, delivery_method: e.target.value })}>
                    <option value="Самовывоз">Самовывоз</option>
                    <option value="Доставка">Доставка</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Стоимость доставки</label>
                  <input type="number" className="form-control" value={formData.delivery_cost} onChange={(e) => setFormData({ ...formData, delivery_cost: e.target.value })} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Получатель</label>
                  <input type="text" className="form-control" value={formData.recipient_name} onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Адрес доставки</label>
                  <input type="text" className="form-control" value={formData.recipient_address} onChange={(e) => setFormData({ ...formData, recipient_address: e.target.value })} />
                </div>
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '12px' }}>Товары в заказе</h3>
              {formData.items.map((item, index) => (
                <div key={index} className="grid-3" style={{ alignItems: 'end', marginBottom: '8px', gap: '8px' }}>
                  <div className="form-group">
                    <label>Товар</label>
                    <select className="form-control" value={item.product_id} onChange={(e) => updateItem(index, 'product_id', e.target.value)}>
                      <option value="">— Выберите —</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.selling_price} руб.)</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Цена</label>
                    <input type="number" className="form-control" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Кол-во</label>
                    <input type="number" className="form-control" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Скидка %</label>
                    <input type="number" className="form-control" value={item.discount} onChange={(e) => updateItem(index, 'discount', e.target.value)} />
                  </div>
                  <button type="button" onClick={() => removeItem(index)} className="btn btn-danger" style={{ height: '36px' }}>✕</button>
                </div>
              ))}
              <button type="button" onClick={addItem} className="btn btn-secondary">+ Добавить товар</button>

              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Отмена</button>
                <button type="submit" className="btn btn-success">Создать заказ</button>
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

export default OrdersPage;