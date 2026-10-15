import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class LimiteErrores extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EFEFEF', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 480, textAlign: 'center' }}>
            <h1 style={{ fontWeight: 800, marginBottom: 8 }}>Algo falló en Resetly</h1>
            <p style={{ fontSize: 14, color: '#525252', marginBottom: 16 }}>
              Tus datos siguen guardados en este navegador. Prueba recargar, y si persiste, restaura un respaldo JSON.
            </p>
            <button onClick={() => window.location.reload()} style={{ background: '#111', color: '#fff', border: 0, borderRadius: 12, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', marginRight: 8 }}>
              Recargar
            </button>
            <button onClick={() => { localStorage.removeItem('RESETLY_DATA'); window.location.reload(); }} style={{ background: '#f5f5f5', color: '#111', border: '1px solid #ddd', borderRadius: 12, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>
              Borrar datos locales
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LimiteErrores>
      <App />
    </LimiteErrores>
  </React.StrictMode>,
)
