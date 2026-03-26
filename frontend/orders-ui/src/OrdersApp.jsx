import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8002/orders';

function OrdersApp() {
  const [orders, setOrders] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});

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
        setSelectedProductId(data[0].id);
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

  const addToCart = () => {
    const product = catalog.find(p => p.id === parseInt(selectedProductId));
    if (!product) return;
    if (product.stock < quantity) {
        alert(`Estoque insuficiente! Apenas ${product.stock} disponíveis.`);
        return;
    }
    const newItem = { product_id: product.id, name: product.name, quantity, price: product.price };
    setCart([...cart, newItem]);
    setQuantity(1);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
        alert("Adicione pelo menos um item ao carrinho!");
        return;
    }
    const payload = {
        user_id: 1, // MVP User
        items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity }))
    };

    const res = await fetch(API_URL + '/', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });

    if (res.ok) {
        fetchOrders();
        fetchCatalog(); 
        setCart([]);
        alert("Pedido criado com sucesso!");
    } else {
        const error = await res.json();
        alert(`Erro: ${error.detail}`);
    }
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    fetchOrders();
  };

  const toggleExpand = (id) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const displayOrders = searchResult ? [searchResult] : (filterStatus ? orders.filter(o => o.status === filterStatus) : orders);

  return (
    <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Carrinho e Novo Pedido */}
      <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: 12, marginBottom: '2rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>🛒 Novo Pedido</h3>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Produto</label>
            <select 
              style={{ padding: '0.6rem', borderRadius: 6, border: '1px solid #d1d5db', minWidth: '250px' }} 
              value={selectedProductId} 
              onChange={e => setSelectedProductId(e.target.value)}
            >
              <option value="">Selecione um produto</option>
              {catalog.map(p => (
                <option key={p.id} value={p.id}>{p.name} - R${p.price} (Estoque: {p.stock})</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Qtd</label>
            <input 
              type="number" 
              style={{ padding: '0.6rem', width: 80, borderRadius: 6, border: '1px solid #d1d5db' }} 
              value={quantity} 
              onChange={e => setQuantity(parseInt(e.target.value))} 
              min="1" 
            />
          </div>
          <button 
            type="button"
            onClick={addToCart}
            style={{ padding: '0.6rem 1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
          >
            ➕ Adicionar Item
          </button>
        </div>

        {cart.length > 0 && (
            <div style={{ background: 'white', padding: '1rem', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '14px' }}>Itens no Carrinho:</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {cart.map((item, idx) => (
                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '14px' }}>
                            <span>{item.name} (x{item.quantity})</span>
                            <span style={{ fontWeight: 'bold' }}>R${(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '2px solid #3b82f6' }}>
                    <span style={{ fontWeight: 'bold' }}>Total Estimado:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#2563eb' }}>
                        R${cart.reduce((sub, item) => sub + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                </div>
                <button 
                    onClick={handleCreate}
                    style={{ marginTop: '1rem', width: '100%', padding: '0.8rem', background: '#10b981', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                >
                    Finalizar Pedido ✅
                </button>
            </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: '#111827' }}>Histórico de Pedidos</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden' }}>
            <input 
              placeholder="Buscar ID" 
              style={{ padding: '0.5rem', border: 'none', width: '100px', outline: 'none' }} 
              value={searchId} 
              onChange={e => setSearchId(e.target.value)} 
            />
            <button onClick={fetchOrderById} style={{ padding: '0.5rem 0.8rem', background: '#6b7280', color: 'white', border: 'none', cursor: 'pointer' }}>🔍</button>
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db'}}>
            <option value="">Status: Todos</option>
            <option value="PENDENTE">PENDENTE</option>
            <option value="ENVIADO">ENVIADO</option>
            <option value="ENTREGUE">ENTREGUE</option>
          </select>
          {(searchResult || filterStatus) && (
            <button onClick={() => {setSearchResult(null); setSearchId(''); setFilterStatus('');}} style={{ background: 'white', color: '#374151', border: '1px solid #d1d5db', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: '600', cursor: 'pointer' }}>Limpar</button>
          )}
        </div>
      </div>

      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{padding: '1rem', fontWeight: '600', color: '#475569'}}>ID</th>
            <th style={{padding: '1rem', fontWeight: '600', color: '#475569'}}>Data</th>
            <th style={{padding: '1rem', fontWeight: '600', color: '#475569'}}>Total</th>
            <th style={{padding: '1rem', fontWeight: '600', color: '#475569'}}>Status</th>
            <th style={{padding: '1rem', fontWeight: '600', color: '#475569'}}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {displayOrders.length === 0 && (
            <tr><td colSpan="5" style={{padding: '3rem', textAlign: 'center', color: '#94a3b8'}}>Nenhum pedido encontrado.</td></tr>
          )}
          {displayOrders.map(o => (
            <React.Fragment key={o.id}>
              <tr style={{ borderBottom: '1px solid #f1f5f9', background: expandedOrders[o.id] ? '#f8fafc' : 'white' }}>
                <td style={{padding: '1rem', fontSize: '14px'}}>#{o.id}</td>
                <td style={{padding: '1rem', fontSize: '14px'}}>{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                <td style={{padding: '1rem', fontSize: '14px', fontWeight: 'bold', color: '#1e293b'}}>R${o.total_price ? o.total_price.toFixed(2) : '0.00'}</td>
                <td style={{padding: '1rem'}}>
                  <span style={{padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', background: o.status === 'PENDENTE' ? '#fef3c7' : o.status === 'ENVIADO' ? '#e0f2fe' : '#dcfce7', color: o.status === 'PENDENTE' ? '#92400e' : o.status === 'ENVIADO' ? '#075985' : '#166534'}}>{o.status}</span>
                </td>
                <td style={{padding: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                  <button 
                    onClick={() => toggleExpand(o.id)}
                    style={{ padding: '0.4rem 0.8rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 4, cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    {expandedOrders[o.id] ? '🔼 Ocultar' : '🔽 Detalhes'}
                  </button>
                  <select style={{ padding: '0.4rem', borderRadius: 4, fontSize: '12px' }} value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
                    <option value="PENDENTE">Alterar para Pendente</option>
                    <option value="ENVIADO">Alterar para Enviado</option>
                    <option value="ENTREGUE">Alterar para Entregue</option>
                  </select>
                </td>
              </tr>
              {expandedOrders[o.id] && o.items && (
                <tr style={{ background: '#f8fafc' }}>
                  <td colSpan="5" style={{ padding: '0 1rem 1rem 1rem' }}>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0', marginLeft: '2rem' }}>
                        <h5 style={{ margin: '0 0 0.8rem 0', color: '#64748b' }}>Itens do Pedido #{o.id}:</h5>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#94a3b8', textAlign: 'left' }}>
                                    <th style={{ paddingBottom: '0.5rem' }}>Produto ID</th>
                                    <th style={{ paddingBottom: '0.5rem' }}>Qtd</th>
                                    <th style={{ paddingBottom: '0.5rem' }}>Prc. Unit (Histórico)</th>
                                    <th style={{ paddingBottom: '0.5rem' }}>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {o.items.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={{ padding: '0.5rem 0' }}>{item.product_id}</td>
                                        <td style={{ padding: '0.5rem 0' }}>{item.quantity}</td>
                                        <td style={{ padding: '0.5rem 0' }}>R${item.unit_price.toFixed(2)}</td>
                                        <td style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>R${(item.unit_price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrdersApp;
