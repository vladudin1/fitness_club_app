from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from . import models, schemas
from typing import Optional, List

# ==================== USER ====================

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, username: str, hashed_password: str, role: str = "client"):
    db_user = models.User(username=username, hashed_password=hashed_password, role=role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ==================== CLIENTS ====================

def get_clients(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None):
    query = db.query(models.Client)
    if search:
        query = query.filter(models.Client.full_name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

def get_client(db: Session, client_id: int):
    return db.query(models.Client).filter(models.Client.id == client_id).first()

def create_client(db: Session, client: schemas.ClientCreate):
    db_client = models.Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def update_client(db: Session, client_id: int, client: schemas.ClientUpdate):
    db_client = get_client(db, client_id)
    if db_client:
        update_data = client.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_client, key, value)
        db.commit()
        db.refresh(db_client)
    return db_client

def delete_client(db: Session, client_id: int):
    db_client = get_client(db, client_id)
    if db_client:
        db.delete(db_client)
        db.commit()
    return db_client

# ==================== EMPLOYEES ====================

def get_employees(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None):
    query = db.query(models.Employee)
    if search:
        query = query.filter(models.Employee.full_name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

def get_employee(db: Session, employee_id: int):
    return db.query(models.Employee).filter(models.Employee.id == employee_id).first()

def create_employee(db: Session, employee: schemas.EmployeeCreate):
    db_employee = models.Employee(**employee.model_dump())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def update_employee(db: Session, employee_id: int, employee: schemas.EmployeeUpdate):
    db_employee = get_employee(db, employee_id)
    if db_employee:
        update_data = employee.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_employee, key, value)
        db.commit()
        db.refresh(db_employee)
    return db_employee

def delete_employee(db: Session, employee_id: int):
    db_employee = get_employee(db, employee_id)
    if db_employee:
        db.delete(db_employee)
        db.commit()
    return db_employee

# ==================== PRODUCTS ====================

def get_products(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None):
    query = db.query(models.Product)
    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if db_product:
        update_data = product.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_product, key, value)
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

# ==================== SERVICES ====================

def get_services(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None):
    query = db.query(models.Service)
    if search:
        query = query.filter(models.Service.name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

def get_service(db: Session, service_id: int):
    return db.query(models.Service).filter(models.Service.id == service_id).first()

def create_service(db: Session, service: schemas.ServiceCreate):
    db_service = models.Service(**service.model_dump())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def update_service(db: Session, service_id: int, service: schemas.ServiceUpdate):
    db_service = get_service(db, service_id)
    if db_service:
        update_data = service.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_service, key, value)
        db.commit()
        db.refresh(db_service)
    return db_service

def delete_service(db: Session, service_id: int):
    db_service = get_service(db, service_id)
    if db_service:
        db.delete(db_service)
        db.commit()
    return db_service

# ==================== ORDERS ====================

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).options(joinedload(models.Order.items).joinedload(models.OrderItem.product)).offset(skip).limit(limit).all()

def get_order(db: Session, order_id: int):
    return db.query(models.Order).options(joinedload(models.Order.items).joinedload(models.OrderItem.product)).filter(models.Order.id == order_id).first()

def create_order(db: Session, order: schemas.OrderCreate):
    order_data = order.model_dump(exclude={"items"})
    db_order = models.Order(**order_data)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    for item in order.items:
        db_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            price=item.price,
            quantity=item.quantity,
            discount=item.discount
        )
        db.add(db_item)
    db.commit()
    db.refresh(db_order)
    return get_order(db, db_order.id)

def update_order(db: Session, order_id: int, order: schemas.OrderUpdate):
    db_order = get_order(db, order_id)
    if db_order:
        update_data = order.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_order, key, value)
        db.commit()
        db.refresh(db_order)
    return db_order

def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if db_order:
        db.delete(db_order)
        db.commit()
    return db_order

# ==================== APPOINTMENTS ====================

def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Appointment).options(
        joinedload(models.Appointment.client),
        joinedload(models.Appointment.employee),
        joinedload(models.Appointment.services).joinedload(models.AppointmentService.service)
    ).offset(skip).limit(limit).all()

