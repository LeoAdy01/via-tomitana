import json
from sqlalchemy.orm import Session
from .models import Category, Poi, Tour, Route, VirtualTour, User
from .seed_data import DATA



def _make_admin_if_missing(db: Session):
    email = "admin@viatomitana.local"
    exists = db.query(User).filter(User.email == email).first()
    if exists:
        return
    import secrets, hashlib, base64
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", b"admin123", salt, 150_000)
    pw = f"pbkdf2_sha256$150000${base64.b64encode(salt).decode()}${base64.b64encode(dk).decode()}"
    u = User(email=email, name="Admin", password_hash=pw, api_token=secrets.token_urlsafe(32), role="admin")
    db.add(u)
    db.commit()
    _make_admin_if_missing(db)


def seed(db: Session):
    if db.query(Category).count() > 0:
        return

    slug_to_cat={}
    for c in DATA["categories"]:
        cat = Category(slug=c["slug"], name=c["name"], icon=c.get("icon","landmark"), color=c.get("color","#3b82f6"))
        db.add(cat); db.flush()
        slug_to_cat[c["slug"]] = cat

    for p in DATA["pois"]:
        cat = slug_to_cat[p["category_slug"]]
        poi = Poi(
            slug=p["slug"], name=p["name"], short=p.get("short",""),
            description=p.get("description",""), address=p.get("address",""),
            opening_hours=p.get("opening_hours",""), website=p.get("website",""),
            lat=p["lat"], lon=p["lon"], cover_image=p.get("cover_image",""),
            category_id=cat.id
        )
        db.add(poi); db.flush()

        for t in p.get("tours", []):
            db.add(Tour(
                poi_id=poi.id,
                title=t["title"],
                duration_min=t.get("duration_min",60),
                price_ron=float(t.get("price_ron",0)),
                includes=t.get("includes","")
            ))

        vt = p.get("virtual_tour")
        if vt:
            db.add(VirtualTour(poi_id=poi.id, pano_url=vt["pano_url"], caption=vt.get("caption","")))

    for r in DATA["routes"]:
        db.add(Route(
            slug=r["slug"], name=r["name"], theme=r.get("theme",""),
            difficulty=r.get("difficulty","ușor"), duration_min=r.get("duration_min",180),
            description=r.get("description",""),
            stops_csv=",".join(r.get("stops",[])),
            geojson_line=json.dumps(r.get("line",[]))
        ))
    db.commit()
    _make_admin_if_missing(db)
