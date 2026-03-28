import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o estado para que a próxima renderização mostre a UI alternativa.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Você também pode registrar o erro em um serviço de relatório de erros
    console.error("ErrorBoundary capturou um erro:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI alternativa
      return (
        <div style={{ 
          padding: '2rem', 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          color: '#b91c1c', 
          borderRadius: 12, 
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ marginTop: 0 }}>⚠️ Módulo Temporariamente Indisponível</h3>
          <p style={{ fontSize: '14px', marginBottom: '1.5rem' }}>
            Houve uma falha ao carregar este microfrontend. Isso geralmente acontece quando o serviço correspondente está offline ou inacessível.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '0.6rem 1.2rem', 
              background: '#dc2626', 
              color: 'white', 
              border: 'none', 
              borderRadius: 6, 
              cursor: 'pointer', 
              fontWeight: 'bold' 
            }}>
            🔄 Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
