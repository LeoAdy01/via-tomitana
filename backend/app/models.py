from sqlalchemy import Integer, String, Text, Float, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from .db import Base

class Category(Base):
    __tablename__ = "categories"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160))
    icon: Mapped[str] = mapped_column(String(80), default="landmark")
    color: Mapped[str] = mapped_column(String(30), default="#3b82f6")

class Poi(Base):
    __tablename__ = "pois"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(220))
    short: Mapped[str] = mapped_column(String(300), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    address: Mapped[str] = mapped_column(String(300), default="")
    opening_hours: Mapped[str] = mapped_column(String(200), default="")
    website: Mapped[str] = mapped_column(String(300), default="")
    lat: Mapped[float] = mapped_column(Float)
    lon: Mapped[float] = mapped_column(Float)
    cover_image: Mapped[str] = mapped_column(String(500), default="")
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    category = relationship("Category")

class Tour(Base):
    __tablename__ = "tours"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    poi_id: Mapped[int] = mapped_column(ForeignKey("pois.id"), index=True)
    title: Mapped[str] = mapped_column(String(220))
    duration_min: Mapped[int] = mapped_column(Integer, default=60)
    price_ron: Mapped[float] = mapped_column(Float, default=0.0)
    includes: Mapped[str] = mapped_column(Text, default="")
    poi = relationship("Poi")

class Route(Base):
    __tablename__ = "routes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(220))
    theme: Mapped[str] = mapped_column(String(120), default="")
    difficulty: Mapped[str] = mapped_column(String(40), default="ușor")
    duration_min: Mapped[int] = mapped_column(Integer, default=180)
    geojson_line: Mapped[str] = mapped_column(Text, default="[]")  # [[lon,lat],...]
    description: Mapped[str] = mapped_column(Text, default="")
    stops_csv: Mapped[str] = mapped_column(Text, default="")  # poi slugs comma-separated

class VirtualTour(Base):
    __tablename__ = "virtual_tours"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    poi_id: Mapped[int] = mapped_column(ForeignKey("pois.id"), unique=True)
    pano_url: Mapped[str] = mapped_column(String(600))
    caption: Mapped[str] = mapped_column(String(260), default="")
    poi = relationship("Poi")


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120), default="")
    password_hash: Mapped[str] = mapped_column(String(500))
    api_token: Mapped[str] = mapped_column(String(200), default="")
    role: Mapped[str] = mapped_column(String(30), default="user")


class Favorite(Base):
    __tablename__ = "favorites"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    poi_id: Mapped[int] = mapped_column(ForeignKey("pois.id"), index=True)

class Booking(Base):
    __tablename__ = "bookings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    kind: Mapped[str] = mapped_column(String(20), default="route")  # route|tour
    ref_slug: Mapped[str] = mapped_column(String(160))
    when_iso: Mapped[str] = mapped_column(String(40))
    persons: Mapped[int] = mapped_column(Integer, default=1)
    notes: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(30), default="new")
