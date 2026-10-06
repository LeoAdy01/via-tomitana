from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
import json, math


from .db import Base, engine, get_db
from .models import Category, Poi, Tour, Route, VirtualTour, User, Favorite, Booking
from .seed import seed

app = FastAPI(title="Via Tomitana API", version="0.1.0")


from pydantic import BaseModel
import secrets, hashlib, base64

def _hash_password(password: str, salt_b64: str | None = None) -> str:
    salt = base64.b64decode(salt_b64) if salt_b64 else secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 150_000)
    return f"pbkdf2_sha256$150000${base64.b64encode(salt).decode()}${base64.b64encode(dk).decode()}"

def _verify_password(password: str, stored: str) -> bool:
    try:
        alg, iters, salt_b64, hash_b64 = stored.split("$")
        if alg != "pbkdf2_sha256":
            return False
        test = _hash_password(password, salt_b64)
        return secrets.compare_digest(test, stored)
    except Exception:
        return False

def _new_token() -> str:
    return secrets.token_urlsafe(32)

class SignUpIn(BaseModel):
    email: str
    password: str
    name: str | None = ""

class LoginIn(BaseModel):
    email: str
    password: str

@app.post("/api/auth/signup")
def signup(payload: SignUpIn, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if not email or "@" not in email:
        return {"error":"invalid_email"}
    if not payload.password or len(payload.password) < 6:
        return {"error":"weak_password", "hint":"Minim 6 caractere."}

    exists = db.query(User).filter(User.email == email).first()
    if exists:
        return {"error":"email_exists"}

    u = User(
        email=email,
        name=(payload.name or "").strip(),
        password_hash=_hash_password(payload.password),
        api_token=_new_token()
    )
    db.add(u)
    db.commit()
    return {"ok": True, "token": u.api_token, "user": {"email": u.email, "name": u.name}}

@app.post("/api/auth/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    u = db.query(User).filter(User.email == email).first()
    if not u or not _verify_password(payload.password, u.password_hash):
        return {"error":"invalid_credentials"}

    u.api_token = _new_token()
    db.add(u)
    db.commit()
    return {"ok": True, "token": u.api_token, "user": {"email": u.email, "name": u.name}}

class MeIn(BaseModel):
    token: str

@app.post("/api/auth/me")
def me(payload: MeIn, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.api_token == payload.token).first()
    if not u:
        return {"error":"unauthorized"}
    return {"ok": True, "user": {"email": u.email, "name": u.name}}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    with next(get_db()) as db:
        seed(db)

@app.get("/health")
def health():
    return {"ok": True, "service": "via-tomitiana-api"}

@app.get("/api/categories")
def categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name.asc()).all()

def to_feature(p: Poi):
    return {
        "type":"Feature",
        "geometry":{"type":"Point","coordinates":[p.lon, p.lat]},
        "properties":{
            "id": p.id,
            "slug": p.slug,
            "name": p.name,
            "short": p.short,
            "cover_image": p.cover_image,
            "category": {"slug": p.category.slug, "name": p.category.name, "icon": p.category.icon, "color": p.category.color},
        }
    }

@app.get("/api/pois")
def list_pois(
    db: Session = Depends(get_db),
    q: str | None = None,
    category: str | None = None,
    near: str | None = None,
    radius_m: int = Query(2000, ge=50, le=50000),
):
    qs = db.query(Poi).options(joinedload(Poi.category))
    if q:
        qs = qs.filter(Poi.name.ilike(f"%{q}%"))
    if category:
        qs = qs.join(Category).filter(Category.slug == category)
    pois = qs.all()

    if near:
        lat, lon = [float(x) for x in near.split(",")]
        def dist_m(p: Poi):
            R=6371000
            phi1=math.radians(lat); phi2=math.radians(p.lat)
            dphi=math.radians(p.lat-lat); dl=math.radians(p.lon-lon)
            a=math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dl/2)**2
            return 2*R*math.asin(math.sqrt(a))
        pois = [p for p in pois if dist_m(p) <= radius_m]

    return {"type":"FeatureCollection","features":[to_feature(p) for p in pois]}

@app.get("/api/pois/{slug}")
def poi_detail(slug: str, db: Session = Depends(get_db)):
    poi = db.query(Poi).options(joinedload(Poi.category)).filter(Poi.slug == slug).first()
    if not poi:
        return {"error":"not_found"}

    tours = db.query(Tour).filter(Tour.poi_id == poi.id).all()
    vt = db.query(VirtualTour).filter(VirtualTour.poi_id == poi.id).first()

    return {
        "id": poi.id, "slug": poi.slug, "name": poi.name, "short": poi.short,
        "description": poi.description, "address": poi.address,
        "opening_hours": poi.opening_hours, "website": poi.website,
        "lat": poi.lat, "lon": poi.lon, "cover_image": poi.cover_image,
        "category": {"id": poi.category.id, "slug": poi.category.slug, "name": poi.category.name, "icon": poi.category.icon, "color": poi.category.color},
        "tours": [{"id": t.id, "title": t.title, "duration_min": t.duration_min, "price_ron": t.price_ron, "includes": t.includes} for t in tours],
        "virtual_tour": ({"pano_url": vt.pano_url, "caption": vt.caption} if vt else None)
    }

