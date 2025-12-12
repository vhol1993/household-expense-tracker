import React, { useState } from 'react';
import { AuthProvider, useAuth, USERS } from './context/AuthContext';
import { Dashboard } from './components/Dashboard';
import { db } from './services/firebase';

const AppContent = () => {
  const { currentUser, login } = useAuth();

  // Check if Firebase is configured (simple check if API Key is placeholder)
  // Note: db._app.options returns the config object
  const isConfigured = db.app.options.apiKey !== "YOUR_API_KEY_HERE";

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

  if (!currentUser) {
    return (
      <div className="container flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
        <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2>Welcome Home</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>Who is spending money today?</p>

          <div style={{ display: 'grid', gap: '15px' }}>
            {USERS.map(user => (
              <button
                key={user.id}
                onClick={() => login(user.id)}
                className="btn-primary"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {user.avatar} {user.name}
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
