from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal

# ==================== AUTH ====================

class UserOut(BaseModel):
    id: int
    username: str
    role: str
    class Config:
        from_attributes = True

# ==================== CLIENTS ====================

class ClientBase(BaseModel):
    full_name: str
    birth_date: Optional[date] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = True

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    full_name: Optional[str] = None
    birth_date: Optional[date] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class ClientOut(ClientBase):
    id: int
    class Config:
        from_attributes = True

# ==================== EMPLOYEES ====================

class EmployeeBase(BaseModel):
    full_name: str
    position: Optional[str] = None
    birth_date: Optional[date] = None
    hire_date: Optional[date] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    position: Optional[str] = None
    birth_date: Optional[date] = None
    hire_date: Optional[date] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None

class EmployeeOut(EmployeeBase):
    id: int
    class Config:
        from_attributes = True

# ==================== PRODUCTS ====================

class ProductBase(BaseModel):
    name: str
    category: Optional[str] = None
    purchase_price: Optional[Decimal] = None
    selling_price: Optional[Decimal] = None
    quantity_in_stock: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    purchase_price: Optional[Decimal] = None
    selling_price: Optional[Decimal] = None
    quantity_in_stock: Optional[int] = None

class ProductOut(ProductBase):
    id: int
    class Config:
        from_attributes = True

# ==================== SERVICES ====================

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    cost: Optional[Decimal] = None
    duration: Optional[str] = None
    is_available: Optional[bool] = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cost: Optional[Decimal] = None
    duration: Optional[str] = None
    is_available: Optional[bool] = None

class ServiceOut(ServiceBase):
    id: int
    class Config:
        from_attributes = True

# ==================== ORDERS ====================

class OrderItemCreate(BaseModel):
    product_id: int
    price: Decimal
    quantity: int = 1
    discount: Decimal = 0

class OrderItemOut(BaseModel):
    product_id: int
    price: Decimal
    quantity: int
    discount: Decimal
    product: Optional[ProductOut] = None
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    employee_id: int
    order_date: Optional[date] = None
    appointment_date: Optional[date] = None
    fulfillment_date: Optional[date] = None
    delivery_method: Optional[str] = None
    delivery_cost: Optional[Decimal] = Decimal(0)
    recipient_name: Optional[str] = None
    recipient_address: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate] = []

class OrderUpdate(BaseModel):
    employee_id: Optional[int] = None
    order_date: Optional[date] = None
    appointment_date: Optional[date] = None
    fulfillment_date: Optional[date] = None
    delivery_method: Optional[str] = None
    delivery_cost: Optional[Decimal] = None
    recipient_name: Optional[str] = None
    recipient_address: Optional[str] = None

class OrderOut(OrderBase):
    id: int
    items: List[OrderItemOut] = []
    class Config:
        from_attributes = True

# ==================== APPOINTMENTS ====================

class AppointmentServiceCreate(BaseModel):
    service_id: int
    price: Decimal
    quantity: int = 1
    discount: Decimal = 0
    appointment_date: Optional[date] = None

class AppointmentServiceOut(BaseModel):
    service_id: int
    price: Decimal
    quantity: int
    discount: Decimal
    appointment_date: Optional[date] = None
    service: Optional[ServiceOut] = None
    class Config:
        from_attributes = True

class AppointmentBase(BaseModel):
    client_id: int
    employee_id: int
    appointment_datetime: Optional[datetime] = None
    status: Optional[str] = "scheduled"

class AppointmentCreate(AppointmentBase):
    services: List[AppointmentServiceCreate] = []

class AppointmentUpdate(BaseModel):
    client_id: Optional[int] = None
    employee_id: Optional[int] = None
    appointment_datetime: Optional[datetime] = None
    status: Optional[str] = None

class AppointmentOut(AppointmentBase):
    id: int
    client: Optional[ClientOut] = None
    employee: Optional[EmployeeOut] = None
    services: List[AppointmentServiceOut] = []
    class Config:
        from_attributes = True

# ==================== SUBSCRIPTIONS ====================

class SubscriptionBase(BaseModel):
    client_id: int
    product_id: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = True

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionUpdate(BaseModel):
    client_id: Optional[int] = None
    product_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None

class SubscriptionOut(SubscriptionBase):
    id: int
    client: Optional[ClientOut] = None
    product: Optional[ProductOut] = None
    class Config:
        from_attributes = True

# ==================== REPORTS ====================

class ReportRequest(BaseModel):
    start_date: date
    end_date: date

class PopularServiceReport(BaseModel):
    service_name: str
    total_quantity: int
    total_revenue: Decimal

class TopClientReport(BaseModel):
    client_name: str
    total_spent: Decimal
    orders_count: int