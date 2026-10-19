from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, auth, models
from ..database import get_db
from datetime import datetime

router = APIRouter()


@router.get("/popular-services", response_model=List[schemas.PopularServiceReport])
def get_popular_services_report(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role(["manager", "admin"]))
):
    results = crud.get_popular_services(db)
    if not results:
        raise HTTPException(status_code=404, detail="Данных нет")
    return [
        schemas.PopularServiceReport(
            service_name=row[0],
            total_quantity=int(row[1]),
            total_revenue=float(row[2])
        )
        for row in results
    ]


@router.get("/top-clients", response_model=List[schemas.TopClientReport])
def get_top_clients_report(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role(["manager", "admin"]))
):
    results = crud.get_top_clients(db)
    if not results:
        raise HTTPException(status_code=404, detail="Данных нет")
    return [
        schemas.TopClientReport(
            client_name=row[0],
            total_spent=float(row[1]),
            orders_count=int(row[2])
        )
        for row in results
    ]


@router.get("/orders-by-date")
def get_orders_by_date(
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role(["manager", "admin"]))
):
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Неверный формат даты. Используйте YYYY-MM-DD")

    orders = crud.get_orders_by_date_range(db, start, end)
    if not orders:
        return {"message": "Данных нет", "orders": []}

    result = []
    for order in orders:
        items = []
        for item in order.items:
            items.append({
                "product_name": item.product.name if item.product else "Неизвестный товар",
                "price": float(item.price),
                "quantity": item.quantity,
                "discount": float(item.discount),
                "total": float(item.price) * item.quantity * (1 - float(item.discount) / 100)
            })
        result.append({
            "order_id": order.id,
            "order_date": str(order.order_date) if order.order_date else None,
            "recipient_name": order.recipient_name,
            "delivery_method": order.delivery_method,
            "delivery_cost": float(order.delivery_cost) if order.delivery_cost else 0,
            "items": items,
            "total_order": sum(item["total"] for item in items) + (float(order.delivery_cost) if order.delivery_cost else 0)
        })

    return {"orders": result, "count": len(result)}


@router.get("/appointments-by-date")
def get_appointments_by_date(
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role(["manager", "admin"]))
):
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Неверный формат даты. Используйте YYYY-MM-DD")

    appointments = crud.get_appointments_by_date_range(db, start, end)
    if not appointments:
        return {"message": "Данных нет", "appointments": []}

    result = []
    for app in appointments:
        services = []
        for s in app.services:
            services.append({
                "service_name": s.service.name if s.service else "Неизвестная услуга",
                "price": float(s.price),
                "quantity": s.quantity,
                "discount": float(s.discount)
            })
        result.append({
            "appointment_id": app.id,
            "client_name": app.client.full_name if app.client else "Неизвестный клиент",
            "employee_name": app.employee.full_name if app.employee else "Неизвестный сотрудник",
            "datetime": str(app.appointment_datetime) if app.appointment_datetime else None,
            "status": app.status,
            "services": services
        })

    return {"appointments": result, "count": len(result)}