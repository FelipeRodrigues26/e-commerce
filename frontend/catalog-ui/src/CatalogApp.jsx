import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8003/catalog';

function CatalogApp() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', price: 0, description: '', stock: 0 });

  const fetchCatalog = async () => {
    try {
      const res = await fetch(API_URL + '/');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
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
    <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white' }}>
      
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
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th style={{padding: '0.7rem', border: '1px solid #ddd'}}>ID</th>
            <th style={{padding: '0.7rem', border: '1px solid #ddd'}}>Produto</th>
            <th style={{padding: '0.7rem', border: '1px solid #ddd'}}>Preço</th>
            <th style={{padding: '0.7rem', border: '1px solid #ddd'}}>Descrição</th>
            <th style={{padding: '0.7rem', border: '1px solid #ddd'}}>Estoque</th>
            <th style={{padding: '0.7rem', border: '1px solid #ddd'}}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id}>
              <td style={{padding: '0.7rem', border: '1px solid #ddd'}}>{p.id}</td>
              <td style={{padding: '0.7rem', border: '1px solid #ddd', fontWeight: 'bold'}}>{p.name}</td>
              <td style={{padding: '0.7rem', border: '1px solid #ddd'}}>R${p.price.toFixed(2)}</td>
              <td style={{padding: '0.7rem', border: '1px solid #ddd', fontSize: '0.9rem'}}>{p.description}</td>
              <td style={{padding: '0.7rem', border: '1px solid #ddd', fontWeight: 'bold'}}>{p.stock}</td>
              <td style={{padding: '0.7rem', border: '1px solid #ddd'}}>
                <button 
                  onClick={() => handleDelete(p.id)}
                  style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 4, cursor: 'pointer' }}>
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
