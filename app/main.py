from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routers import auth, pantry, categories, notifications, shopping_list, web
from app.scheduler import scheduler, revisar_caducidades
from app.routers import auth, pantry, categories, notifications, shopping_list, web, recetas


app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")

app.include_router(auth.router)
app.include_router(pantry.router)
app.include_router(categories.router)
app.include_router(notifications.router)
app.include_router(shopping_list.router)
app.include_router(web.router)
app.include_router(recetas.router)


@app.on_event("startup")
def startup_event():
    revisar_caducidades()
    scheduler.start()

