import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker



load_dotenv()


DB_URL = os.getenv("DATABASE_URL")


try:
    engine = create_engine(
        DB_URL,
        pool_size=10,
        max_overflow=20,
        echo=False
    )

    # Test MySQL connection
    with engine.connect() as conn:
        print("Connected to MySQL successfully!")

except Exception as e:
    print(f"MySQL connection failed: {e}")
    raise e


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)



Base = declarative_base()



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



def init_db():
    
    from app.models.listing import Listing
    
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        if db.query(Listing).count() == 0:
            print("Database is empty. Seeding initial data from dump.sql...")
            dump_path = os.path.abspath(
                os.path.join(
                    os.path.dirname(__file__),
                    "../../database/dump.sql"
                )
            )

            if os.path.exists(dump_path):
                with open(dump_path, "r", encoding="utf-8") as f:
                    sql_query = ""
                    for line in f:
                        line = line.strip()
                      
                        if not line or line.startswith("--"):
                            continue
                        sql_query += line + " "
                        # Execute complete SQL statement
                        if line.endswith(";"):
                            try:
                                db.execute(text(sql_query))
                                db.commit()
                            except Exception as sql_error:
                                db.rollback()
                                print(f"SQL Error: {sql_error}")
                            sql_query = ""

                print("Database seeding completed successfully!")
            else:
                print(f"dump.sql file not found at: {dump_path}")

    except Exception as e:
        print(f"Error during database initialization: {e}")

    finally:
        db.close()