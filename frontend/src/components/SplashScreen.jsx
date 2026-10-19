import React from 'react';

function SplashScreen() {
  return (
    <div style={styles.container}>
      <div style={styles.iconContainer}>
        <div style={styles.icon}>💪</div>
      </div>
      <h1 style={styles.title}>ИС «Фитнес-клуб Атлант»</h1>
      <p style={styles.subtitle}>
        Информационная система управления фитнес-клубом
      </p>
      <div style={styles.divider}></div>
      <p style={styles.info}>
        Курсовая работа по дисциплине «Управление данными»
      </p>
      <p style={styles.info}>
        Тема: «Разработка информационной системы фитнес клуба»
      </p>
      <p style={styles.author}>
        Выполнил: Юдин В.Е., группа 23-КТ
      </p>
      <p style={styles.year}>Нижний Новгород, 2026</p>
      <p style={styles.loading}>Загрузка...</p>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#1a1a2e',
    color: 'white',
    textAlign: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  iconContainer: {
    marginBottom: '20px',
  },
  icon: {
    fontSize: '80px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#e94560',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#a0a0b0',
    marginBottom: '30px',
  },
  divider: {
    width: '200px',
    height: '2px',
    backgroundColor: '#e94560',
    margin: '20px 0',
  },
  info: {
    fontSize: '1rem',
    color: '#c0c0d0',
    marginBottom: '8px',
  },
  author: {
    fontSize: '1.1rem',
    color: '#e94560',
    marginTop: '20px',
    fontWeight: '500',
  },
  year: {
    fontSize: '0.9rem',
    color: '#808090',
    marginTop: '10px',
  },
  loading: {
    marginTop: '40px',
    fontSize: '0.9rem',
    color: '#606070',
    animation: 'blink 1.5s infinite',
  },
};

export default SplashScreen;