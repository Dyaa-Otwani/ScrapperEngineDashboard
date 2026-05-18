from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import func
import uuid, io, json
import pandas as pd

from app.database import get_db
from app.models.listing import Listing
from app.scrapers.engine import scraper_engine

router = APIRouter()

# ── Scraper ──────────────────────────────────────────────────────────────────
@router.post("/scrape/start")
def start_scraping(request: dict):
    job_id = str(uuid.uuid4())
    count   = request.get("count", 900)
    sources = request.get("sources", ["Google Maps", "Justdial", "Sulekha"])
    scraper_engine.start_job(job_id, request.get("city"), request.get("category"), count, sources)
    return {"job_id": job_id, "status": "Started"}

@router.get("/scrape/status/{job_id}")
def get_status(job_id: str):
    job = scraper_engine.jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# ── Analytics (case-normalised grouping) ─────────────────────────────────────
@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    total = db.query(func.count(Listing.id)).scalar()

    # case-insensitive merge using Python dict
    raw_source   = db.query(Listing.source,   func.count(Listing.id)).group_by(Listing.source).all()
    raw_city     = db.query(Listing.city,     func.count(Listing.id)).group_by(Listing.city).all()
    raw_category = db.query(Listing.category, func.count(Listing.id)).group_by(Listing.category).all()

    def merge(rows):
        merged = {}
        for k, v in rows:
            key = (k or "Unknown").strip().title()
            merged[key] = merged.get(key, 0) + v
        return [{"name": k, "value": v} for k, v in sorted(merged.items(), key=lambda x: -x[1])]

    # rating distribution buckets
    raw_ratings = db.query(Listing.rating).all()
    buckets = {"1–2": 0, "2–3": 0, "3–4": 0, "4–5": 0, "No Rating": 0}
    for (r,) in raw_ratings:
        if r is None or r == 0:
            buckets["No Rating"] += 1
        elif r < 2:
            buckets["1–2"] += 1
        elif r < 3:
            buckets["2–3"] += 1
        elif r < 4:
            buckets["3–4"] += 1
        else:
            buckets["4–5"] += 1
    rating_dist = [{"name": k, "value": v} for k, v in buckets.items()]

    # avg rating per source
    avg_by_source = db.query(Listing.source, func.avg(Listing.rating)).group_by(Listing.source).all()
    avg_source = [{"name": (k or "Unknown").strip().title(), "value": round(v or 0, 2)} for k, v in avg_by_source if v]

    # listings per city per source (for stacked chart)
    city_source = db.query(Listing.city, Listing.source, func.count(Listing.id))\
        .group_by(Listing.city, Listing.source).all()
    city_source_map = {}
    for city, source, cnt in city_source:
        city_k = (city or "Unknown").strip().title()
        if city_k not in city_source_map:
            city_source_map[city_k] = {"name": city_k}
        src_k = (source or "Unknown").strip().title()
        city_source_map[city_k][src_k] = city_source_map[city_k].get(src_k, 0) + cnt
        
    stacked_city = sorted(city_source_map.values(), key=lambda x: -sum(v for k, v in x.items() if k != "name"))

    return {
        "total_listings": total,
        "by_source":       merge(raw_source),
        "by_city":         merge(raw_city),
        "by_category":     merge(raw_category),
        "rating_dist":     rating_dist,
        "avg_rating_by_source": avg_source,
        "stacked_city":    stacked_city,
    }

# ── Dashboard quick counts ────────────────────────────────────────────────────
@router.get("/dashboard/city-count")
def get_city_count(db: Session = Depends(get_db)):
    raw = db.query(Listing.city, func.count(Listing.id)).group_by(Listing.city).all()
    merged = {}
    for k, v in raw:
        key = (k or "Unknown").strip().title()
        merged[key] = merged.get(key, 0) + v
    return sorted([{"name": k, "value": v} for k, v in merged.items()], key=lambda x: -x["value"])

@router.get("/dashboard/category-count")
def get_category_count(db: Session = Depends(get_db)):
    raw = db.query(Listing.category, func.count(Listing.id)).group_by(Listing.category).all()
    merged = {}
    for k, v in raw:
        key = (k or "Unknown").strip().title()
        merged[key] = merged.get(key, 0) + v
    return sorted([{"name": k, "value": v} for k, v in merged.items()], key=lambda x: -x["value"])

