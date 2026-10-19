import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

   const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('grant_type', 'password');

      const response = await api.post('/auth/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('Login response:', response.data); // Для отладки

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('username', response.data.username);

      // Принудительный переход
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login error:', err);
      setError('Неверное имя пользователя или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>💪</div>
        <h1 style={styles.title}>Фитнес-клуб</h1>
        <p style={styles.subtitle}>Вход в систему</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div className="form-group">
            <label>Имя пользователя</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите логин"
              required
            />
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
            />
          </div>

          <button
            type="submit"
            style={styles.loginBtn}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p style={styles.registerLink}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>

        <div style={styles.hint}>
          <p>Тестовые аккаунты:</p>
          <p><strong>admin / secret</strong> — Администратор</p>
          <p><strong>manager / secret</strong> — Менеджер</p>
          <p><strong>client1 / secret</strong> — Клиент</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    width: '400px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#808090',
    marginBottom: '24px',
  },
  error: {
    backgroundColor: '#fff2f0',
    color: '#ff4d4f',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '16px',
    border: '1px solid #ffccc7',
    fontSize: '14px',
  },
  form: {
    textAlign: 'left',
  },
  loginBtn: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    marginTop: '10px',
  },
  registerLink: {
    marginTop: '16px',
    fontSize: '14px',
    color: '#808090',
  },
  hint: {
    marginTop: '20px',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#666',
    textAlign: 'left',
    lineHeight: '1.6',
  },
};

export default LoginPage;