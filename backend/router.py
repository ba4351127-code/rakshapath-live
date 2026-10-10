import networkx as nx
from typing import List, Dict, Any, Tuple, Optional
from backend.hazard_engine import calculate_hazard_risk, haversine_distance_km

# Comprehensive National Emergency Mobility Network Hubs
NETWORK_NODES = {
    # ==================== 1. UTTAR PRADESH ====================
    # Lucknow
    "UP_SGPGI_LKO": {
        "name": "SGPGI Apex Medical & Research Center",
        "state": "Uttar Pradesh",
        "district": "Lucknow",
        "lat": 26.7550,
        "lon": 80.9400,
        "category": "Hospital"
    },
    "UP_KGMU_LKO": {
        "name": "KGMU Super-Specialty Trauma Center",
        "state": "Uttar Pradesh",
        "district": "Lucknow",
        "lat": 26.8680,
        "lon": 80.9160,
        "category": "Hospital"
    },
    "UP_EKANA_LKO": {
        "name": "Ekana Disaster Relief & Evacuation Hub",
        "state": "Uttar Pradesh",
        "district": "Lucknow",
        "lat": 26.8080,
        "lon": 81.0150,
        "category": "Relief Shelter"
    },
    "UP_GOMTI_CHOKE": {
        "name": "Gomti River Barrage Chokepoint",
        "state": "Uttar Pradesh",
        "district": "Lucknow",
        "lat": 26.8520,
        "lon": 80.9750,
        "category": "Bridge/Chokepoint"
    },
    "UP_LUCKNOW_HQ": {
        "name": "UP State Relief Commissioner Command",
        "state": "Uttar Pradesh",
        "district": "Lucknow",
        "lat": 26.8467,
        "lon": 80.9462,
        "category": "Command Center"
    },
    # Agra
    "UP_AGRA_HOSP": {
        "name": "SN Medical College & District Emergency Hospital",
        "state": "Uttar Pradesh",
        "district": "Agra",
        "lat": 27.1820,
        "lon": 78.0050,
        "category": "Hospital"
    },
    "UP_TAJ_RELIEF": {
        "name": "Taj Heritage Disaster Relief & Staging Center",
        "state": "Uttar Pradesh",
        "district": "Agra",
        "lat": 27.1750,
        "lon": 78.0420,
        "category": "Relief Shelter"
    },
    "UP_AGRA_ARMY_HELI": {
        "name": "Agra Air Force Station Tactical Helipad",
        "state": "Uttar Pradesh",
        "district": "Agra",
        "lat": 27.1550,
        "lon": 77.9620,
        "category": "Helipad"
    },
    "UP_YAMUNA_AGRA_CHOKE": {
        "name": "Strachey Bridge Yamuna Crossing Chokepoint",
        "state": "Uttar Pradesh",
        "district": "Agra",
        "lat": 27.1950,
        "lon": 78.0320,
        "category": "Bridge/Chokepoint"
    },
    # Varanasi
    "UP_BHU_TRAUMA": {
        "name": "BHU Sir Sunderlal Apex Trauma Center",
        "state": "Uttar Pradesh",
        "district": "Varanasi",
        "lat": 25.2750,
        "lon": 82.9980,
        "category": "Hospital"
    },
    "UP_VARANASI_GHATS_SAR": {
        "name": "Kashi Ghats NDRF Water Rescue Base",
        "state": "Uttar Pradesh",
        "district": "Varanasi",
        "lat": 25.3100,
        "lon": 83.0120,
        "category": "NDRF Base"
    },
    "UP_KASHI_RELIEF_SHELTER": {
        "name": "Sampurnanand Multi-Purpose Relief Shelter",
        "state": "Uttar Pradesh",
        "district": "Varanasi",
        "lat": 25.3280,
        "lon": 82.9850,
        "category": "Relief Shelter"
    },
    # Kanpur
    "UP_KANPUR_GSVM": {
        "name": "GSVM Medical College & Emergency Wing",
        "state": "Uttar Pradesh",
        "district": "Kanpur",
        "lat": 26.4850,
        "lon": 80.3120,
        "category": "Hospital"
    },
    "UP_KANPUR_FIRE_BASE": {
        "name": "Fazalganj Central Fire & Disaster Rescue Base",
        "state": "Uttar Pradesh",
        "district": "Kanpur",
        "lat": 26.4580,
        "lon": 80.3010,
        "category": "Fire Station"
    },
    "UP_GANGA_BARRAGE_KANPUR": {
        "name": "Lav Kush Ganga Barrage Chokepoint",
        "state": "Uttar Pradesh",
        "district": "Kanpur",
        "lat": 26.5120,
        "lon": 80.3250,
        "category": "Bridge/Chokepoint"
    },
    # Prayagraj
    "UP_SRN_HOSP_PRYJ": {
        "name": "Swaroop Rani Nehru Apex Hospital",
        "state": "Uttar Pradesh",
        "district": "Prayagraj",
        "lat": 25.4420,
        "lon": 81.8480,
        "category": "Hospital"
    },
    "UP_SANGAM_RELIEF_CAMP": {
        "name": "Sangam High-Ground Disaster Camp",
        "state": "Uttar Pradesh",
        "district": "Prayagraj",
        "lat": 25.4280,
        "lon": 81.8850,
        "category": "Relief Shelter"
    },
    "UP_NAINI_BRIDGE_CHOKE": {
        "name": "New Yamuna Naini Bridge Chokepoint",
        "state": "Uttar Pradesh",
        "district": "Prayagraj",
        "lat": 25.4220,
        "lon": 81.8560,
        "category": "Bridge/Chokepoint"
    },
    # Noida / Greater Noida
    "UP_NOIDA_DIST_HOSP": {
        "name": "Noida Sector 39 Apex District Hospital",
        "state": "Uttar Pradesh",
        "district": "Noida",
        "lat": 28.5680,
        "lon": 77.3620,
        "category": "Hospital"
    },
    "UP_GREATER_NOIDA_DEPOT": {
        "name": "Greater Noida Expo Emergency Relief Depot",
        "state": "Uttar Pradesh",
        "district": "Greater Noida",
        "lat": 28.4720,
        "lon": 77.4980,
        "category": "Relief Shelter"
    },
    "UP_YAMUNA_EXPRESS_POST": {
        "name": "Pari Chowk Emergency Response Post",
        "state": "Uttar Pradesh",
        "district": "Greater Noida",
        "lat": 28.4650,
        "lon": 77.5120,
        "category": "Transit Hub"
    },

    # ==================== 2. DELHI NCR ====================
    "DEL_HQ": {
        "name": "Disaster Command Center (Central HQ)",
        "state": "Delhi NCR",
        "district": "Central Delhi",
        "lat": 28.6139,
        "lon": 77.2090,
        "category": "Command Center"
    },
    "DEL_AIIMS": {
        "name": "AIIMS Apex Trauma Medical Center, Delhi",
        "state": "Delhi NCR",
        "district": "South Delhi",
        "lat": 28.5672,
        "lon": 77.2100,
        "category": "Hospital"
    },
    "DEL_SAKET_MED": {
        "name": "Max Smart Super Speciality Hospital, Saket",
        "state": "Delhi NCR",
        "district": "South Delhi",
        "lat": 28.5280,
        "lon": 77.2120,
        "category": "Hospital"
    },
    "DEL_AIRFIELD": {
        "name": "Safdarjung Tactical Helipad & Air Base",
        "state": "Delhi NCR",
        "district": "South Delhi",
        "lat": 28.5850,
        "lon": 77.2050,
        "category": "Helipad"
    },
    "DEL_YAMUNA": {
        "name": "Yamuna River East Bridge (Critical Chokepoint)",
        "state": "Delhi NCR",
        "district": "Mayur Vihar",
        "lat": 28.6250,
        "lon": 77.2480,
        "category": "Bridge/Chokepoint"
    },
    "DEL_MAYUR_SHELTER": {
        "name": "Mayur Vihar Multi-Tier Relief Shelter Complex",
        "state": "Delhi NCR",
        "district": "Mayur Vihar",
        "lat": 28.6050,
        "lon": 77.2850,
        "category": "Relief Shelter"
    },
    "DEL_NDRF_DEPOT": {
        "name": "Civil Supplies & NDRF Staging Depot, Burari",
        "state": "Delhi NCR",
        "district": "Rohini",
        "lat": 28.6650,
        "lon": 77.2150,
        "category": "NDRF Base"
    },
    "DEL_ROHINI_HOSP": {
        "name": "Dr. BSA Hospital & Disaster Hub, Rohini",
        "state": "Delhi NCR",
        "district": "Rohini",
        "lat": 28.7150,
        "lon": 77.1180,
        "category": "Hospital"
    },
    "DEL_DWARKA_HOSP": {
        "name": "Indira Gandhi Hospital, Sector 9 Dwarka",
        "state": "Delhi NCR",
        "district": "Dwarka",
        "lat": 28.5780,
        "lon": 77.0650,
        "category": "Hospital"
    },
    "DEL_DWARKA_RELIEF": {
        "name": "Dwarka Sector 21 Evacuation Staging Hub",
        "state": "Delhi NCR",
        "district": "Dwarka",
        "lat": 28.5520,
        "lon": 77.0580,
        "category": "Relief Shelter"
    },
    "DEL_CONNAUGHT": {
        "name": "Connaught Transit Interlink Hub",
        "state": "Delhi NCR",
        "district": "Central Delhi",
        "lat": 28.6320,
        "lon": 77.2190,
        "category": "Transit Hub"
    },

    # ==================== 3. UTTARAKHAND ====================
    "UK_DEHRADUN_HQ": {
        "name": "State Emergency Operations Center (USDMA HQ)",
        "state": "Uttarakhand",
        "district": "Dehradun",
        "lat": 30.3165,
        "lon": 78.0322,
        "category": "Command Center"
    },
    "UK_DOON_HOSP": {
        "name": "Government Doon Medical College Hospital",
        "state": "Uttarakhand",
        "district": "Dehradun",
        "lat": 30.3250,
        "lon": 78.0410,
        "category": "Hospital"
    },
    "UK_SDRF_JOLLYGRANT": {
        "name": "SDRF Tactical Air Rescue Depot (Jolly Grant)",
        "state": "Uttarakhand",
        "district": "Dehradun",
        "lat": 30.1897,
        "lon": 78.1803,
        "category": "NDRF Base"
    },
    "UK_RISHIKESH_AIIMS": {
        "name": "AIIMS Rishikesh Trauma & Helipad Hub",
        "state": "Uttarakhand",
        "district": "Rishikesh",
        "lat": 30.0755,
        "lon": 78.2885,
        "category": "Hospital"
    },
    "UK_HARIDWAR_SHELTER": {
        "name": "Haridwar Ganga Barrage Relief Shelter",
        "state": "Uttarakhand",
        "district": "Haridwar",
        "lat": 29.9457,
        "lon": 78.1642,
        "category": "Relief Shelter"
    },
    "UK_HARIDWAR_DIST_HOSP": {
        "name": "Haridwar District Combined Hospital",
        "state": "Uttarakhand",
        "district": "Haridwar",
        "lat": 29.9620,
        "lon": 78.1450,
        "category": "Hospital"
    },
    "UK_DEVPRAYAG_CHOKE": {
        "name": "Devprayag Confluence Chokepoint & Causeway",
        "state": "Uttarakhand",
        "district": "Chamoli",
        "lat": 30.1458,
        "lon": 78.5986,
        "category": "Bridge/Chokepoint"
    },
    "UK_CHAMOLI_RELIEF": {
        "name": "Gopeshwar Chamoli Disaster Relief Camp",
        "state": "Uttarakhand",
        "district": "Chamoli",
        "lat": 30.4120,
        "lon": 79.3320,
        "category": "Relief Shelter"
    },
    "UK_KEDAR_HELI": {
        "name": "Guptkashi Mountain Evacuation Helipad",
        "state": "Uttarakhand",
        "district": "Kedarnath Valley",
        "lat": 30.5280,
        "lon": 79.0750,
        "category": "Helipad"
    },
    "UK_SONPRAYAG_STAGING": {
        "name": "Sonprayag Kedar Valley High Staging Base",
        "state": "Uttarakhand",
        "district": "Kedarnath Valley",
        "lat": 30.6350,
        "lon": 78.9950,
        "category": "Relief Shelter"
    },

    # ==================== 4. MAHARASHTRA ====================
    "MH_MUMBAI_HQ": {
        "name": "BMC Disaster Management Operations Command",
        "state": "Maharashtra",
        "district": "Mumbai",
        "lat": 18.9400,
        "lon": 72.8350,
        "category": "Command Center"
    },
    "MH_KEM_HOSPITAL": {
        "name": "KEM Memorial Apex Medical Hub, Parel",
        "state": "Maharashtra",
        "district": "Mumbai",
        "lat": 18.9950,
        "lon": 72.8420,
        "category": "Hospital"
    },
    "MH_BKC_SHELTER": {
        "name": "BKC Elevated Disaster Shelter Complex",
        "state": "Maharashtra",
        "district": "Mumbai",
        "lat": 19.0650,
        "lon": 72.8680,
        "category": "Relief Shelter"
    },
    "MH_MITHI_CHOKE": {
        "name": "Mithi River Overpass Inundation Point",
        "state": "Maharashtra",
        "district": "Mumbai",
        "lat": 19.0580,
        "lon": 72.8610,
        "category": "Bridge/Chokepoint"
    },
    "MH_SEALINK_CORRIDOR": {
        "name": "Bandra Coastal Causeway Interchange",
        "state": "Maharashtra",
        "district": "Mumbai",
        "lat": 19.0430,
        "lon": 72.8220,
        "category": "Transit Hub"
    },
    "MH_PUNE_SASSOON": {
        "name": "Sassoon General Hospital & Trauma Center",
        "state": "Maharashtra",
        "district": "Pune",
        "lat": 18.5250,
        "lon": 73.8740,
        "category": "Hospital"
    },
    "MH_PUNE_FIRE_CENTRAL": {
        "name": "Pune Central Emergency Fire Command",
        "state": "Maharashtra",
        "district": "Pune",
        "lat": 18.5120,
        "lon": 73.8560,
        "category": "Fire Station"
    },
    "MH_PUNE_RELIEF_STN": {
        "name": "Shivaji Nagar Multi-Tier Evacuation Center",
        "state": "Maharashtra",
        "district": "Pune",
        "lat": 18.5320,
        "lon": 73.8510,
        "category": "Relief Shelter"
    },
    "MH_NAGPUR_AIIMS": {
        "name": "AIIMS Nagpur Apex Medical Facility, MIHAN",
        "state": "Maharashtra",
        "district": "Nagpur",
        "lat": 21.0650,
        "lon": 79.0480,
        "category": "Hospital"
    },
    "MH_NAGPUR_SITABULDI_CAMP": {
        "name": "Sitabuldi Disaster Relief & Staging Ground",
        "state": "Maharashtra",
        "district": "Nagpur",
        "lat": 21.1460,
        "lon": 79.0850,
        "category": "Relief Shelter"
    },

    # ==================== 5. BIHAR ====================
    "BR_AIIMS_PATNA": {
        "name": "AIIMS Patna Apex Emergency Center, Phulwari Sharif",
        "state": "Bihar",
        "district": "Patna",
        "lat": 25.5620,
        "lon": 85.0480,
        "category": "Hospital"
    },
    "BR_PMCH_TRAUMA": {
        "name": "Patna Medical College Hospital (PMCH) Trauma Unit",
        "state": "Bihar",
        "district": "Patna",
        "lat": 25.6210,
        "lon": 85.1580,
        "category": "Hospital"
    },
    "BR_GANDHI_MAIDAN_SHELTER": {
        "name": "Gandhi Maidan Mega Evacuation Camp",
        "state": "Bihar",
        "district": "Patna",
        "lat": 25.6180,
        "lon": 85.1450,
        "category": "Relief Shelter"
    },
    "BR_GANGA_BRIDGE_PATNA": {
        "name": "Mahatma Gandhi Setu Ganga Chokepoint",
        "state": "Bihar",
        "district": "Patna",
        "lat": 25.6050,
        "lon": 85.2150,
        "category": "Bridge/Chokepoint"
    },
    "BR_DANAPUR_NDRF_BASE": {
        "name": "NDRF Battalion 9 Rescue Base, Bihta-Danapur",
        "state": "Bihar",
        "district": "Patna",
        "lat": 25.5780,
        "lon": 85.0120,
        "category": "NDRF Base"
    },

    # ==================== 6. WEST BENGAL ====================
    "WB_SSKM_HOSPITAL": {
        "name": "IPGMER & SSKM Hospital Apex Trauma Unit",
        "state": "West Bengal",
        "district": "Kolkata",
        "lat": 22.5390,
        "lon": 88.3440,
        "category": "Hospital"
    },
    "WB_SALT_LAKE_DISASTER_HUB": {
        "name": "Salt Lake Stadium Mega Evacuation Shelter",
        "state": "West Bengal",
        "district": "Kolkata",
        "lat": 22.5710,
        "lon": 88.4060,
        "category": "Relief Shelter"
    },
    "WB_HOWRAH_RIVER_POST": {
        "name": "Howrah Hooghly River Water Rescue Station",
        "state": "West Bengal",
        "district": "Howrah",
        "lat": 22.5850,
        "lon": 88.3420,
        "category": "NDRF Base"
    },
    "WB_NABANNA_COMMAND_HQ": {
        "name": "State Disaster Emergency Cell, Nabanna",
        "state": "West Bengal",
        "district": "Howrah",
        "lat": 22.5580,
        "lon": 88.3150,
        "category": "Command Center"
    },
    "WB_ALIPORE_HELIPAD": {
        "name": "Racecourse Tactical Evacuation Helipad",
        "state": "West Bengal",
        "district": "Kolkata",
        "lat": 22.5450,
        "lon": 88.3380,
        "category": "Helipad"
    },

    # ==================== 7. ASSAM ====================
    "ASM_GUWAHATI_HQ": {
        "name": "Assam State Disaster Management Authority HQ",
        "state": "Assam",
        "district": "Guwahati",
        "lat": 26.1445,
        "lon": 91.7362,
        "category": "Command Center"
    },
    "ASM_GMCH_TRAUMA": {
        "name": "Guwahati Medical College Hospital (GMCH)",
        "state": "Assam",
        "district": "Guwahati",
        "lat": 26.1558,
        "lon": 91.7705,
        "category": "Hospital"
    },
    "ASM_SARAIGHAT_CHOKE": {
        "name": "Saraighat Brahmaputra River Bridge",
        "state": "Assam",
        "district": "Guwahati",
        "lat": 26.1752,
        "lon": 91.6845,
        "category": "Bridge/Chokepoint"
    },
    "ASM_PANDU_PORT": {
        "name": "Pandu River Port Water Rescue Base",
        "state": "Assam",
        "district": "Guwahati",
        "lat": 26.1620,
        "lon": 91.6970,
        "category": "NDRF Base"
    },
    "ASM_KHANAPARA_SHELTER": {
        "name": "Khanapara High-Ground Relief Shelter Complex",
        "state": "Assam",
        "district": "Guwahati",
        "lat": 26.1260,
        "lon": 91.8210,
        "category": "Relief Shelter"
    },
    "ASM_DISPUR_HELIPAD": {
        "name": "Dispur Emergency Evacuation Helipad",
        "state": "Assam",
        "district": "Guwahati",
        "lat": 26.1410,
        "lon": 91.7900,
        "category": "Helipad"
    },

    # ==================== 8. GUJARAT ====================
    "GJ_CIVIL_HOSP_AHM": {
        "name": "Ahmedabad Civil Hospital Apex Trauma Center, Asarwa",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "lat": 23.0520,
        "lon": 72.6040,
        "category": "Hospital"
    },
    "GJ_SABARMATI_RESCUE_BASE": {
        "name": "Sabarmati Riverfront Fire & Aquatic Rescue Post",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "lat": 23.0310,
        "lon": 72.5780,
        "category": "Fire Station"
    },
    "GJ_STADIUM_RELIEF_HUB": {
        "name": "Motera High-Capacity Disaster Shelter Hub",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "lat": 23.0920,
        "lon": 72.5980,
        "category": "Relief Shelter"
    },
    "GJ_GANDHINAGAR_DISASTER_HQ": {
        "name": "Gujarat State Disaster Management Authority HQ",
        "state": "Gujarat",
        "district": "Gandhinagar",
        "lat": 23.2150,
        "lon": 72.6360,
        "category": "Command Center"
    },
    "GJ_SARKHEJ_CHOKE": {
        "name": "Sarkhej Junction Elevated Highway Chokepoint",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "lat": 22.9850,
        "lon": 72.4980,
        "category": "Transit Hub"
    }
}

