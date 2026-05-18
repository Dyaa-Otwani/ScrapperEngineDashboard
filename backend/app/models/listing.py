from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database import Base

class Listing(Base):
    __tablename__ = "listing_master"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    business_name = Column(String(255), index=True)
    category = Column(String(100), index=True)
    city = Column(String(100), index=True)
    address = Column(String(500))
    phone = Column(String(50))
    rating = Column(Float)
    reviews_count = Column(Integer)
    website = Column(String(255))
    source = Column(String(100), index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    business_status = Column(String(50), default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)
