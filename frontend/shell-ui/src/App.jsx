import React, { Suspense, useState, useEffect } from 'react';

import UsersApp from './UsersApp';
import ErrorBoundary from './ErrorBoundary';

const OrdersApp = React.lazy(() => import('orders_ui/OrdersApp'));
const CatalogApp = React.lazy(() => import('catalog_ui/CatalogApp'));

const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (e) {
    return null;
  }
};

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password })
      });
      if (response.ok) {
        const data = await response.json();
        onLogin(data.access_token);
      } else {
        setError('Usuário ou senha inválidos.');
      }
    } catch(err) {
      setError('Erro de conexão com o servidor de autenticação.');
    }
  };

  return (
    <div style={{ maxWidth: 350, margin: '80px auto', padding: '2rem', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
       <h2 style={{marginTop: 0, textAlign: 'center'}}>Login</h2>
       {error && <p style={{color: 'red', textAlign: 'center', fontSize: '14px'}}>{error}</p>}
       <form onSubmit={handleSubmit}>
         <div style={{marginBottom: '1rem'}}>
           <label style={{display: 'block', marginBottom: '0.3rem', fontSize: '14px', fontWeight: 'bold'}}>Usuário</label>
           <input style={{width: '100%', padding: '0.5rem', boxSizing: 'border-box'}} value={username} onChange={e=>setUsername(e.target.value)} required autoComplete="username" />
         </div>
         <div style={{marginBottom: '1.5rem'}}>
           <label style={{display: 'block', marginBottom: '0.3rem', fontSize: '14px', fontWeight: 'bold'}}>Senha</label>
           <input style={{width: '100%', padding: '0.5rem', boxSizing: 'border-box'}} type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password" />
         </div>
         <button style={{width: '100%', padding: '0.8rem', background: '#333', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold'}}>Fazer Login</button>
       </form>
    </div>
  )
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  const [userName, setUserName] = useState('');
  const [view, setView] = useState('pedidos');

  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.name) setUserName(decoded.name);
    }
  }, [token]);

  const handleLogin = (jwt) => {
    localStorage.setItem('jwt_token', jwt);
    setToken(jwt);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUserName('');
  };

  if (!token) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <header style={{ padding: '1rem', background: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1 style={{margin: 0, fontSize: '1.5rem'}}>E-commerce</h1>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setView('usuarios')} 
              style={{ background: view === 'usuarios' ? '#555' : 'transparent', border: 'none', color: 'white', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: 4 }}>
              👥 Usuários
            </button>
            <button 
              onClick={() => setView('catalog')} 
              style={{ background: view === 'catalog' ? '#555' : 'transparent', border: 'none', color: 'white', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: 4 }}>
              🛍️ Catálogo
            </button>
            <button 
              onClick={() => setView('pedidos')} 
              style={{ background: view === 'pedidos' ? '#555' : 'transparent', border: 'none', color: 'white', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: 4 }}>
              📦 Pedidos
            </button>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {userName && <span style={{ fontSize: '0.9rem', color: '#ccc' }}>👤 Olá, <strong style={{color: 'white'}}>{userName}</strong></span>}
          <button onClick={handleLogout} style={{background: 'transparent', border: '1px solid white', color: 'white', padding: '0.4rem 1rem', cursor: 'pointer', borderRadius: 4}}>Sair</button>
        </div>
      </header>
      <main style={{ padding: '2rem' }}>
        {view === 'pedidos' ? (
          <>
            <h2 style={{marginTop: 0}}>Painel de Pedidos</h2>
            <ErrorBoundary key="eb-pedidos">
              <Suspense fallback={<div>Carregando Módulo de Pedidos...</div>}>
                <OrdersApp />
              </Suspense>
            </ErrorBoundary>
          </>
        ) : view === 'catalog' ? (
          <>
            <h2 style={{marginTop: 0}}>Gestão de Catálogo</h2>
            <ErrorBoundary key="eb-catalog">
              <Suspense fallback={<div>Carregando Catálogo...</div>}>
                <CatalogApp />
              </Suspense>
            </ErrorBoundary>
          </>
        ) : (
          <>
            <h2 style={{marginTop: 0}}>Gestão de Usuários</h2>
            <UsersApp />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