# Road Corridors connecting infrastructure hubs within each state
NETWORK_EDGES = [
    # ---------- Uttar Pradesh ----------
    # Lucknow Cluster
    ("UP_LUCKNOW_HQ", "UP_KGMU_LKO", "Shah Mina Road Express", 4.2),
    ("UP_LUCKNOW_HQ", "UP_GOMTI_CHOKE", "Riverfront Express Direct", 3.8),
    ("UP_GOMTI_CHOKE", "UP_EKANA_LKO", "Shaheed Path Flood Highway", 7.5),
    ("UP_KGMU_LKO", "UP_EKANA_LKO", "Inner Ring Embankment Road", 11.2),
    ("UP_LUCKNOW_HQ", "UP_SGPGI_LKO", "Raebareli Highway Express", 12.0),
    ("UP_SGPGI_LKO", "UP_EKANA_LKO", "Amar Shaheed South Connector", 8.6),
    # Agra Cluster
    ("UP_AGRA_HOSP", "UP_TAJ_RELIEF", "Fatehabad Road Relief Corridor", 4.5),
    ("UP_AGRA_HOSP", "UP_YAMUNA_AGRA_CHOKE", "Yamuna Kinara Flank Road", 3.2),
    ("UP_YAMUNA_AGRA_CHOKE", "UP_TAJ_RELIEF", "Eastern Embankment Link", 5.0),
    ("UP_AGRA_HOSP", "UP_AGRA_ARMY_HELI", "Mall Road Tactical Highway", 6.8),
    ("UP_AGRA_ARMY_HELI", "UP_TAJ_RELIEF", "VIP Circular Bypass", 8.2),
    # Inter-city UP Links
    ("UP_EKANA_LKO", "UP_KANPUR_GSVM", "Lucknow-Kanpur National Highway", 72.0),
    ("UP_KANPUR_GSVM", "UP_KANPUR_FIRE_BASE", "GT Road City Link", 3.5),
    ("UP_KANPUR_GSVM", "UP_GANGA_BARRAGE_KANPUR", "Bithoor River Road", 6.2),
    ("UP_GANGA_BARRAGE_KANPUR", "UP_KANPUR_FIRE_BASE", "Kanpur Bypass", 7.8),
    ("UP_KANPUR_GSVM", "UP_SRN_HOSP_PRYJ", "Kanpur-Prayagraj Corridor", 125.0),
    ("UP_SRN_HOSP_PRYJ", "UP_SANGAM_RELIEF_CAMP", "Kydganj River Approach", 4.8),
    ("UP_SRN_HOSP_PRYJ", "UP_NAINI_BRIDGE_CHOKE", "Yamuna Bank High Road", 3.4),
    ("UP_NAINI_BRIDGE_CHOKE", "UP_SANGAM_RELIEF_CAMP", "Triveni Embankment", 4.2),
    ("UP_SANGAM_RELIEF_CAMP", "UP_BHU_TRAUMA", "Prayagraj-Varanasi Express Link", 118.0),
    ("UP_BHU_TRAUMA", "UP_VARANASI_GHATS_SAR", "Assi Ghat River Link", 3.8),
    ("UP_BHU_TRAUMA", "UP_KASHI_RELIEF_SHELTER", "Cantonment Relief Road", 6.4),
    ("UP_VARANASI_GHATS_SAR", "UP_KASHI_RELIEF_SHELTER", "Maqbool Alam Bypass", 5.2),
    ("UP_NOIDA_DIST_HOSP", "UP_GREATER_NOIDA_DEPOT", "Noida-Greater Noida Expressway", 22.5),
    ("UP_GREATER_NOIDA_DEPOT", "UP_YAMUNA_EXPRESS_POST", "Pari Chowk Arterial link", 3.1),
    ("UP_YAMUNA_EXPRESS_POST", "UP_AGRA_HOSP", "Yamuna Expressway Grand Corridor", 160.0),

    # ---------- Delhi NCR ----------
    ("DEL_HQ", "DEL_CONNAUGHT", "Parliament Avenue Express", 2.2),
    ("DEL_HQ", "DEL_AIRFIELD", "Safdarjung Flank Road", 3.8),
    ("DEL_CONNAUGHT", "DEL_NDRF_DEPOT", "North Arterial Corridor", 4.3),
    ("DEL_CONNAUGHT", "DEL_YAMUNA", "ITO Riverfront Causeway", 3.8),
    ("DEL_YAMUNA", "DEL_MAYUR_SHELTER", "East Ring Direct Link", 4.5),
    ("DEL_NDRF_DEPOT", "DEL_ROHINI_HOSP", "Outer Ring Road North", 8.4),
    ("DEL_HQ", "DEL_AIIMS", "Aurobindo Medical Corridor", 5.2),
    ("DEL_AIIMS", "DEL_SAKET_MED", "Mehrauli-Badarpur Medical Express", 4.8),
    ("DEL_AIRFIELD", "DEL_AIIMS", "Ring Road South Connector", 2.5),
    ("DEL_AIIMS", "DEL_DWARKA_HOSP", "Dwarka Expressway Inner Flyway", 14.5),
    ("DEL_DWARKA_HOSP", "DEL_DWARKA_RELIEF", "Sector 21 Interlink", 3.2),
    ("DEL_ROHINI_HOSP", "DEL_DWARKA_HOSP", "West Delhi Outer Bypass", 16.8),
    ("DEL_MAYUR_SHELTER", "UP_NOIDA_DIST_HOSP", "Mayur Vihar - Noida Border Link", 6.5),

    # ---------- Uttarakhand ----------
    ("UK_DEHRADUN_HQ", "UK_DOON_HOSP", "Rajpur Road Medical Link", 2.4),
    ("UK_DEHRADUN_HQ", "UK_SDRF_JOLLYGRANT", "Dehradun-Rishikesh Highway", 18.5),
    ("UK_DOON_HOSP", "UK_SDRF_JOLLYGRANT", "Rispana Embankment Link", 17.8),
    ("UK_SDRF_JOLLYGRANT", "UK_RISHIKESH_AIIMS", "Ganga Valley Link Road", 14.2),
    ("UK_RISHIKESH_AIIMS", "UK_HARIDWAR_SHELTER", "Bypass Levee Express", 22.0),
    ("UK_HARIDWAR_SHELTER", "UK_HARIDWAR_DIST_HOSP", "Haridwar City Link", 3.5),
    ("UK_RISHIKESH_AIIMS", "UK_DEVPRAYAG_CHOKE", "Badrinath National Highway", 34.0),
    ("UK_DEVPRAYAG_CHOKE", "UK_CHAMOLI_RELIEF", "Alaknanda Mountain Pass", 65.0),
    ("UK_CHAMOLI_RELIEF", "UK_KEDAR_HELI", "Mandakini Valley Link", 48.0),
    ("UK_KEDAR_HELI", "UK_SONPRAYAG_STAGING", "Kedarnath High Access Road", 15.2),
    ("UK_SDRF_JOLLYGRANT", "UK_DEVPRAYAG_CHOKE", "Ridge Safe Bypass Corridor", 45.0),

    # ---------- Maharashtra ----------
    ("MH_MUMBAI_HQ", "MH_SEALINK_CORRIDOR", "Marine Drive & Worli Sea Link", 9.2),
    ("MH_MUMBAI_HQ", "MH_KEM_HOSPITAL", "Dr. Ambedkar Arterial Road", 6.5),
    ("MH_KEM_HOSPITAL", "MH_BKC_SHELTER", "Western Express Highway Connector", 8.4),
    ("MH_SEALINK_CORRIDOR", "MH_MITHI_CHOKE", "Bandra East Creek Link", 4.2),
    ("MH_MITHI_CHOKE", "MH_BKC_SHELTER", "BKC Low Bridge Connector", 2.8),
    ("MH_SEALINK_CORRIDOR", "MH_BKC_SHELTER", "Santacruz Elevated High Road", 5.1),
    ("MH_BKC_SHELTER", "MH_PUNE_SASSOON", "Mumbai-Pune Expressway", 145.0),
    ("MH_PUNE_SASSOON", "MH_PUNE_FIRE_CENTRAL", "JM Road Central Link", 3.2),
    ("MH_PUNE_SASSOON", "MH_PUNE_RELIEF_STN", "Shivaji Nagar Flyway", 2.8),
    ("MH_PUNE_FIRE_CENTRAL", "MH_PUNE_RELIEF_STN", "FC Road Interlink", 2.2),
    ("MH_PUNE_SASSOON", "MH_NAGPUR_AIIMS", "Samruddhi Mahamarg Highway", 710.0),
    ("MH_NAGPUR_AIIMS", "MH_NAGPUR_SITABULDI_CAMP", "Wardha Road City Express", 12.5),

    # ---------- Bihar ----------
    ("BR_AIIMS_PATNA", "BR_PMCH_TRAUMA", "Patna Canal Ring Road", 14.5),
    ("BR_AIIMS_PATNA", "BR_DANAPUR_NDRF_BASE", "Khagaul-Danapur Road", 4.8),
    ("BR_DANAPUR_NDRF_BASE", "BR_GANDHI_MAIDAN_SHELTER", "Bailey Road Arterial", 11.2),
    ("BR_PMCH_TRAUMA", "BR_GANDHI_MAIDAN_SHELTER", "Ashok Rajpath Express", 2.5),
    ("BR_PMCH_TRAUMA", "BR_GANGA_BRIDGE_PATNA", "Ganga Driveway Link", 5.8),
    ("BR_GANGA_BRIDGE_PATNA", "BR_GANDHI_MAIDAN_SHELTER", "Kankarbagh Bypass", 6.4),

    # ---------- West Bengal ----------
    ("WB_NABANNA_COMMAND_HQ", "WB_HOWRAH_RIVER_POST", "Foreshore Road Hooghly Link", 4.2),
    ("WB_NABANNA_COMMAND_HQ", "WB_SSKM_HOSPITAL", "Vidyasagar Setu (2nd Hooghly Bridge)", 5.6),
    ("WB_SSKM_HOSPITAL", "WB_ALIPORE_HELIPAD", "AJC Bose Road Flank", 1.8),
    ("WB_SSKM_HOSPITAL", "WB_SALT_LAKE_DISASTER_HUB", "Maa Elevated Flyover", 8.5),
    ("WB_HOWRAH_RIVER_POST", "WB_SSKM_HOSPITAL", "Strand Road Riverside Link", 6.2),
    ("WB_ALIPORE_HELIPAD", "WB_SALT_LAKE_DISASTER_HUB", "EM Bypass Connector", 9.8),

    # ---------- Assam ----------
    ("ASM_GUWAHATI_HQ", "ASM_GMCH_TRAUMA", "GS Road Emergency Link", 4.5),
    ("ASM_GUWAHATI_HQ", "ASM_PANDU_PORT", "MG Riverside Avenue", 6.2),
    ("ASM_PANDU_PORT", "ASM_SARAIGHAT_CHOKE", "Brahmaputra Embankment Link", 4.8),
    ("ASM_SARAIGHAT_CHOKE", "ASM_KHANAPARA_SHELTER", "Guwahati Direct Bypass", 16.5),
    ("ASM_PANDU_PORT", "ASM_KHANAPARA_SHELTER", "Jalukbari High Embankment", 14.8),
    ("ASM_GMCH_TRAUMA", "ASM_KHANAPARA_SHELTER", "Super Market Elevated Flyway", 5.8),
    ("ASM_GMCH_TRAUMA", "ASM_DISPUR_HELIPAD", "Dispur Secretariat Link", 2.6),
    ("ASM_DISPUR_HELIPAD", "ASM_KHANAPARA_SHELTER", "GS Road South Flank", 3.7),

    # ---------- Gujarat ----------
    ("GJ_GANDHINAGAR_DISASTER_HQ", "GJ_STADIUM_RELIEF_HUB", "Gandhinagar-Ahmedabad Highway", 14.5),
    ("GJ_STADIUM_RELIEF_HUB", "GJ_CIVIL_HOSP_AHM", "Sabarmati Ashram Express Road", 5.2),
    ("GJ_CIVIL_HOSP_AHM", "GJ_SABARMATI_RESCUE_BASE", "Riverfront East Embankment", 4.2),
    ("GJ_SABARMATI_RESCUE_BASE", "GJ_SARKHEJ_CHOKE", "SG Highway Link", 11.8),
    ("GJ_STADIUM_RELIEF_HUB", "GJ_SARKHEJ_CHOKE", "132 Feet Ring Road", 13.5)
]


