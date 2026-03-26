import React, { useState, useEffect } from 'react';

function UsersApp() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '' });

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8001/users/', { headers: getHeaders() });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao carregar usuários.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8001/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ username: '', name: '', email: '', password: '' });
        fetchUsers();
        alert('Usuário criado com sucesso!');
      } else {
        const errData = await res.json();
        alert(errData.detail || 'Erro ao criar usuário.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    }
  };

  return (
    <div>
      <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: 8, marginBottom: '2rem', border: '1px solid #ddd' }}>
        <h3 style={{ marginTop: 0 }}>Novo Usuário</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input placeholder="Username" style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
          <input placeholder="Nome Completo" style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', flex: 1 }} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input placeholder="Email" type="email" style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input placeholder="Senha" type="password" style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <button type="submit" style={{ padding: '0.5rem 1.5rem', background: '#28a745', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>Cadastrar</button>
        </form>
      </div>

      <h3>Lista de Usuários</h3>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '1rem', fontWeight: '600', color: '#475569', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '1rem', fontWeight: '600', color: '#475569', textAlign: 'left' }}>Nome</th>
            <th style={{ padding: '1rem', fontWeight: '600', color: '#475569', textAlign: 'left' }}>Username</th>
            <th style={{ padding: '1rem', fontWeight: '600', color: '#475569', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '1rem', fontWeight: '600', color: '#475569', textAlign: 'left' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '1rem', fontSize: '14px', background: 'white' }}>{u.id}</td>
              <td style={{ padding: '1rem', fontSize: '14px', background: 'white' }}>{u.name}</td>
              <td style={{ padding: '1rem', fontSize: '14px', background: 'white' }}>{u.username}</td>
              <td style={{ padding: '1rem', fontSize: '14px', background: 'white' }}>{u.email}</td>
              <td style={{ padding: '1rem', fontSize: '14px', background: 'white' }}>{u.is_active ? '✅ Ativo' : '❌ Inativo'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersApp;
