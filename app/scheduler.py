from datetime import date, timedelta
from sqlmodel import Session, select
from apscheduler.schedulers.background import BackgroundScheduler

from app.database import engine
from app.models import PantryItem, Notification


def revisar_caducidades():
    with Session(engine) as session:
        limite = date.today() + timedelta(days=3)

        items = session.exec(
            select(PantryItem).where(PantryItem.estado == "activo")
        ).all()

        for item in items:
            fecha_relevante = item.fecha_caducidad_manual or item.fecha_caducidad_estimada
            if not fecha_relevante:
                continue

            if fecha_relevante <= limite:
                ya_existe = session.exec(
                    select(Notification).where(
                        Notification.pantry_item_id == item.id,
                        Notification.tipo == "por_caducar",
                    )
                ).first()
                if ya_existe:
                    continue

                dias_restantes = (fecha_relevante - date.today()).days
                mensaje = f"Faltan {dias_restantes} día(s) para que caduque {item.nombre_detectado}"

                notif = Notification(
                    user_id=item.user_id,
                    pantry_item_id=item.id,
                    tipo="por_caducar",
                    mensaje=mensaje,
                )
                session.add(notif)

        session.commit()


scheduler = BackgroundScheduler()
scheduler.add_job(revisar_caducidades, "interval", hours=24)