def get_appointment(db: Session, appointment_id: int):
    return db.query(models.Appointment).options(
        joinedload(models.Appointment.client),
        joinedload(models.Appointment.employee),
        joinedload(models.Appointment.services).joinedload(models.AppointmentService.service)
    ).filter(models.Appointment.id == appointment_id).first()

def create_appointment(db: Session, appointment: schemas.AppointmentCreate):
    app_data = appointment.model_dump(exclude={"services"})
    db_appointment = models.Appointment(**app_data)
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)

    for service in appointment.services:
        db_service = models.AppointmentService(
            appointment_id=db_appointment.id,
            service_id=service.service_id,
            price=service.price,
            quantity=service.quantity,
            discount=service.discount,
            appointment_date=service.appointment_date
        )
        db.add(db_service)
    db.commit()
    db.refresh(db_appointment)
    return get_appointment(db, db_appointment.id)

def update_appointment(db: Session, appointment_id: int, appointment: schemas.AppointmentUpdate):
    db_appointment = get_appointment(db, appointment_id)
    if db_appointment:
        update_data = appointment.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_appointment, key, value)
        db.commit()
        db.refresh(db_appointment)
    return db_appointment

def delete_appointment(db: Session, appointment_id: int):
    db_appointment = get_appointment(db, appointment_id)
    if db_appointment:
        db.delete(db_appointment)
        db.commit()
    return db_appointment

# ==================== SUBSCRIPTIONS ====================

def get_subscriptions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Subscription).options(
        joinedload(models.Subscription.client),
        joinedload(models.Subscription.product)
    ).offset(skip).limit(limit).all()

def get_subscription(db: Session, subscription_id: int):
    return db.query(models.Subscription).options(
        joinedload(models.Subscription.client),
        joinedload(models.Subscription.product)
    ).filter(models.Subscription.id == subscription_id).first()

def create_subscription(db: Session, subscription: schemas.SubscriptionCreate):
    db_subscription = models.Subscription(**subscription.model_dump())
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    return db_subscription

def update_subscription(db: Session, subscription_id: int, subscription: schemas.SubscriptionUpdate):
    db_subscription = get_subscription(db, subscription_id)
    if db_subscription:
        update_data = subscription.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_subscription, key, value)
        db.commit()
        db.refresh(db_subscription)
    return db_subscription

def delete_subscription(db: Session, subscription_id: int):
    db_subscription = get_subscription(db, subscription_id)
    if db_subscription:
        db.delete(db_subscription)
        db.commit()
    return db_subscription

# ==================== REPORTS ====================

def get_orders_by_date_range(db: Session, start_date, end_date):
    return db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.product)
    ).filter(
        models.Order.order_date >= start_date,
        models.Order.order_date <= end_date
    ).all()

def get_appointments_by_date_range(db: Session, start_date, end_date):
    return db.query(models.Appointment).options(
        joinedload(models.Appointment.client),
        joinedload(models.Appointment.employee),
        joinedload(models.Appointment.services).joinedload(models.AppointmentService.service)
    ).filter(
        models.Appointment.appointment_datetime >= start_date,
        models.Appointment.appointment_datetime <= end_date
    ).all()

def get_popular_services(db: Session):
    results = db.query(
        models.Service.name,
        func.sum(models.AppointmentService.quantity).label("total_quantity"),
        func.sum(models.AppointmentService.price * models.AppointmentService.quantity).label("total_revenue")
    ).join(
        models.AppointmentService, models.Service.id == models.AppointmentService.service_id
    ).group_by(
        models.Service.name
    ).order_by(
        desc("total_quantity")
    ).limit(10).all()
    return results

def get_top_clients(db: Session):
    results = db.query(
        models.Client.full_name,
        func.sum(models.OrderItem.price * models.OrderItem.quantity).label("total_spent"),
        func.count(models.Order.id.distinct()).label("orders_count")
    ).join(
        models.Appointment, models.Client.id == models.Appointment.client_id
    ).join(
        models.AppointmentService, models.Appointment.id == models.AppointmentService.appointment_id
    ).group_by(
        models.Client.full_name
    ).order_by(
        desc("total_spent")
    ).limit(5).all()
    return results