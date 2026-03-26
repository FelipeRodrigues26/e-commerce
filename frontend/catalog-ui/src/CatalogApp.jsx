import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8003/catalog';

function CatalogApp() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', price: 0, description: '', stock: 0 });

  const fetchCatalog = async () => {
    try {
      const res = await fetch(API_URL + '/');
      const data = await res.json();
      const sortedData = Array.isArray(data) ? data.sort((a, b) => a.id - b.id) : [];
      setItems(sortedData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL + '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ name: '', price: 0, description: '', stock: 0 });
        fetchCatalog();
      }
    } catch (e) {
      alert('Erro ao criar item.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja excluir este item?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCatalog();
      } else {
        alert('Erro ao excluir.');
      }
    } catch (e) {
      alert('Erro de conexão.');
    }
  };

  return (
    <div>
      
      {/* Formulário de Criação */}
      <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: 8, marginBottom: '2rem', border: '1px solid #ddd' }}>
        <h3 style={{ marginTop: 0 }}>🛍️ Novo Item no Catálogo</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input 
            placeholder="Nome do Produto"
            style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', flex: 1 }} 
            value={form.name} 
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <input 
            type="number" 
            placeholder="Preço"
            style={{ padding: '0.5rem', width: 100, borderRadius: 4, border: '1px solid #ccc' }} 
            value={form.price} 
            onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })} 
            min="0" step="0.01"
            required
          />
          <input 
            placeholder="Descrição"
            style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', flex: 2 }} 
            value={form.description} 
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <input 
            type="number" 
            placeholder="Estoque"
            style={{ padding: '0.5rem', width: 80, borderRadius: 4, border: '1px solid #ccc' }} 
            value={form.stock} 
            onChange={e => setForm({ ...form, stock: parseInt(e.target.value) })} 
            min="0"
            required
          />
          <button style={{ padding: '0.6rem 1.5rem', background: '#28a745', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>Adicionar</button>
        </form>
      </div>

      <h3 style={{ marginTop: 0 }}>Itens Disponíveis</h3>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '1rem' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '1rem', fontWeight: '600', color: '#475569' }}>ID</th>
            <th style={{ padding: '1rem', fontWeight: '600', color: '#475569' }}>Produto</th>
            <th style={{ padding: '1rem', fontWeight: '600', color: '#475569' }}>Preço</th>
            <th style={{ padding: '1rem', fontWeight: '600', color: '#475569' }}>Descrição</th>
            <th style={{ padding: '1rem', fontWeight: '600', color: '#475569' }}>Estoque</th>
            <th style={{ padding: '1rem', fontWeight: '600', color: '#475569' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '1rem', fontSize: '14px', background: 'white' }}>{p.id}</td>
              <td style={{ padding: '1rem', fontSize: '14px', background: 'white', fontWeight: 'bold', color: '#1e293b' }}>{p.name}</td>
              <td style={{ padding: '1rem', fontSize: '14px', background: 'white' }}>R${p.price.toFixed(2)}</td>
              <td style={{ padding: '1rem', fontSize: '13px', background: 'white', color: '#64748b' }}>{p.description}</td>
              <td style={{ padding: '1rem', fontSize: '14px', background: 'white', fontWeight: 'bold' }}>{p.stock}</td>
              <td style={{ padding: '1rem', background: 'white' }}>
                <button 
                  onClick={() => handleDelete(p.id)}
                  style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 4, cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                  🗑️ Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CatalogApp;
