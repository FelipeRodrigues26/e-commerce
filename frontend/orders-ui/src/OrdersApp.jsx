import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8002/orders';

function OrdersApp() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ user_id: 1, product_name: '', quantity: 1 });

  const fetchOrders = async () => {
    try {
      const res = await fetch(API_URL + '/');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch(API_URL + '/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    fetchOrders();
    setForm({ ...form, product_name: '', quantity: 1 });
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchOrders();
  };

  const filteredOrders = filterStatus ? orders.filter(o => o.status === filterStatus) : orders;

  return (
    <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white' }}>
      <h3 style={{marginTop: 0}}>Gestão de Pedidos (MFE Remoto)</h3>

      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '4px' }}>
        <h4 style={{marginTop: 0}}>Novo Pedido (Usuário Fixo #1)</h4>
        <form onSubmit={handleCreate}>
          <input placeholder="Nome do Produto" value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} required style={{marginRight: '0.5rem', padding: '0.3rem'}}/>
          <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: parseInt(e.target.value)})} min="1" required style={{marginRight: '0.5rem', width: '60px', padding: '0.3rem'}}/>
          <button type="submit" style={{padding: '0.3rem 1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Criar Pedido</button>
        </form>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{fontWeight: 'bold', marginRight: '0.5rem'}}>Filtrar por Status: </label>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{padding: '0.3rem'}}>
          <option value="">Todos</option>
          <option value="PENDING">PENDING</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
        </select>
      </div>

      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th style={{padding: '0.5rem', borderBottom: '2px solid #ccc'}}>ID</th>
            <th style={{padding: '0.5rem', borderBottom: '2px solid #ccc'}}>Produto</th>
            <th style={{padding: '0.5rem', borderBottom: '2px solid #ccc'}}>Qtd</th>
            <th style={{padding: '0.5rem', borderBottom: '2px solid #ccc'}}>Status</th>
            <th style={{padding: '0.5rem', borderBottom: '2px solid #ccc'}}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 && (
            <tr><td colSpan="5" style={{padding: '1rem', textAlign: 'center'}}>Nenhum pedido encontrado.</td></tr>
          )}
          {filteredOrders.map(o => (
            <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{padding: '0.5rem'}}>{o.id}</td>
              <td style={{padding: '0.5rem'}}>{o.product_name}</td>
              <td style={{padding: '0.5rem'}}>{o.quantity}</td>
              <td style={{padding: '0.5rem'}}>
                <span style={{padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem', background: o.status === 'PENDING' ? '#ffd700' : o.status === 'SHIPPED' ? '#87ceeb' : '#90ee90'}}>{o.status}</span>
              </td>
              <td style={{padding: '0.5rem'}}>
                <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
                  <option value="PENDING">Pendente</option>
                  <option value="SHIPPED">Enviado</option>
                  <option value="DELIVERED">Entregue</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrdersApp;
