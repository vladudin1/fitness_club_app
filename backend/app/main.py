from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, clients, employees, products, services, orders, appointments, subscriptions, reports

# Создаёт все таблицы в БД (если их ещё нет)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fitness Club API",
    description="API для информационной системы фитнес-клуба",
    version="1.0.0"
)

# Настройка CORS для связи с фронтендом React
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем все роутеры
app.include_router(auth.router, prefix="/api/auth", tags=["Аутентификация"])
app.include_router(clients.router, prefix="/api/clients", tags=["Клиенты"])
app.include_router(employees.router, prefix="/api/employees", tags=["Сотрудники"])
app.include_router(products.router, prefix="/api/products", tags=["Товары"])
app.include_router(services.router, prefix="/api/services", tags=["Услуги"])
app.include_router(orders.router, prefix="/api/orders", tags=["Заказы"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Записи"])
app.include_router(subscriptions.router, prefix="/api/subscriptions", tags=["Абонементы"])
app.include_router(reports.router, prefix="/api/reports", tags=["Отчёты"])


@app.get("/")
def read_root():
    return {
        "message": "Добро пожаловать в API информационной системы фитнес-клуба",
        "docs": "/docs",
        "version": "1.0.0"
    }