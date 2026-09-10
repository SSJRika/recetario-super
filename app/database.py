from sqlmodel import create_engine, Session

DATABASE_URL = "postgresql://recetario_user:123@localhost:5432/recetario_db"

engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session