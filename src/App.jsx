import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth, USERS } from './context/AuthContext';
import { Dashboard } from './components/Dashboard';
import { db } from './services/firebase';
import { APP_PIN } from './constants';
import { Lock, ArrowRight } from 'lucide-react';

const AppContent = () => {
  const { currentUser, login } = useAuth();
  const [pinInput, setPinInput] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [error, setError] = useState('');

  // Check if Firebase is configured (simple check if API Key is placeholder)
  const isConfigured = db.app.options.apiKey !== "YOUR_API_KEY_HERE";

  // Check for existing session verification in sessionStorage
  useEffect(() => {
    if (sessionStorage.getItem('expenses_pin_verified') === 'true') {
      setIsPinVerified(true);
    }
  }, []);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === APP_PIN) {
      setIsPinVerified(true);
      sessionStorage.setItem('expenses_pin_verified', 'true');
      setError('');
    } else {
      setError('PIN Incorreto');
      setPinInput('');
    }
  };

  if (!isConfigured) {
    return (
      <div className="container flex-center" style={{ minHeight: '100vh', flexDirection: 'column', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <h1 style={{ color: 'var(--color-accent)' }}>Configuração Necessária</h1>
          <p>Por favor configure suas chaves do Firebase em <code>src/services/firebase.js</code></p>
          <p className="text-muted">Você solicitou executar isso, então preciso das chaves para prosseguir com o Banco de Dados.</p>
        </div>
      </div>
    );
  }

  // 1. PIN Check Screen
  // Show this if user is NOT logged in AND PIN is NOT verified.
  if (!currentUser && !isPinVerified) {
    return (
      <div className="container flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
        <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '350px', textAlign: 'center' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ padding: '15px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}>
              <Lock size={32} color="var(--color-primary)" />
            </div>
          </div>
          <h2 style={{ marginBottom: '10px' }}>Acesso Restrito</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '25px', fontSize: '0.9em' }}>
            Digite o PIN da casa para continuar
          </p>

          <form onSubmit={handlePinSubmit}>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="input-field"
              placeholder="Digite o PIN"
              style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '1.2em', marginBottom: '15px' }}
              autoFocus
              maxLength={6}
            />
            {error && <p style={{ color: '#ef4444', fontSize: '0.9em', marginBottom: '15px' }}>{error}</p>}
            <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              Entrar <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. User Selection Screen
  if (!currentUser) {
    return (
      <div className="container flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
        <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2>Quem é você?</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>Selecione seu perfil para continuar</p>

          <div style={{ display: 'grid', gap: '15px' }}>
            {USERS.map(user => (
              <button
                key={user.id}
                onClick={() => login(user.id)}
                className="btn-primary"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', justifyContent: 'flex-start', padding: '15px 20px' }}
              >
                <span style={{ marginRight: '10px', fontSize: '1.2em' }}>{user.avatar}</span> {user.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
