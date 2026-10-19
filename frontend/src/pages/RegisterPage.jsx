import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 4) {
      setError('Пароль должен быть не менее 4 символов');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', null, {
        params: {
          username,
          password,
          role: 'client',
        },
      });

      setSuccess('Регистрация успешна! Перенаправление на вход...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Пользователь с таким именем уже существует');
      } else {
        setError('Ошибка при регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🆕</div>
        <h1 style={styles.title}>Регистрация</h1>
        <p style={styles.subtitle}>Создайте новый аккаунт</p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleRegister} style={styles.form}>
          <div className="form-group">
            <label>Имя пользователя</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Придумайте логин"
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
              placeholder="Придумайте пароль"
              required
            />
          </div>

          <div className="form-group">
            <label>Подтверждение пароля</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
              required
            />
          </div>

          <button
            type="submit"
            style={styles.registerBtn}
            disabled={loading}
            className="btn btn-success"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p style={styles.loginLink}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
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
  success: {
    backgroundColor: '#f6ffed',
    color: '#52c41a',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '16px',
    border: '1px solid #b7eb8f',
    fontSize: '14px',
  },
  form: {
    textAlign: 'left',
  },
  registerBtn: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    marginTop: '10px',
  },
  loginLink: {
    marginTop: '16px',
    fontSize: '14px',
    color: '#808090',
  },
};

export default RegisterPage;