class EmergencyRouter:
    def __init__(self):
        self.graph = nx.Graph()
        self._build_base_network()

    def _build_base_network(self):
        """Construct full national multi-state network graph."""
        self.graph.clear()

        for node_id, data in NETWORK_NODES.items():
            self.graph.add_node(
                node_id,
                name=data["name"],
                state=data["state"],
                district=data["district"],
                lat=data["lat"],
                lon=data["lon"],
                category=data["category"]
            )

        for u, v, road_name, dist_km in NETWORK_EDGES:
            self.graph.add_edge(
                u,
                v,
                road_name=road_name,
                base_distance_km=dist_km,
                water_depth_cm=0.0,
                damage_level=0.0,
                debris_level=0.0,
                risk_multiplier=1.0,
                weight=dist_km,
                is_passable=True,
                effective_speed_kmh=50.0,
                grade="SAFE"
            )

    def get_states(self) -> Dict[str, List[str]]:
        """Return all supported states and their associated districts/cities."""
        state_map = {}
        for _, data in NETWORK_NODES.items():
            state = data["state"]
            district = data["district"]
            if state not in state_map:
                state_map[state] = set()
            state_map[state].add(district)
        return {s: sorted(list(dists)) for s, dists in sorted(state_map.items())}

    def search_nodes(self, query: str, state: Optional[str] = None) -> List[Dict[str, Any]]:
        """Google Maps style search matching landmark name, city, state, or category."""
        q = query.lower().strip()
        if not q:
            return []

        results = []
        for node_id, data in NETWORK_NODES.items():
            if state and data.get("state") != state:
                continue
            searchable_text = f"{data['name']} {data['district']} {data['state']} {data['category']}".lower()
            if q in searchable_text:
                results.append({
                    "id": node_id,
                    "name": data["name"],
                    "state": data["state"],
                    "district": data["district"],
                    "category": data["category"],
                    "lat": data["lat"],
                    "lon": data["lon"]
                })
        return results

    def find_nearest_node(self, lat: float, lon: float, state: Optional[str] = None) -> Dict[str, Any]:
        """Find closest emergency infrastructure node to GPS coordinates."""
        closest_id = None
        min_dist = float("inf")

        for n, data in self.graph.nodes(data=True):
            if state and data.get("state") != state:
                continue
            d = haversine_distance_km(lat, lon, data["lat"], data["lon"])
            if d < min_dist:
                min_dist = d
                closest_id = n

        if closest_id:
            node_data = self.graph.nodes[closest_id]
            return {
                "id": closest_id,
                "name": node_data["name"],
                "state": node_data.get("state", ""),
                "district": node_data.get("district", ""),
                "lat": node_data["lat"],
                "lon": node_data["lon"],
                "category": node_data.get("category", ""),
                "distance_km": round(min_dist, 2)
            }
        return {}

    def apply_hazards(self, incidents: List[Dict[str, Any]], vehicle_type: str = "Ambulance"):
        """Dynamically project incident conditions onto nearby road edges."""
        # Reset all edges to base state
        for u, v, data in self.graph.edges(data=True):
            data["water_depth_cm"] = 0.0
            data["damage_level"] = 0.0
            data["debris_level"] = 0.0
            data["risk_multiplier"] = 1.0
            data["weight"] = data["base_distance_km"]
            data["is_passable"] = True
            data["effective_speed_kmh"] = 50.0
            data["grade"] = "SAFE"

        # Apply incident impact based on spatial proximity
        for incident in incidents:
            inc_lat = incident.get("lat", 0.0)
            inc_lon = incident.get("lon", 0.0)
            inc_water = incident.get("water_depth_cm", 0.0)
            inc_damage = incident.get("damage_level", 0.0)
            inc_debris = incident.get("debris_level", 0.0)

            for u, v, data in self.graph.edges(data=True):
                u_node = self.graph.nodes[u]
                v_node = self.graph.nodes[v]

                dist_u = haversine_distance_km(inc_lat, inc_lon, u_node["lat"], u_node["lon"])
                dist_v = haversine_distance_km(inc_lat, inc_lon, v_node["lat"], v_node["lon"])
                mid_lat = (u_node["lat"] + v_node["lat"]) / 2.0
                mid_lon = (u_node["lon"] + v_node["lon"]) / 2.0
                dist_mid = haversine_distance_km(inc_lat, inc_lon, mid_lat, mid_lon)

                min_dist = min(dist_u, dist_v, dist_mid)

                # Influence radius of 2.5 km
                if min_dist <= 2.5:
                    impact_factor = max(0.2, (2.5 - min_dist) / 2.5)
                    data["water_depth_cm"] = max(data["water_depth_cm"], inc_water * impact_factor)
                    data["damage_level"] = max(data["damage_level"], inc_damage * impact_factor)
                    data["debris_level"] = max(data["debris_level"], inc_debris * impact_factor)

        # Recalculate weights using hazard engine
        for u, v, data in self.graph.edges(data=True):
            eval_result = calculate_hazard_risk(
                water_depth_cm=data["water_depth_cm"],
                damage_level=data["damage_level"],
                debris_level=data["debris_level"],
                vehicle_type=vehicle_type
            )
            data["risk_multiplier"] = eval_result["risk_multiplier"]
            data["is_passable"] = eval_result["is_passable"]
            data["grade"] = eval_result["grade"]
            data["color"] = eval_result["color"]
            data["effective_speed_kmh"] = eval_result["effective_speed_kmh"]
            data["weight"] = data["base_distance_km"] * eval_result["risk_multiplier"]

    def _euclidean_heuristic(self, u: str, v: str) -> float:
        """Admissible A* heuristic based on great-circle distance."""
        u_node = self.graph.nodes[u]
        v_node = self.graph.nodes[v]
        return haversine_distance_km(u_node["lat"], u_node["lon"], v_node["lat"], v_node["lon"])

    def find_safe_corridor(
        self,
        source: str,
        target: str,
        vehicle_type: str = "Ambulance"
    ) -> Dict[str, Any]:
        """Compute optimal safe route using risk-weighted A* algorithm."""
        if source not in self.graph:
            raise ValueError(f"Origin node '{source}' not found in network.")
        if target not in self.graph:
            raise ValueError(f"Destination node '{target}' not found in network.")
        if source == target:
            raise ValueError("Origin and destination cannot be identical.")

        try:
            safe_path = nx.astar_path(
                self.graph,
                source=source,
                target=target,
                heuristic=self._euclidean_heuristic,
                weight="weight"
            )
        except nx.NetworkXNoPath:
            return {"success": False, "error": "No viable connected road corridor exists between selected points."}

        # Naive Shortest Distance Path
        try:
            shortest_path = nx.astar_path(
                self.graph,
                source=source,
                target=target,
                heuristic=self._euclidean_heuristic,
                weight="base_distance_km"
            )
        except nx.NetworkXNoPath:
            shortest_path = safe_path

        safe_summary = self._summarize_path(safe_path)
        shortest_summary = self._summarize_path(shortest_path)

        is_detour_advised = safe_path != shortest_path
        safety_status = "SAFE CORRIDOR SECURED"
        if safe_summary["max_risk_multiplier"] > 10.0:
            safety_status = "EXTREME RISK - RESCUE CREW ESCORT REQUIRED"
        elif safe_summary["max_risk_multiplier"] > 3.0:
            safety_status = "ELEVATED CAUTION - WATERLOGGED CORRIDOR"

        return {
            "success": True,
            "vehicle_type": vehicle_type,
            "source": {
                "id": source,
                "name": self.graph.nodes[source]["name"],
                "state": self.graph.nodes[source].get("state", ""),
                "district": self.graph.nodes[source].get("district", ""),
                "lat": self.graph.nodes[source]["lat"],
                "lon": self.graph.nodes[source]["lon"]
            },
            "target": {
                "id": target,
                "name": self.graph.nodes[target]["name"],
                "state": self.graph.nodes[target].get("state", ""),
                "district": self.graph.nodes[target].get("district", ""),
                "lat": self.graph.nodes[target]["lat"],
                "lon": self.graph.nodes[target]["lon"]
            },
            "safe_corridor": safe_summary,
            "shortest_naive": shortest_summary,
            "is_detour_advised": is_detour_advised,
            "safety_status": safety_status
        }

    def _summarize_path(self, path: List[str]) -> Dict[str, Any]:
        waypoints = []
        segments = []
        total_distance = 0.0
        weighted_cost = 0.0
        total_time_mins = 0.0
        max_risk = 1.0
        all_passable = True

        for i, node_id in enumerate(path):
            node = self.graph.nodes[node_id]
            waypoints.append({
                "id": node_id,
                "name": node["name"],
                "state": node.get("state", ""),
                "district": node.get("district", ""),
                "lat": node["lat"],
                "lon": node["lon"],
                "category": node["category"]
            })

            if i < len(path) - 1:
                next_node = path[i + 1]
                edge_data = self.graph[node_id][next_node]
                dist = edge_data["base_distance_km"]
                risk = edge_data["risk_multiplier"]
                speed = edge_data["effective_speed_kmh"]
                passable = edge_data["is_passable"]

                segment_time = (dist / max(1.0, speed)) * 60.0

                total_distance += dist
                weighted_cost += edge_data["weight"]
                total_time_mins += segment_time
                max_risk = max(max_risk, risk)
                if not passable:
                    all_passable = False

                segments.append({
                    "from_node": node_id,
                    "to_node": next_node,
                    "road_name": edge_data["road_name"],
                    "distance_km": round(dist, 2),
                    "water_depth_cm": round(edge_data["water_depth_cm"], 1),
                    "damage_level": round(edge_data["damage_level"], 1),
                    "debris_level": round(edge_data["debris_level"], 1),
                    "risk_multiplier": round(risk, 2),
                    "is_passable": passable,
                    "grade": edge_data["grade"],
                    "color": edge_data.get("color", "#2a9d8f"),
                    "transit_time_min": round(segment_time, 1)
                })

        avg_risk = weighted_cost / max(0.1, total_distance)

        return {
            "path_nodes": path,
            "waypoints": waypoints,
            "segments": segments,
            "total_distance_km": round(total_distance, 2),
            "risk_weighted_cost": round(weighted_cost, 2),
            "average_risk_multiplier": round(avg_risk, 2),
            "max_risk_multiplier": round(max_risk, 2),
            "estimated_transit_time_min": round(total_time_mins, 1),
            "is_fully_passable": all_passable
        }

    def get_network_geojson(self, state: Optional[str] = None) -> Dict[str, Any]:
        """Export nodes and edge hazards filtered by state if requested."""
        nodes = []
        node_filter_ids = set()
        for n, data in self.graph.nodes(data=True):
            if state and data.get("state") != state:
                continue
            node_filter_ids.add(n)
            nodes.append({
                "id": n,
                "name": data["name"],
                "state": data.get("state", ""),
                "district": data.get("district", ""),
                "lat": data["lat"],
                "lon": data["lon"],
                "category": data["category"]
            })

        edges = []
        for u, v, data in self.graph.edges(data=True):
            if state and (u not in node_filter_ids or v not in node_filter_ids):
                continue
            edges.append({
                "u": u,
                "v": v,
                "road_name": data["road_name"],
                "coords": [
                    [self.graph.nodes[u]["lat"], self.graph.nodes[u]["lon"]],
                    [self.graph.nodes[v]["lat"], self.graph.nodes[v]["lon"]]
                ],
                "base_distance_km": data["base_distance_km"],
                "water_depth_cm": round(data["water_depth_cm"], 1),
                "damage_level": round(data["damage_level"], 1),
                "debris_level": round(data["debris_level"], 1),
                "risk_multiplier": round(data["risk_multiplier"], 2),
                "grade": data["grade"],
                "color": data.get("color", "#2a9d8f"),
                "is_passable": data["is_passable"]
            })

        return {"nodes": nodes, "edges": edges}