@app.get("/api/routes")
def routes(db: Session = Depends(get_db)):
    rs = db.query(Route).order_by(Route.name.asc()).all()
    out=[]
    for r in rs:
        line = json.loads(r.geojson_line or "[]")
        out.append({
            "id": r.id, "slug": r.slug, "name": r.name,
            "theme": r.theme, "difficulty": r.difficulty, "duration_min": r.duration_min,
            "description": r.description,
            "stops": [s for s in (r.stops_csv or "").split(",") if s],
            "geojson": {"type":"Feature","geometry":{"type":"LineString","coordinates":line},"properties":{"slug":r.slug,"name":r.name}}
        })
    return out

@app.get("/api/routes/{slug}")
def route_detail(slug: str, db: Session = Depends(get_db)):
    r = db.query(Route).filter(Route.slug == slug).first()
    if not r:
        return {"error":"not_found"}
    line = json.loads(r.geojson_line or "[]")
    return {
        "id": r.id, "slug": r.slug, "name": r.name,
        "theme": r.theme, "difficulty": r.difficulty, "duration_min": r.duration_min,
        "description": r.description,
        "stops": [s for s in (r.stops_csv or "").split(",") if s],
        "geojson": {"type":"Feature","geometry":{"type":"LineString","coordinates":line},"properties":{"slug":r.slug,"name":r.name}}
    }

