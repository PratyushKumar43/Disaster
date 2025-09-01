"use client";

export default function SimplePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          🚨 Disaster Management System
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Emergency Response & Resource Management Platform
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <a 
            href="/dashboard" 
            style={{ 
              background: '#fff',
              color: '#667eea',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            📊 Dashboard
          </a>
          <a 
            href="/health" 
            style={{ 
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            ❤️ Health Check
          </a>
          <a 
            href="/test" 
            style={{ 
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            🧪 Test Page
          </a>
        </div>
        <div style={{ 
          marginTop: '3rem',
          padding: '1rem',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px'
        }}>
          <p><strong>Status:</strong> ✅ Online</p>
          <p><strong>Deployed:</strong> {new Date().toLocaleDateString()}</p>
          <p><strong>Environment:</strong> Production</p>
        </div>
      </div>
    </div>
  );
}
