import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8002/orders';

function OrdersApp() {
  const [orders, setOrders] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ user_id: 1, product_name: '', quantity: 1 });
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
  });

  const fetchOrders = async () => {
    try {
      const res = await fetch(API_URL + '/', { headers: getHeaders() });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await fetch('http://localhost:8003/catalog/', { headers: getHeaders() });
      const data = await res.json();
      setCatalog(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        setForm(f => ({ ...f, product_name: data[0].name }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrderById = async () => {
    if (!searchId) return;
    try {
      const res = await fetch(`${API_URL}/${searchId}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSearchResult(data);
      } else {
        alert('Pedido não encontrado.');
        setSearchResult(null);
      }
    } catch (e) {
      alert('Erro na busca.');
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCatalog();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch(API_URL + '/', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(form)
    });
    fetchOrders();
    setForm({ ...form, quantity: 1 });
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    fetchOrders();
  };

  const filteredOrders = filterStatus ? orders.filter(o => o.status === filterStatus) : orders;

  return (
    <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white' }}>
      <h3 style={{marginTop: 0}}>Gestão de Pedidos </h3>

      {/* Busca por ID */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', background: '#f4f4f4', padding: '1rem', borderRadius: 8 }}>
        <input 
          placeholder="ID do Pedido (Ex: 1)" 
          style={{ padding: '0.5rem', flex: 1, borderRadius: 4, border: '1px solid #ccc' }} 
          value={searchId} 
          onChange={e => setSearchId(e.target.value)} 
        />
        <button 
          onClick={fetchOrderById} 
          style={{ padding: '0.5rem 1rem', background: '#333', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          🔍 Consultar por ID
        </button>
      </div>

      {searchResult && (
        <div style={{ marginBottom: '1rem', padding: '1rem', border: '2px solid #28a745', borderRadius: 8, background: '#e9f7ef' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>Resultado da Busca (ID: {searchResult.id})</h4>
            <button onClick={() => setSearchResult(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontWeight: 'bold' }}>X Fechar</button>
          </div>
          <p><strong>Produto:</strong> {searchResult.product_name} | <strong>Quantidade:</strong> {searchResult.quantity} | <strong>Status:</strong> {searchResult.status}</p>
        </div>
      )}

      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '4px' }}>
        <h4 style={{marginTop: 0}}>Novo Pedido (Usuário Fixo #1)</h4>
        <form onSubmit={handleCreate}>
          <select value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} required style={{marginRight: '0.5rem', padding: '0.3rem'}}>
            {catalog.map(item => (
              <option key={item.id} value={item.name}>{item.name} - R${item.price.toFixed(2)}</option>
            ))}
          </select>
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