@app.post("/api/recommendations")
def recommendations(payload: dict, db: Session = Depends(get_db)):
    interests = [str(x).lower() for x in payload.get("interests", [])]
    time_minutes = int(payload.get("time_minutes", 180))
    start = payload.get("start") or {"lat":44.176,"lon":28.659}
    lat=float(start.get("lat",44.176)); lon=float(start.get("lon",28.659))

    pois = db.query(Poi).options(joinedload(Poi.category)).all()

    def hav_m(p):
        R=6371000
        phi1=math.radians(lat); phi2=math.radians(p.lat)
        dphi=math.radians(p.lat-lat); dl=math.radians(p.lon-lon)
        a=math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dl/2)**2
        return 2*R*math.asin(math.sqrt(a))

    def score(p):
        d = hav_m(p)
        s = max(0, 2000-d)/2000
        text = (p.name+" "+p.short+" "+p.category.name).lower()
        for kw in interests:
            if kw and kw in text:
                s += 1.2
        if ("istorie" in interests or "antic" in interests) and p.category.slug == "antic":
            s += 0.6
        if ("arhitectura" in interests or "foto" in interests) and p.category.slug == "belle-epoque":
            s += 0.5
        return s

    k = min(6, max(3, time_minutes//60))
    ranked = sorted(pois, key=score, reverse=True)[:k]
    return {
        "summary":"Itinerar generat automat (MVP).",
        "time_minutes": time_minutes,
        "itinerary":[{"slug":p.slug,"name":p.name,"why":"Aproape + relevant pentru interesele tale."} for p in ranked],
        "tips":[
            "Folosește pagina de Trasee pentru explorare ghidată.",
            "Înlocuiește datele cu surse oficiale când finalizezi proiectul."
        ]
    }


from fastapi import Header

def get_current_user(token: str | None, db: Session):
    if not token:
        return None
    t = token.replace("Bearer", "").strip()
    if not t:
        return None
    return db.query(User).filter(User.api_token == t).first()

def require_admin(auth: str | None, db: Session):
    u = get_current_user(auth, db)
    if not u or u.role != "admin":
        return None
    return u

@app.get("/api/favorites")
def list_favorites(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    u = get_current_user(authorization, db)
    if not u:
        return {"error":"unauthorized"}
    favs = db.query(Favorite).filter(Favorite.user_id == u.id).all()
    poi_ids = [f.poi_id for f in favs]
    pois = db.query(Poi).options(joinedload(Poi.category)).filter(Poi.id.in_(poi_ids)).all() if poi_ids else []
    return {"items":[to_feature(p) for p in pois]}

@app.post("/api/favorites/{poi_slug}")
def add_favorite(poi_slug: str, authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    u = get_current_user(authorization, db)
    if not u:
        return {"error":"unauthorized"}
    poi = db.query(Poi).filter(Poi.slug == poi_slug).first()
    if not poi:
        return {"error":"not_found"}
    exists = db.query(Favorite).filter(Favorite.user_id==u.id, Favorite.poi_id==poi.id).first()
    if not exists:
        db.add(Favorite(user_id=u.id, poi_id=poi.id)); db.commit()
    return {"ok":True}

@app.delete("/api/favorites/{poi_slug}")
def remove_favorite(poi_slug: str, authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    u = get_current_user(authorization, db)
    if not u:
        return {"error":"unauthorized"}
    poi = db.query(Poi).filter(Poi.slug == poi_slug).first()
    if not poi:
        return {"error":"not_found"}
    db.query(Favorite).filter(Favorite.user_id==u.id, Favorite.poi_id==poi.id).delete()
    db.commit()
    return {"ok":True}

class BookingIn(BaseModel):
    kind: str = "route"
    ref_slug: str
    when_iso: str
    persons: int = 1
    notes: str | None = ""

@app.post("/api/bookings")
def create_booking(payload: BookingIn, authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    u = get_current_user(authorization, db)
    if not u:
        return {"error":"unauthorized"}
    b = Booking(user_id=u.id, kind=payload.kind, ref_slug=payload.ref_slug, when_iso=payload.when_iso,
                persons=max(1, int(payload.persons or 1)), notes=(payload.notes or "")[:1000], status="new")
    db.add(b); db.commit(); db.refresh(b)
    return {"ok":True, "id": b.id}

@app.get("/api/bookings/me")
def my_bookings(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    u = get_current_user(authorization, db)
    if not u:
        return {"error":"unauthorized"}
    bs = db.query(Booking).filter(Booking.user_id==u.id).order_by(Booking.id.desc()).all()
    return {"items":[{"id":b.id,"kind":b.kind,"ref_slug":b.ref_slug,"when_iso":b.when_iso,"persons":b.persons,"notes":b.notes,"status":b.status} for b in bs]}

@app.get("/api/admin/bookings")
def admin_bookings(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    a = require_admin(authorization, db)
    if not a:
        return {"error":"unauthorized"}
    bs = db.query(Booking).order_by(Booking.id.desc()).limit(200).all()
    users = {u.id:u for u in db.query(User).filter(User.id.in_([b.user_id for b in bs])).all()} if bs else {}
    return {"items":[{"id":b.id,"kind":b.kind,"ref_slug":b.ref_slug,"when_iso":b.when_iso,"persons":b.persons,"notes":b.notes,"status":b.status,"user_email":users.get(b.user_id).email if users.get(b.user_id) else ""} for b in bs]}


class OAuthIn(BaseModel):
    email: str
    name: str | None = ""
    provider: str = "google"

@app.post("/api/auth/oauth")
def oauth_login(payload: OAuthIn, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if not email or "@" not in email:
        return {"error":"invalid_email"}

    u = db.query(User).filter(User.email == email).first()
    if not u:
        u = User(
            email=email,
            name=(payload.name or "").strip(),
            password_hash="oauth$external",
            api_token=_new_token(),
            role="user",
        )
        db.add(u)
        db.commit()
        db.refresh(u)
    else:
        u.api_token = _new_token()
        if payload.name and not u.name:
            u.name = payload.name.strip()
        db.add(u)
        db.commit()

    return {"ok": True, "token": u.api_token, "user": {"email": u.email, "name": u.name, "role": getattr(u, "role", "user")}}


class PoiUpsert(BaseModel):
    slug: str
    name: str
    short: str | None = ""
    description: str | None = ""
    address: str | None = ""
    opening_hours: str | None = ""
    website: str | None = ""
    lat: float
    lon: float
    cover_image: str | None = ""
    category_slug: str

@app.post("/api/admin/pois")
def admin_upsert_poi(payload: PoiUpsert, authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    a = require_admin(authorization, db)
    if not a:
        return {"error":"unauthorized"}
    cat = db.query(Category).filter(Category.slug == payload.category_slug).first()
    if not cat:
        return {"error":"bad_category"}
    poi = db.query(Poi).filter(Poi.slug == payload.slug).first()
    if not poi:
        poi = Poi(slug=payload.slug, name=payload.name, lat=float(payload.lat), lon=float(payload.lon), category_id=cat.id)
        db.add(poi)
    poi.name = payload.name
    poi.short = payload.short or ""
    poi.description = payload.description or ""
    poi.address = payload.address or ""
    poi.opening_hours = payload.opening_hours or ""
    poi.website = payload.website or ""
    poi.lat = float(payload.lat)
    poi.lon = float(payload.lon)
    poi.cover_image = payload.cover_image or ""
    poi.category_id = cat.id
    db.commit()
    return {"ok": True}

@app.delete("/api/admin/pois/{slug}")
def admin_delete_poi(slug: str, authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    a = require_admin(authorization, db)
    if not a:
        return {"error":"unauthorized"}
    poi = db.query(Poi).filter(Poi.slug == slug).first()
    if not poi:
        return {"error":"not_found"}
    db.query(Favorite).filter(Favorite.poi_id == poi.id).delete()
    db.query(Tour).filter(Tour.poi_id == poi.id).delete()
    db.query(VirtualTour).filter(VirtualTour.poi_id == poi.id).delete()
    db.delete(poi)
    db.commit()
    return {"ok": True}
