from fastapi import FastAPI
from app.routers import auth, pantry, categories, notifications
from app.scheduler import scheduler, revisar_caducidades

app = FastAPI()

app.include_router(auth.router)
app.include_router(pantry.router)
app.include_router(categories.router)
app.include_router(notifications.router)


@app.on_event("startup")
def startup_event():
    revisar_caducidades()  # corre una vez al iniciar, para no esperar 24h
    scheduler.start()


@app.get("/")
def read_root():
    return {"status": "ok"}