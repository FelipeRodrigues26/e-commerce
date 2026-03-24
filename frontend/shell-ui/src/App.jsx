import React, { Suspense } from 'react';

const OrdersApp = React.lazy(() => import('orders_ui/OrdersApp'));

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <header style={{ padding: '1rem', background: '#333', color: 'white' }}>
        <h1>E-commerce MVP - Shell</h1>
      </header>
      <main style={{ padding: '2rem' }}>
        <h2>Painel de Pedidos (Microfrontend)</h2>
        <Suspense fallback={<div>Carregando Módulo de Pedidos...</div>}>
          <OrdersApp />
        </Suspense>
      </main>
    </div>
  );
}

export default App;
