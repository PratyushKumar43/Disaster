export default function HealthCheck() {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      padding: '2rem', 
      textAlign: 'center',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: '#28a745', fontSize: '2rem', marginBottom: '1rem' }}>
        ✅ Deployment Successful
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Disaster Management System is running correctly
      </p>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p><strong>Status:</strong> Online</p>
        <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
        <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <a 
          href="/" 
          style={{ 
            color: '#007bff', 
            textDecoration: 'none',
            fontSize: '1.1rem',
            padding: '0.5rem 1rem',
            border: '1px solid #007bff',
            borderRadius: '4px',
            display: 'inline-block'
          }}
        >
          ← Back to Main App
        </a>
      </div>
    </div>
  );
}
