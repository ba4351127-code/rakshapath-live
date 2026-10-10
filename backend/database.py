import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker

# Database setup - SQLite stored in the backend directory
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saferoute.db")
DATABASE_URL = f"sqlite:///{DB_FILE}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class RescueUnit(Base):
    __tablename__ = "rescue_units"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    unit_type = Column(String(50), nullable=False)  # Ambulance, NDRF Truck, Flood Boat, Rapid Response
    state = Column(String(50), default="Delhi NCR", index=True)
    district = Column(String(50), default="Central Delhi")
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    status = Column(String(50), default="Available")  # Available, En Route, Busy
    capacity = Column(Integer, default=4)
    contact = Column(String(50), default="TAC-NET 101")
    water_clearance_cm = Column(Float, default=30.0)  # Max traversable water depth
    speed_kmh = Column(Float, default=50.0)
    last_updated = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "unit_type": self.unit_type,
            "state": self.state,
            "district": self.district,
            "lat": self.lat,
            "lon": self.lon,
            "status": self.status,
            "capacity": self.capacity,
            "contact": self.contact,
            "water_clearance_cm": self.water_clearance_cm,
            "speed_kmh": self.speed_kmh,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None
        }


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    incident_type = Column(String(50), nullable=False)  # Flood, Landslide, Debris, Bridge Washout
    severity = Column(String(20), default="Medium")      # Low, Medium, High, Critical
    state = Column(String(50), default="Delhi NCR", index=True)
    district = Column(String(50), default="Central Delhi")
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    water_depth_cm = Column(Float, default=0.0)
    damage_level = Column(Float, default=0.0)            # 0.0 to 10.0 scale
    debris_level = Column(Float, default=0.0)            # 0.0 to 10.0 scale
    status = Column(String(50), default="Active")        # Active, Cleared, Monitored
    description = Column(Text, default="")
    reported_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "incident_type": self.incident_type,
            "severity": self.severity,
            "state": self.state,
            "district": self.district,
            "lat": self.lat,
            "lon": self.lon,
            "water_depth_cm": self.water_depth_cm,
            "damage_level": self.damage_level,
            "debris_level": self.debris_level,
            "status": self.status,
            "description": self.description,
            "reported_at": self.reported_at.isoformat() if self.reported_at else None
        }


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_initial_data(db):
    """Seed multi-state emergency units and active disaster incidents."""
    if db.query(RescueUnit).count() == 0:
        sample_units = [
            # Delhi NCR
            RescueUnit(
                name="Delhi ALS Ambulance Rapid-1",
                unit_type="Ambulance",
                state="Delhi NCR",
                district="Central Delhi",
                lat=28.6250,
                lon=77.2100,
                status="Available",
                capacity=2,
                contact="DL-DISPATCH-01",
                water_clearance_cm=30.0,
                speed_kmh=55.0
            ),
            RescueUnit(
                name="NDRF Battalion 8 Heavy Rescue",
                unit_type="NDRF Truck",
                state="Delhi NCR",
                district="North Delhi",
                lat=28.6600,
                lon=77.2180,
                status="Available",
                capacity=12,
                contact="NDRF-DL-HQ",
                water_clearance_cm=85.0,
                speed_kmh=45.0
            ),
            RescueUnit(
                name="Yamuna SDRF Inflatable Boat-04",
                unit_type="Flood Boat",
                state="Delhi NCR",
                district="East Delhi",
                lat=28.6200,
                lon=77.2450,
                status="Available",
                capacity=8,
                contact="BOAT-SAR-DL",
                water_clearance_cm=200.0,
                speed_kmh=30.0
            ),
            # Uttarakhand
            RescueUnit(
                name="SDRF Uttarakhand Mountain Rescue",
                unit_type="Rapid Response",
                state="Uttarakhand",
                district="Dehradun",
                lat=30.3250,
                lon=78.0400,
                status="Available",
                capacity=6,
                contact="UK-SAR-MOUNTAIN",
                water_clearance_cm=50.0,
                speed_kmh=50.0
            ),
            RescueUnit(
                name="AIIMS Rishikesh Heli-Ambulance Liaison",
                unit_type="Ambulance",
                state="Uttarakhand",
                district="Rishikesh",
                lat=30.0750,
                lon=78.2900,
                status="Available",
                capacity=3,
                contact="UK-HELI-MED-1",
                water_clearance_cm=35.0,
                speed_kmh=60.0
            ),
            # Assam
            RescueUnit(
                name="NDRF Battalion 1 Brahmaputra Water Strike",
                unit_type="Flood Boat",
                state="Assam",
                district="Guwahati",
                lat=26.1850,
                lon=91.7350,
                status="Available",
                capacity=15,
                contact="AS-BOAT-NDRF-1",
                water_clearance_cm=250.0,
                speed_kmh=32.0
            ),
            RescueUnit(
                name="Guwahati Medical Center Emergency Fleet",
                unit_type="Ambulance",
                state="Assam",
                district="Guwahati",
                lat=26.1550,
                lon=91.7700,
                status="Available",
                capacity=2,
                contact="AS-GMCH-AMB",
                water_clearance_cm=28.0,
                speed_kmh=52.0
            ),
            # Maharashtra
            RescueUnit(
                name="Mumbai Municipal Disaster Quick Unit-3",
                unit_type="Rapid Response",
                state="Maharashtra",
                district="Mumbai South",
                lat=18.9950,
                lon=72.8400,
                status="Available",
                capacity=5,
                contact="MCGM-EMERG-3",
                water_clearance_cm=45.0,
                speed_kmh=50.0
            ),
            RescueUnit(
                name="Thane NDRF High-Clearance Truck",
                unit_type="NDRF Truck",
                state="Maharashtra",
                district="Thane",
                lat=19.2150,
                lon=72.9800,
                status="Available",
                capacity=10,
                contact="MH-NDRF-TRUCK",
                water_clearance_cm=90.0,
                speed_kmh=45.0
            ),
            # Uttar Pradesh
            RescueUnit(
                name="KGMU Lucknow Trauma Emergency Bus",
                unit_type="Evacuation Bus",
                state="Uttar Pradesh",
                district="Lucknow",
                lat=26.8650,
                lon=80.9150,
                status="Available",
                capacity=25,
                contact="UP-KGMU-EVAC",
                water_clearance_cm=40.0,
                speed_kmh=42.0
            ),
            RescueUnit(
                name="Agra Heritage Disaster Rescue Squad",
                unit_type="NDRF Truck",
                state="Uttar Pradesh",
                district="Agra",
                lat=27.1800,
                lon=78.0100,
                status="Available",
                capacity=10,
                contact="UP-AGRA-SAR-1",
                water_clearance_cm=85.0,
                speed_kmh=48.0
            ),
            RescueUnit(
                name="Varanasi Kashi Ghats Flood Rescue-1",
                unit_type="Flood Boat",
                state="Uttar Pradesh",
                district="Varanasi",
                lat=25.3120,
                lon=83.0100,
                status="Available",
                capacity=12,
                contact="UP-VAR-BOAT",
                water_clearance_cm=200.0,
                speed_kmh=30.0
            ),
            # Bihar
            RescueUnit(
                name="NDRF Battalion 9 Quick Response, Patna",
                unit_type="NDRF Truck",
                state="Bihar",
                district="Patna",
                lat=25.5780,
                lon=85.0120,
                status="Available",
                capacity=14,
                contact="BR-NDRF-9",
                water_clearance_cm=90.0,
                speed_kmh=45.0
            ),
            # West Bengal
            RescueUnit(
                name="Kolkata Hooghly Disaster Water SAR",
                unit_type="Flood Boat",
                state="West Bengal",
                district="Howrah",
                lat=22.5850,
                lon=88.3420,
                status="Available",
                capacity=10,
                contact="WB-SAR-BOAT-1",
                water_clearance_cm=220.0,
                speed_kmh=28.0
            ),
            # Gujarat
            RescueUnit(
                name="Ahmedabad Sabarmati Rapid Response Unit",
                unit_type="Rapid Response",
                state="Gujarat",
                district="Ahmedabad",
                lat=23.0310,
                lon=72.5780,
                status="Available",
                capacity=6,
                contact="GJ-AHM-RAPID",
                water_clearance_cm=50.0,
                speed_kmh=60.0
            )
        ]
        db.add_all(sample_units)
        db.commit()

    if db.query(Incident).count() == 0:
        sample_incidents = [
            # Delhi
            Incident(
                title="Yamuna Riverfront Causeway Submerged",
                incident_type="Flood",
                severity="Critical",
                state="Delhi NCR",
                district="Mayur Vihar",
                lat=28.6250,
                lon=77.2480,
                water_depth_cm=75.0,
                damage_level=7.0,
                debris_level=6.0,
                status="Active",
                description="River floodwaters breach eastern causeway. Impassable for light vehicles."
            ),
            # Uttarakhand
            Incident(
                title="Devprayag Highway Rockfall & Debris Slide",
                incident_type="Landslide",
                severity="High",
                state="Uttarakhand",
                district="Chamoli",
                lat=30.1450,
                lon=78.5980,
                water_depth_cm=10.0,
                damage_level=8.5,
                debris_level=8.0,
                status="Active",
                description="Heavy boulder slide on mountain highway. High clearance required."
            ),
            # Uttar Pradesh (Agra)
            Incident(
                title="Strachey Bridge Approach Waterlogging & Cracking",
                incident_type="Flood",
                severity="High",
                state="Uttar Pradesh",
                district="Agra",
                lat=27.1950,
                lon=78.0320,
                water_depth_cm=60.0,
                damage_level=6.5,
                debris_level=5.0,
                status="Active",
                description="Yamuna overflow submerged lower road bridge approach near Agra Fort."
            ),
            # Bihar (Patna)
            Incident(
                title="Mahatma Gandhi Setu Approach Inundation",
                incident_type="Flood",
                severity="Critical",
                state="Bihar",
                district="Patna",
                lat=25.6050,
                lon=85.2150,
                water_depth_cm=70.0,
                damage_level=5.5,
                debris_level=6.0,
                status="Active",
                description="Ganga monsoon surge pooling at southern bridge abutment."
            ),
            # Assam
            Incident(
                title="Saraighat Low Bridge Inundation Surge",
                incident_type="Flood",
                severity="Critical",
                state="Assam",
                district="Guwahati",
                lat=26.1750,
                lon=91.6850,
                water_depth_cm=85.0,
                damage_level=6.0,
                debris_level=7.5,
                status="Active",
                description="Brahmaputra overflow. Low approaches submerged by 85cm flood water."
            ),
            # Maharashtra
            Incident(
                title="Mithi River Basin Flash Waterlogging",
                incident_type="Flood",
                severity="High",
                state="Maharashtra",
                district="Mumbai",
                lat=19.0600,
                lon=72.8650,
                water_depth_cm=55.0,
                damage_level=5.0,
                debris_level=6.0,
                status="Active",
                description="Urban drainage surge along Mithi river bridge connection."
            )
        ]
        db.add_all(sample_incidents)
        db.commit()



def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    print("RakshaPath database schema & multi-state data initialized successfully.")
