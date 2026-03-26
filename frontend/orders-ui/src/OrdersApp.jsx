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

  const displayOrders = searchResult ? [searchResult] : (filterStatus ? orders.filter(o => o.status === filterStatus) : orders);

  return (
    <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white' }}>
      
      {/* Formulário de Criação - Agora no Topo */}
      <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: 8, marginBottom: '2rem', border: '1px solid #ddd' }}>
        <h3 style={{ marginTop: 0 }}>Novo Pedido</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Produto</label>
            <select 
              style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} 
              value={form.product_name} 
              onChange={e => setForm({ ...form, product_name: e.target.value })}
            >
              {catalog.map(p => (
                <option key={p.id} value={p.name}>{p.name} - ${p.price}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Qtd</label>
            <input 
              type="number" 
              style={{ padding: '0.5rem', width: 60, borderRadius: 4, border: '1px solid #ccc' }} 
              value={form.quantity} 
              onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) })} 
              min="1" 
            />
          </div>
          <button style={{ alignSelf: 'flex-end', padding: '0.6rem 1.5rem', background: '#28a745', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>Criar Pedido</button>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
           <h3 style={{ margin: 0 }}>Lista de Pedidos</h3>
        </div>
        
        {/* Controles de Busca e Filtro */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: 4, overflow: 'hidden' }}>
            <input 
              placeholder="Buscar ID" 
              style={{ padding: '0.4rem', border: 'none', width: '100px', outline: 'none' }} 
              value={searchId} 
              onChange={e => setSearchId(e.target.value)} 
            />
            <button 
              onClick={fetchOrderById} 
              style={{ padding: '0.4rem 0.8rem', color: 'white', border: 'none', cursor: 'pointer' }}>
              🔍
            </button>
          </div>
          
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{padding: '0.4rem', borderRadius: 4, border: '1px solid #ccc'}}>
            <option value="">Todos Status</option>
            <option value="PENDENTE">PENDENTE</option>
            <option value="ENVIADO">ENVIADO</option>
            <option value="ENTREGUE">ENTREGUE</option>
          </select>

          { (searchResult || filterStatus) && (
            <button 
              onClick={() => {setSearchResult(null); setSearchId(''); setFilterStatus('');}} 
              style={{ background: 'white', color: '#333', border: '1px solid #ccc', padding: '0.4rem 0.8rem', borderRadius: 4, cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th style={{padding: '0.7rem', border: '1px solid #ddd'}}>ID</th>
            <th style={{padding: '0.7rem', border: '1px solid #ddd'}}>Produto</th>
            <th style={{padding: '0.7rem', border: '1px solid #ddd'}}>Qtd</th>
            <th style={{padding: '0.7rem', border: '1px solid #ddd'}}>Status</th>
            <th style={{padding: '0.7rem', border: '1px solid #ddd'}}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {displayOrders.length === 0 && (
            <tr><td colSpan="5" style={{padding: '2rem', textAlign: 'center', color: '#666'}}>Nenhum pedido encontrado.</td></tr>
          )}
          {displayOrders.map(o => (
            <tr key={o.id} style={{ background: searchResult ? '#e9f7ef' : 'transparent' }}>
              <td style={{padding: '0.7rem', border: '1px solid #ddd'}}>{o.id}</td>
              <td style={{padding: '0.7rem', border: '1px solid #ddd'}}>{o.product_name}</td>
              <td style={{padding: '0.7rem', border: '1px solid #ddd'}}>{o.quantity}</td>
              <td style={{padding: '0.7rem', border: '1px solid #ddd'}}>
                <span style={{padding: '0.3rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', background: o.status === 'PENDENTE' ? '#ffd700' : o.status === 'ENVIADO' ? '#87ceeb' : '#28a745', color: o.status === 'ENTREGUE' ? 'white' : 'black'}}>{o.status}</span>
              </td>
              <td style={{padding: '0.7rem', border: '1px solid #ddd'}}>
                <select style={{ padding: '0.3rem', borderRadius: 4 }} value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
                  <option value="PENDENTE">Pendente</option>
                  <option value="ENVIADO">Enviado</option>
                  <option value="ENTREGUE">Entregue</option>
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
