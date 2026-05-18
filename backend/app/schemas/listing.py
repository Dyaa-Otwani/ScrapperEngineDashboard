from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime

class ListingBase(BaseModel):
    business_name: str
    category: str
    city: str
    address: Optional[str] = None
    phone: Optional[str] = None
    rating: Optional[float] = 0.0
    reviews_count: Optional[int] = 0
    website: Optional[str] = None
    source: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    business_status: Optional[str] = "Active"

class ListingCreate(ListingBase):
    pass

class ListingOut(ListingBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator("rating", mode="before")
    def val_rating(cls, v):
        return 0.0 if v is None else float(v)

    @field_validator("reviews_count", mode="before")
    def val_reviews(cls, v):
        return 0 if v is None else int(v)

class DashboardStats(BaseModel):
    total_listings: int
    by_source: dict
    by_city: dict
    by_category: dict