@router.get("/dashboard/source-count")
def get_source_count(db: Session = Depends(get_db)):
    raw = db.query(Listing.source, func.count(Listing.id)).group_by(Listing.source).all()
    merged = {}
    for k, v in raw:
        key = (k or "Unknown").strip().title()
        merged[key] = merged.get(key, 0) + v
    return [{"name": k, "value": v} for k, v in merged.items()]

# ── Database CRUD (view + edit records) ──────────────────────────────────────
@router.get("/db/listings")
def db_list(skip: int = 0, limit: int = 100, search: str = None,
            city: str = None, source: str = None, db: Session = Depends(get_db)):
    q = db.query(Listing)
    if search:   q = q.filter(Listing.business_name.ilike(f"%{search}%"))
    if city:     q = q.filter(Listing.city.ilike(f"%{city}%"))
    if source:   q = q.filter(Listing.source == source)
    total = q.count()
    rows  = q.order_by(Listing.id.desc()).offset(skip).limit(limit).all()
    data  = [{c.name: getattr(r, c.name) for c in Listing.__table__.columns} for r in rows]
    for d in data:
        if d.get("created_at") and hasattr(d["created_at"], "isoformat"):
            d["created_at"] = d["created_at"].isoformat()
    return {"total": total, "records": data}

@router.get("/db/listings/{record_id}")
def db_get(record_id: int, db: Session = Depends(get_db)):
    row = db.query(Listing).filter(Listing.id == record_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Record not found")
    d = {c.name: getattr(row, c.name) for c in Listing.__table__.columns}
    if d.get("created_at") and hasattr(d["created_at"], "isoformat"):
        d["created_at"] = d["created_at"].isoformat()
    return d

@router.put("/db/listings/{record_id}")
def db_update(record_id: int, payload: dict = Body(...), db: Session = Depends(get_db)):
    row = db.query(Listing).filter(Listing.id == record_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Record not found")
    allowed = {"business_name", "category", "city", "address", "phone",
               "rating", "reviews_count", "website", "source", "business_status"}
    for k, v in payload.items():
        if k in allowed:
            setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return {"ok": True, "id": record_id}

@router.delete("/db/listings/{record_id}")
def db_delete(record_id: int, db: Session = Depends(get_db)):
    row = db.query(Listing).filter(Listing.id == record_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(row)
    db.commit()
    return {"ok": True, "deleted": record_id}

# ── Export ────────────────────────────────────────────────────────────────────
@router.get("/export/csv")
@router.get("/export/db/csv")
def export_csv(db: Session = Depends(get_db)):
    rows  = db.query(Listing).all()
    data  = [{c.name: getattr(r, c.name) for c in Listing.__table__.columns} for r in rows]
    df    = pd.DataFrame(data)
    buf   = io.StringIO()
    df.to_csv(buf, index=False)
    return Response(content=buf.getvalue(), media_type="text/csv",
                    headers={"Content-Disposition": "attachment; filename=listings_export.csv"})

@router.get("/export/excel")
def export_excel(db: Session = Depends(get_db)):
    rows  = db.query(Listing).all()
    data  = [{c.name: getattr(r, c.name) for c in Listing.__table__.columns} for r in rows]
    df    = pd.DataFrame(data)
    buf   = io.BytesIO()
    df.to_excel(buf, index=False, engine="openpyxl")
    return Response(content=buf.getvalue(),
                    media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    headers={"Content-Disposition": "attachment; filename=listings_export.xlsx"})

@router.get("/export/json")
def export_json(db: Session = Depends(get_db)):
    rows  = db.query(Listing).all()
    data  = [{c.name: (getattr(r, c.name) if getattr(r, c.name) is not None else "")
              for c in Listing.__table__.columns} for r in rows]
    for d in data:
        if d.get("created_at") and hasattr(d["created_at"], "isoformat"):
            d["created_at"] = d["created_at"].isoformat()
    return Response(content=json.dumps(data, indent=2), media_type="application/json",
                    headers={"Content-Disposition": "attachment; filename=listings_export.json"})
