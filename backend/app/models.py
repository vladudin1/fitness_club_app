from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey, Text, DECIMAL, Table
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="client")

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    birth_date = Column(Date)
    address = Column(String(255))
    city = Column(String(100))
    postal_code = Column(String(20))
    country = Column(String(100))
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)

    appointments = relationship("Appointment", back_populates="client")
    subscriptions = relationship("Subscription", back_populates="client")

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    position = Column(String(100))
    birth_date = Column(Date)
    hire_date = Column(Date)
    address = Column(String(255))
    postal_code = Column(String(20))
    country = Column(String(100))
    phone = Column(String(20))

    orders = relationship("Order", back_populates="employee")
    appointments = relationship("Appointment", back_populates="employee")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100))
    purchase_price = Column(DECIMAL(10, 2))
    selling_price = Column(DECIMAL(10, 2))
    quantity_in_stock = Column(Integer)

    order_items = relationship("OrderItem", back_populates="product")
    subscriptions = relationship("Subscription", back_populates="product")

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    cost = Column(DECIMAL(10, 2))
    duration = Column(String(50))
    is_available = Column(Boolean, default=True)

    appointment_services = relationship("AppointmentService", back_populates="service")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    order_date = Column(Date)
    appointment_date = Column(Date)
    fulfillment_date = Column(Date)
    delivery_method = Column(String(50))
    delivery_cost = Column(DECIMAL(10, 2))
    recipient_name = Column(String(255))
    recipient_address = Column(String(255))

    employee = relationship("Employee", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), primary_key=True)
    price = Column(DECIMAL(10, 2))
    quantity = Column(Integer)
    discount = Column(DECIMAL(5, 2), default=0)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    appointment_datetime = Column(DateTime)
    status = Column(String(50), default="scheduled")

    client = relationship("Client", back_populates="appointments")
    employee = relationship("Employee", back_populates="appointments")
    services = relationship("AppointmentService", back_populates="appointment", cascade="all, delete-orphan")

class AppointmentService(Base):
    __tablename__ = "appointment_services"
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), primary_key=True)
    service_id = Column(Integer, ForeignKey("services.id"), primary_key=True)
    price = Column(DECIMAL(10, 2))
    quantity = Column(Integer, default=1)
    discount = Column(DECIMAL(5, 2), default=0)
    appointment_date = Column(Date)

    appointment = relationship("Appointment", back_populates="services")
    service = relationship("Service", back_populates="appointment_services")

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    start_date = Column(Date)
    end_date = Column(Date)
    is_active = Column(Boolean, default=True)

    client = relationship("Client", back_populates="subscriptions")
    product = relationship("Product", back_populates="subscriptions")