export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>P-Turtor</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>แพลตฟอร์มเรียนออนไลน์</p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <a href="/login" style={{
          padding: '12px 24px',
          background: 'white',
          color: '#667eea',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}>เข้าสู่ระบบ</a>
        <a href="/courses" style={{
          padding: '12px 24px',
          background: 'transparent',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          border: '2px solid white',
          fontWeight: 'bold'
        }}>ดูคอร์ส</a>
      </div>
    </div>
  )
}
