import { Outlet, NavLink, useNavigate } from 'react-router-dom';

function Layout() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }) => ({
    padding: '8px 16px',
    textDecoration: 'none',
    color: isActive ? '#e94560' : '#c0c0d0',
    fontWeight: isActive ? '600' : '400',
    borderRadius: '4px',
    backgroundColor: isActive ? 'rgba(233, 69, 96, 0.1)' : 'transparent',
    transition: 'all 0.3s',
  });

  return (
    <div style={styles.container}>
      {/* Сайдбар */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>💪</span>
          <span style={styles.logoText}>Фитнес-клуб</span>
        </div>
        
        <nav style={styles.nav}>
          <NavLink to="/dashboard" style={navLinkStyle} end>
            📊 Дашборд
          </NavLink>
          <NavLink to="/clients" style={navLinkStyle}>
            👥 Клиенты
          </NavLink>
          <NavLink to="/employees" style={navLinkStyle}>
            👨‍💼 Сотрудники
          </NavLink>
          <NavLink to="/products" style={navLinkStyle}>
            📦 Товары
          </NavLink>
          <NavLink to="/services" style={navLinkStyle}>
            🔧 Услуги
          </NavLink>
          <NavLink to="/orders" style={navLinkStyle}>
            🛒 Заказы
          </NavLink>
          <NavLink to="/appointments" style={navLinkStyle}>
            📅 Записи
          </NavLink>
          <NavLink to="/subscriptions" style={navLinkStyle}>
            🎫 Абонементы
          </NavLink>
          {(userRole === 'admin' || userRole === 'manager') && (
            <NavLink to="/reports" style={navLinkStyle}>
              📈 Отчёты
            </NavLink>
          )}
        </nav>

        <div style={styles.userInfo}>
          <p style={styles.username}>👤 {username}</p>
          <p style={styles.role}>
            {userRole === 'admin' ? 'Администратор' : 
             userRole === 'manager' ? 'Менеджер' : 'Клиент'}
          </p>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Выйти
          </button>
        </div>
      </aside>

      {/* Основной контент */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#1a1a2e',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    overflowY: 'auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px 20px',
    borderBottom: '1px solid #2a2a4e',
    marginBottom: '20px',
  },
  logoIcon: {
    fontSize: '28px',
    marginRight: '10px',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#e94560',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 12px',
    flex: 1,
  },
  userInfo: {
    padding: '20px',
    borderTop: '1px solid #2a2a4e',
    marginTop: 'auto',
  },
  username: {
    fontSize: '14px',
    marginBottom: '4px',
  },
  role: {
    fontSize: '12px',
    color: '#a0a0b0',
    marginBottom: '12px',
  },
  logoutBtn: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  main: {
    flex: 1,
    marginLeft: '240px',
    padding: '24px',
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
  },
};

export default Layout;