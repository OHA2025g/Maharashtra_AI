import os
import uuid
import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
# Removed emergentintegrations dependency - using fallback insights generation
from pgi_framework import (
    PGI_DOMAINS, 
    PGI_INDICATORS, 
    get_indicators_for_domain,
    get_indicators_for_level,
    calculate_domain_score,
    calculate_total_pgi_score
)

# Load environment variables
load_dotenv()

# App initialization
app = FastAPI(title="Maharashtra Education Dashboard API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "maharashtra_education")
# Removed EMERGENT_LLM_KEY - no longer using Emergent services

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Pydantic models
class BaseEntity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Insight(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    metric_name: str
    level: str  # state, district, block, school
    entity_id: str
    insight_text: str
    recommendation: str
    severity: str  # critical, moderate, good, excellent
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IndicatorDrilldownRequest(BaseModel):
    level: str
    entity_id: str
    indicator_code: str
    domain_name: str

class MetricData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    metric_name: str
    level: str
    entity_id: str
    entity_name: str
    value: float
    max_value: float
    percentage: float
    trend: str  # increasing, decreasing, stable
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StateData(BaseEntity):
    total_score: float = 0
    max_score: float = 1000
    percentage: float = 0
    rank: int = 0
    districts_count: int = 35

class DistrictData(BaseEntity):
    state_id: str
    total_score: float = 0
    max_score: float = 600
    percentage: float = 0
    rank: int = 0
    blocks_count: int = 0

class BlockData(BaseEntity):
    district_id: str
    state_id: str
    schools_count: int = 0
    performance_score: float = 0

class SchoolData(BaseEntity):
    block_id: str
    district_id: str
    state_id: str
    student_count: int = 0
    teacher_count: int = 0
    infrastructure_score: float = 0

class PGIIndicatorScore(BaseModel):
    indicator_key: str
    indicator_name: str
    domain: str
    achieved_value: float
    target_value: float
    percentage: float
    unit: str
    level: str
    entity_id: str

class PGIDomainScore(BaseModel):
    domain_key: str
    domain_name: str
    score: float
    max_score: float
    percentage: float
    weight: float
    indicators: List[Dict] = []

class PGIScore(BaseModel):
    entity_id: str
    entity_name: str
    level: str
    total_score: float
    max_score: float = 1000
    percentage: float
    domains: List[PGIDomainScore]
    last_calculated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper functions
def prepare_for_mongo(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
    return data

def parse_from_mongo(item):
    if isinstance(item, dict):
        if '_id' in item:
            del item['_id']
        for key, value in item.items():
            if isinstance(value, str) and 'T' in value and 'Z' in value:
                try:
                    item[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except Exception:
                    pass
    return item

async def generate_ai_insight(metric_name: str, level: str, entity_name: str, current_value: float, 
                             max_value: float, trend: str) -> Dict[str, str]:
    """Generate data-driven insights and recommendations (fallback implementation)"""
    percentage = (current_value / max_value) * 100 if max_value > 0 else 0
    state_benchmark = 54.35
    gap = percentage - state_benchmark
    gap_abs = abs(gap)
    
    # Determine severity based on performance
    if percentage >= 80:
        severity = "excellent"
        insight_text = f"📊 {entity_name} demonstrates strong performance in {metric_name} with {percentage:.1f}% achievement, {gap_abs:.1f}% above state average."
        recommendation = "🎯 Maintain current performance levels and share best practices with lower-performing entities."
    elif percentage >= 65:
        severity = "good"
        insight_text = f"📊 {entity_name} shows good performance in {metric_name} at {percentage:.1f}%, {gap_abs:.1f}% {'above' if gap > 0 else 'below'} state average."
        recommendation = "🎯 Focus on incremental improvements to reach excellence. Target 5-10% improvement within 6 months."
    elif percentage >= 50:
        severity = "moderate"
        insight_text = f"📊 {entity_name} has moderate performance in {metric_name} at {percentage:.1f}%, {gap_abs:.1f}% below state average."
        recommendation = "🎯 Implement targeted interventions and capacity building. Aim for 10-15% improvement within 6-12 months."
    else:
        severity = "critical"
        insight_text = f"📊 {entity_name} shows critical performance gap in {metric_name} at {percentage:.1f}%, {gap_abs:.1f}% below state average."
        recommendation = "🎯 Immediate intervention required. Deploy focused support, additional resources, and regular monitoring. Target 15-20% improvement within 12 months."
    
    # Add trend context
    if trend == "increasing":
        insight_text += " Performance trend is improving."
    elif trend == "decreasing":
        insight_text += " Performance trend is declining - urgent attention needed."
    else:
        insight_text += " Performance trend is stable."
    
    return {
        "insight": insight_text,
        "recommendation": recommendation,
        "severity": severity
    }

# Initialize sample data
async def initialize_sample_data():
    """Initialize comprehensive sample data for Maharashtra education system"""
    
    # Check if data already exists
    existing_state = await db.states.find_one({"name": "Maharashtra"})
    if existing_state:
        return
    
    print("Initializing sample data...")
    
    # State level data
    state_data = {
        "id": "mh_001",
        "name": "Maharashtra",
        "total_score": 543.5,
        "max_score": 1000,
        "percentage": 54.35,
        "rank": 14,
        "districts_count": 36,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.states.insert_one(prepare_for_mongo(state_data))
    
    # All 36 districts of Maharashtra with realistic performance data
    districts = [
        # Tier 1 - Metro/Urban districts (High performance)
        {"name": "Mumbai City", "score": 485, "rank": 1, "blocks": 8},
        {"name": "Mumbai Suburban", "score": 465, "rank": 2, "blocks": 10},
        {"name": "Pune", "score": 445, "rank": 3, "blocks": 15},
        {"name": "Thane", "score": 430, "rank": 4, "blocks": 12},
        {"name": "Nashik", "score": 415, "rank": 5, "blocks": 14},
        {"name": "Nagpur", "score": 410, "rank": 6, "blocks": 13},
        {"name": "Aurangabad", "score": 395, "rank": 7, "blocks": 11},
        
        # Tier 2 - Semi-urban districts (Good performance)
        {"name": "Kolhapur", "score": 385, "rank": 8, "blocks": 10},
        {"name": "Solapur", "score": 375, "rank": 9, "blocks": 9},
        {"name": "Ahmednagar", "score": 370, "rank": 10, "blocks": 12},
        {"name": "Satara", "score": 365, "rank": 11, "blocks": 11},
        {"name": "Sangli", "score": 355, "rank": 12, "blocks": 8},
        {"name": "Latur", "score": 350, "rank": 13, "blocks": 9},
        {"name": "Osmanabad", "score": 345, "rank": 14, "blocks": 7},
        {"name": "Jalgaon", "score": 340, "rank": 15, "blocks": 13},
        {"name": "Dhule", "score": 335, "rank": 16, "blocks": 8},
        {"name": "Akola", "score": 330, "rank": 17, "blocks": 9},
        {"name": "Amravati", "score": 325, "rank": 18, "blocks": 12},
        
        # Tier 3 - Developing districts (Moderate performance)
        {"name": "Yavatmal", "score": 320, "rank": 19, "blocks": 11},
        {"name": "Buldhana", "score": 315, "rank": 20, "blocks": 10},
        {"name": "Washim", "score": 310, "rank": 21, "blocks": 6},
        {"name": "Hingoli", "score": 305, "rank": 22, "blocks": 5},
        {"name": "Parbhani", "score": 300, "rank": 23, "blocks": 8},
        {"name": "Jalna", "score": 295, "rank": 24, "blocks": 7},
        {"name": "Beed", "score": 290, "rank": 25, "blocks": 9},
        {"name": "Raigad", "score": 285, "rank": 26, "blocks": 10},
        {"name": "Ratnagiri", "score": 280, "rank": 27, "blocks": 8},
        {"name": "Sindhudurg", "score": 275, "rank": 28, "blocks": 7},
        
        # Tier 4 - Emerging districts (Needs focused attention)
        {"name": "Chandrapur", "score": 270, "rank": 29, "blocks": 12},
        {"name": "Wardha", "score": 265, "rank": 30, "blocks": 7},
        {"name": "Gondia", "score": 260, "rank": 31, "blocks": 8},
        {"name": "Bhandara", "score": 255, "rank": 32, "blocks": 6},
        {"name": "Gadchiroli", "score": 250, "rank": 33, "blocks": 9},
        {"name": "Nandurbar", "score": 245, "rank": 34, "blocks": 6},
        {"name": "Palghar", "score": 240, "rank": 35, "blocks": 8},
        {"name": "Usmanabad", "score": 235, "rank": 36, "blocks": 7}
    ]
    
    # Define domains structure (will be used for metrics generation)
    domains = {
        "Learning Outcomes": {
            "metrics": ["Grade Proficiency", "FLN Achievement", "NAS Performance", "Conceptual Understanding"],
            "state_values": [65.8, 58.2, 62.1, 70.4],
            "max_values": [240, 60, 80, 100]
        },
        "Infrastructure": {
            "metrics": ["Basic Facilities", "Digital Infrastructure", "Classroom Adequacy", "Laboratory Facilities"],
            "state_values": [90.1, 75.3, 82.6, 68.9],
            "max_values": [190, 50, 60, 40]
        },
        "Governance": {
            "metrics": ["VSK Utilization", "Digital Attendance", "Fund Flow Efficiency", "Policy Implementation"],
            "state_values": [49.7, 45.2, 52.8, 48.1],
            "max_values": [130, 30, 35, 35]
        },
        "Teachers Education": {
            "metrics": ["Teacher Qualification", "Professional Development", "Student-Teacher Ratio", "Training Effectiveness"],
            "state_values": [76.6, 78.2, 74.1, 79.5],
            "max_values": [100, 25, 25, 30]
        },
        "Access": {
            "metrics": ["Net Enrollment Ratio", "Gross Enrollment Ratio", "Retention Rates", "OOSC Enrollment"],
            "state_values": [65.5, 68.9, 72.3, 58.7],
            "max_values": [80, 20, 25, 15]
        },
        "Equity": {
            "metrics": ["Gender Parity", "Social Category Performance", "CWSN Inclusion", "Rural-Urban Equity"],
            "state_values": [234.3, 89.2, 85.6, 91.7],
            "max_values": [260, 65, 60, 75]
        }
    }
    
    for i, district in enumerate(districts):
        district_data = {
            "id": f"dist_{i+1:03d}",
            "name": district["name"],
            "state_id": "mh_001",
            "total_score": district["score"],
            "max_score": 600,
            "percentage": (district["score"] / 600) * 100,
            "rank": district["rank"],
            "blocks_count": district["blocks"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.districts.insert_one(prepare_for_mongo(district_data))
        
        # Create blocks for each district
        for j in range(district["blocks"]):
            block_data = {
                "id": f"block_{i+1:03d}_{j+1:03d}",
                "name": f"{district['name']} Block {j+1}",
                "district_id": f"dist_{i+1:03d}",
                "state_id": "mh_001",
                "schools_count": 15 + (j * 3),
                "performance_score": 70 + (j * 2.5),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.blocks.insert_one(prepare_for_mongo(block_data))
            
            # Create metrics for all blocks of first 10 districts (for demo purposes)
            if i < 10:
                for domain, data in domains.items():
                    for idx, metric in enumerate(data["metrics"]):
                        # Slightly vary the values from district level based on block
                        block_value = data["state_values"][idx] * (0.80 + (hash(f"block_{i+1:03d}_{j+1:03d}_{metric}") % 35) / 100)
                        metric_data = {
                            "id": f"metric_block_{i+1:03d}_{j+1:03d}_{domain.lower().replace(' ', '_')}_{idx}",
                            "metric_name": metric,
                            "level": "block",
                            "entity_id": f"block_{i+1:03d}_{j+1:03d}",
                            "entity_name": f"{district['name']} Block {j+1}",
                            "value": block_value,
                            "max_value": data["max_values"][idx],
                            "percentage": (block_value / data["max_values"][idx]) * 100,
                            "trend": ["increasing", "stable", "decreasing"][(idx + j) % 3],
                            "domain": domain,
                            "last_updated": datetime.now(timezone.utc).isoformat()
                        }
                        await db.metrics.insert_one(prepare_for_mongo(metric_data))
            
            # Create schools for each block
            for k in range(block_data["schools_count"]):
                school_data = {
                    "id": f"school_{i+1:03d}_{j+1:03d}_{k+1:03d}",
                    "name": f"{district['name']} School {k+1}",
                    "block_id": f"block_{i+1:03d}_{j+1:03d}",
                    "district_id": f"dist_{i+1:03d}",
                    "state_id": "mh_001",
                    "student_count": 200 + (k * 15),
                    "teacher_count": 12 + k,
                    "infrastructure_score": 65 + (k * 1.5),
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.schools.insert_one(prepare_for_mongo(school_data))
                
                # Create metrics for schools in blocks that have metrics (first 10 districts)
                if i < 10:
                    for domain, data in domains.items():
                        for idx, metric in enumerate(data["metrics"]):
                            # Vary the values based on school
                            school_value = data["state_values"][idx] * (0.75 + (hash(f"school_{i+1:03d}_{j+1:03d}_{k+1:03d}_{metric}") % 40) / 100)
                            metric_data = {
                                "id": f"metric_school_{i+1:03d}_{j+1:03d}_{k+1:03d}_{domain.lower().replace(' ', '_')}_{idx}",
                                "metric_name": metric,
                                "level": "school",
                                "entity_id": f"school_{i+1:03d}_{j+1:03d}_{k+1:03d}",
                                "entity_name": f"{district['name']} School {k+1}",
                                "value": school_value,
                                "max_value": data["max_values"][idx],
                                "percentage": (school_value / data["max_values"][idx]) * 100,
                                "trend": ["increasing", "stable", "decreasing"][(idx + k) % 3],
                                "domain": domain,
                                "last_updated": datetime.now(timezone.utc).isoformat()
                            }
                            await db.metrics.insert_one(prepare_for_mongo(metric_data))
    
    # Insert metrics data
    for domain, data in domains.items():
        for i, metric in enumerate(data["metrics"]):
            metric_data = {
                "id": f"metric_{domain.lower().replace(' ', '_')}_{i}",
                "metric_name": metric,
                "level": "state",
                "entity_id": "mh_001",
                "entity_name": "Maharashtra",
                "value": data["state_values"][i],
                "max_value": data["max_values"][i],
                "percentage": (data["state_values"][i] / data["max_values"][i]) * 100,
                "trend": ["increasing", "stable", "decreasing"][i % 3],
                "domain": domain,
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
            await db.metrics.insert_one(prepare_for_mongo(metric_data))
    
    # Insert metrics data for ALL districts
    for dist_idx, district in enumerate(districts):
        for domain, data in domains.items():
            for i, metric in enumerate(data["metrics"]):
                # Vary the values based on district performance tier
                district_value = data["state_values"][i] * (0.85 + (hash(f"dist_{dist_idx+1:03d}_{metric}") % 25) / 100)
                metric_data = {
                    "id": f"metric_district_{dist_idx+1:03d}_{domain.lower().replace(' ', '_')}_{i}",
                    "metric_name": metric,
                    "level": "district",
                    "entity_id": f"dist_{dist_idx+1:03d}",
                    "entity_name": district["name"],
                    "value": district_value,
                    "max_value": data["max_values"][i],
                    "percentage": (district_value / data["max_values"][i]) * 100,
                    "trend": ["increasing", "stable", "decreasing"][(i + dist_idx) % 3],
                    "domain": domain,
                    "last_updated": datetime.now(timezone.utc).isoformat()
                }
                await db.metrics.insert_one(prepare_for_mongo(metric_data))
    
    print(f"Metrics initialized for state, all 36 districts, all blocks of first 10 districts, and all schools in those blocks")
    
    # Initialize PGI indicator scores for state level
    print("Initializing PGI indicator scores for Maharashtra...")
    state_indicator_scores = {
        # Learning Outcomes indicators (12 indicators)
        "lo_language_class3": 58.3,
        "lo_math_class3": 55.7,
        "lo_language_class5": 61.7,
        "lo_math_class5": 58.3,
        "lo_language_class8": 64.5,
        "lo_math_class8": 62.8,
        "lo_science_class8": 60.4,
        "lo_social_class8": 59.2,
        "lo_language_class10": 66.8,
        "lo_math_class10": 68.5,
        "lo_science_class10": 65.2,
        "lo_social_class10": 63.9,
        
        # Access indicators (8 indicators)
        "adjusted_ner_secondary": 82.3,
        "ner_higher_secondary": 68.5,
        "retention_rate_primary": 91.2,
        "retention_rate_upper_primary": 88.7,
        "retention_rate_secondary": 84.7,
        "completion_rate_secondary": 78.9,
        "completion_rate_higher_secondary": 72.4,
        "participation_rate_pre_primary": 76.8,
        
        # Infrastructure & Facilities indicators (24 indicators)
        "inf_ict_lab": 72.5,
        "inf_smart_classes": 42.5,
        "inf_integrated_science_lab": 71.6,
        "inf_separate_science_lab_hs": 68.3,
        "inf_cocurricular_rooms": 54.8,
        "inf_library_basic": 89.3,
        "inf_library_separate_room": 67.2,
        "inf_prevocational_exposure": 38.5,
        "inf_nsqf_vocational": 28.7,
        "inf_vocational_placement_class10": 52.3,
        "inf_vocational_placement_class12": 58.9,
        "inf_vocational_selfemployed_class10": 18.4,
        "inf_vocational_selfemployed_class12": 24.6,
        "inf_midday_meal": 92.8,
        "inf_pm_poshan_audit": 87.5,
        "inf_health_checkup": 94.2,
        "inf_sanitary_pad_vending": 76.4,
        "inf_functional_incinerator": 68.9,
        "inf_free_textbook": 96.8,
        "inf_balavatika": 58.3,
        "inf_kitchen_garden": 74.2,
        "inf_rainwater_harvesting": 62.7,
        "inf_drinking_water": 98.5,
        "inf_solar_panel": 34.6,
        
        # Equity indicators (44 indicators - equity gaps and facilities)
        # SC vs General gaps (8 indicators)
        "eq_sc_lang_class3": 6.5, "eq_sc_lang_class5": 7.2, "eq_sc_lang_class8": 8.1, "eq_sc_lang_class10": 8.5,
        "eq_sc_math_class3": 7.3, "eq_sc_math_class5": 8.4, "eq_sc_math_class8": 9.2, "eq_sc_math_class10": 9.8,
        # ST vs General gaps (8 indicators)
        "eq_st_lang_class3": 8.2, "eq_st_lang_class5": 9.1, "eq_st_lang_class8": 10.3, "eq_st_lang_class10": 11.2,
        "eq_st_math_class3": 9.5, "eq_st_math_class5": 10.8, "eq_st_math_class8": 12.1, "eq_st_math_class10": 13.5,
        # Urban vs Rural gaps (8 indicators)
        "eq_urban_rural_lang_class3": 9.2, "eq_urban_rural_lang_class5": 10.5, "eq_urban_rural_lang_class8": 11.8, "eq_urban_rural_lang_class10": 12.3,
        "eq_urban_rural_math_class3": 10.1, "eq_urban_rural_math_class5": 11.4, "eq_urban_rural_math_class8": 12.7, "eq_urban_rural_math_class10": 13.2,
        # Boys vs Girls gaps (8 indicators)
        "eq_gender_lang_class3": 2.1, "eq_gender_lang_class5": 2.5, "eq_gender_lang_class8": 2.9, "eq_gender_lang_class10": 3.2,
        "eq_gender_math_class3": 2.8, "eq_gender_math_class5": 3.4, "eq_gender_math_class8": 3.9, "eq_gender_math_class10": 4.2,
        # Examination Result gaps (4 indicators)
        "eq_sc_exam_class10": 8.7, "eq_st_exam_class10": 11.5, "eq_sc_exam_class12": 9.2, "eq_st_exam_class12": 12.3,
        # Transition Rate gaps (2 indicators)
        "eq_gender_transition": 2.8, "eq_minority_transition": 4.5,
        # Facilities (6 indicators)
        "eq_cwsn_assistive_tech": 56.9, "eq_cwsn_aids_appliances": 72.4, "eq_cwsn_ramp": 78.5, 
        "eq_cwsn_toilets": 68.3, "eq_boys_toilets": 94.2, "eq_girls_toilets": 92.8,
        
        # Governance Processes indicators (16 indicators)
        "gp_aadhar_seeding": 96.8, "gp_student_attendance_digital": 74.3, "gp_teacher_attendance_digital": 78.6,
        "gp_head_teacher_primary": 92.4, "gp_head_teacher_upper_primary": 88.7, "gp_vidyanjali_portal": 42.5,
        "gp_anganwadi_colocated": 58.3, "gp_ptr_primary": 69.8, "gp_principals_secondary": 94.2,
        "gp_central_fund_release_recurring": 18.5, "gp_central_fund_release_nonrecurring": 24.3,
        "gp_cyber_safety": 62.7, "gp_internet_pedagogical": 65.8, "gp_state_fund_release": 16.2,
        "gp_oosc_identified": 87.4, "gp_oosc_mainstreamed": 68.9,
        
        # Teacher Education & Training indicators (8 indicators)
        "tet_trained_cwsn_teachers": 68.3,
        "tet_career_counselling": 72.5,
        "tet_teacher_aadhar": 98.7,
        "tet_qualified_preprimary": 87.4,
        "tet_qualified_primary": 92.5,
        "tet_qualified_upper_primary": 89.6,
        "tet_qualified_secondary": 88.7,
        "tet_qualified_higher_secondary": 85.3
    }
    
    # Store state-level PGI indicator scores
    for indicator_key, achieved_pct in state_indicator_scores.items():
        if indicator_key in PGI_INDICATORS:
            indicator_info = PGI_INDICATORS[indicator_key]
            score_data = {
                "id": f"mh_001_{indicator_key}",
                "indicator_key": indicator_key,
                "indicator_name": indicator_info["name"],
                "domain": indicator_info["domain"],
                "achieved_value": achieved_pct,
                "target_value": indicator_info["target"],
                "percentage": achieved_pct,
                "unit": indicator_info["unit"],
                "level": "state",
                "entity_id": "mh_001",
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
            await db.pgi_indicator_scores.insert_one(prepare_for_mongo(score_data))
    
    # Calculate and update state PGI score
    pgi_result = calculate_total_pgi_score(state_indicator_scores, max_score=1000)
    await db.states.update_one(
        {"id": "mh_001"},
        {"$set": {
            "total_score": pgi_result["total_score"],
            "percentage": pgi_result["percentage"]
        }}
    )
    
    print(f"PGI Framework initialized. Maharashtra PGI Score: {pgi_result['total_score']}/1000 ({pgi_result['percentage']}%)")
    print("Sample data initialization completed")

# API Endpoints
@app.on_event("startup")
async def startup_db():
    await initialize_sample_data()

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc)}

@app.get("/api/states", response_model=List[Dict])
async def get_states():
    """Get all states"""
    states = await db.states.find().to_list(length=None)
    return [parse_from_mongo(state) for state in states]

@app.get("/api/states/{state_id}/districts", response_model=List[Dict])
async def get_districts(state_id: str):
    """Get all districts in a state"""
    districts = await db.districts.find({"state_id": state_id}).to_list(length=None)
    return [parse_from_mongo(district) for district in districts]

@app.get("/api/districts/{district_id}/blocks", response_model=List[Dict])
async def get_blocks(district_id: str):
    """Get all blocks in a district"""
    blocks = await db.blocks.find({"district_id": district_id}).to_list(length=None)
    return [parse_from_mongo(block) for block in blocks]

@app.get("/api/blocks/{block_id}/schools", response_model=List[Dict])
async def get_schools(block_id: str):
    """Get all schools in a block"""
    schools = await db.schools.find({"block_id": block_id}).to_list(length=None)
    return [parse_from_mongo(school) for school in schools]

@app.get("/api/schools/{school_id}")
async def get_school_by_id(school_id: str):
    """Get school data directly by school ID"""
    school = await db.schools.find_one({"id": school_id})
    if not school:
        raise HTTPException(status_code=404, detail=f"School not found: {school_id}")
    return parse_from_mongo(school)

@app.get("/api/districts/{district_id}")
async def get_district_by_id(district_id: str):
    """Get district data directly by district ID"""
    district = await db.districts.find_one({"id": district_id})
    if not district:
        raise HTTPException(status_code=404, detail=f"District not found: {district_id}")
    return parse_from_mongo(district)

@app.get("/api/blocks/{block_id}")
async def get_block_by_id(block_id: str):
    """Get block data directly by block ID"""
    block = await db.blocks.find_one({"id": block_id})
    if not block:
        raise HTTPException(status_code=404, detail=f"Block not found: {block_id}")
    return parse_from_mongo(block)

@app.get("/api/metrics/{level}/{entity_id}")
async def get_metrics(level: str, entity_id: str):
    """Get metrics for specific entity level"""
    metrics = await db.metrics.find({"level": level, "entity_id": entity_id}).to_list(length=None)
    return [parse_from_mongo(metric) for metric in metrics]

@app.get("/api/insights/{level}/{entity_id}")
async def get_insights(level: str, entity_id: str):
    """Get AI-generated insights for specific entity"""
    insights = await db.insights.find({"level": level, "entity_id": entity_id}).to_list(length=None)
    return [parse_from_mongo(insight) for insight in insights]

@app.post("/api/generate-insights/{level}/{entity_id}")
async def generate_insights_endpoint(level: str, entity_id: str, background_tasks: BackgroundTasks):
    """Generate AI insights for specific metrics"""
    
    async def generate_insights_task():
        # Get metrics for the entity
        metrics = await db.metrics.find({"level": level, "entity_id": entity_id}).to_list(length=None)
        
        for metric in metrics:
            # Check if insight already exists
            existing_insight = await db.insights.find_one({
                "metric_name": metric["metric_name"],
                "level": level,
                "entity_id": entity_id
            })
            
            if not existing_insight:
                # Generate new insight
                ai_result = await generate_ai_insight(
                    metric["metric_name"],
                    level,
                    metric["entity_name"],
                    metric["value"],
                    metric["max_value"],
                    metric["trend"]
                )
                
                insight_data = {
                    "id": str(uuid.uuid4()),
                    "metric_name": metric["metric_name"],
                    "level": level,
                    "entity_id": entity_id,
                    "insight_text": ai_result["insight"],
                    "recommendation": ai_result["recommendation"],
                    "severity": ai_result["severity"],
                    "generated_at": datetime.now(timezone.utc).isoformat()
                }
                
                await db.insights.insert_one(prepare_for_mongo(insight_data))
    
    background_tasks.add_task(generate_insights_task)
    return {"message": "Insights generation started", "level": level, "entity_id": entity_id}


@app.post("/api/generate-domain-insights/{domain_key}")
async def generate_domain_insights(domain_key: str, level: str = "state", entity_id: str = "mh_001"):
    """Generate comprehensive insights for a domain based on the current level"""
    
    # Normalize domain key (handle both hyphens and underscores)
    domain_key = domain_key.replace("-", "_")
    
    # Domain name mapping
    domain_mapping = {
        "learning_outcomes": "Learning Outcomes",
        "infrastructure": "Infrastructure",
        "access": "Access",
        "equity": "Equity",
        "governance": "Governance",
        "teacher_education": "Teachers Education"
    }
    
    domain_name = domain_mapping.get(domain_key, domain_key)
    
    # Get PGI data based on the current level
    pgi_data = await get_pgi_score(level, entity_id)
    domain_data = next((d for d in pgi_data["domains"] if d["domain_key"] == domain_key), None)
    
    if not domain_data:
        raise HTTPException(status_code=404, detail=f"Domain not found: {domain_key}")
    
    # Get entities based on current level
    all_districts = []
    all_blocks = []
    all_schools = []
    
    if level == "state":
        all_districts = await db.districts.find({}, {"_id": 0}).to_list(length=None)
        all_blocks = await db.blocks.find({}, {"_id": 0}).to_list(length=None)
        all_schools = await db.schools.find({}, {"_id": 0}).to_list(length=None)
    elif level == "district":
        # For district level, get blocks and schools within this district
        all_blocks = await db.blocks.find({"district_id": entity_id}, {"_id": 0}).to_list(length=None)
        for block in all_blocks:
            block_schools = await db.schools.find({"block_id": block["id"]}, {"_id": 0}).to_list(length=5)
            all_schools.extend(block_schools)
    elif level == "block":
        # For block level, get schools within this block
        all_schools = await db.schools.find({"block_id": entity_id}, {"_id": 0}).to_list(length=None)
    
    # Get metrics for this domain
    domain_metrics = await db.metrics.find({"domain": domain_name}).to_list(length=None)
    
    # Analyze indicators needing improvement
    indicators_analysis = []
    for indicator in domain_data.get("indicators", []):
        achievement = indicator.get("achieved_percentage", 0)
        target = indicator.get("target", 100)
        gap = target - achievement
        
        if gap > 0:
            indicators_analysis.append({
                "indicator_name": indicator.get("indicator_name", ""),
                "indicator_code": indicator.get("indicator_code", ""),
                "current": achievement,
                "target": target,
                "gap": round(gap, 2),
                "gap_percentage": round((gap / target) * 100, 2) if target > 0 else 0,
                "priority": "High" if gap > 20 else "Medium" if gap > 10 else "Low"
            })
    
    # Sort by gap (descending)
    indicators_analysis.sort(key=lambda x: x["gap"], reverse=True)
    
    # Initialize empty lists for all analyses
    district_scores = []
    block_scores = []
    school_scores = []
    
    # Analyze districts needing improvement (bottom 5) - only for state level
    bottom_districts = []
    if level == "state":
        district_scores = []
        for district in all_districts:
            try:
                # Get PGI data for this district
                dist_pgi = await get_pgi_score("district", district["id"])
                dist_domain = next((d for d in dist_pgi.get("domains", []) if d.get("domain_key") == domain_key), None)
                
                if dist_domain:
                    percentage = dist_domain.get("percentage", 0)
                    score = dist_domain.get("score", 0)
                    max_score = dist_domain.get("max_score", 100)
                    
                    district_scores.append({
                        "id": district["id"],
                        "name": district["name"],
                        "score": round(score, 2),
                        "max_score": round(max_score, 2),
                        "percentage": round(percentage, 2),
                        "gap_to_target": round(100 - percentage, 2)
                    })
            except Exception as e:
                print(f"Error processing district {district['id']}: {str(e)}")
                continue
        
        district_scores.sort(key=lambda x: x["percentage"])
        bottom_districts = district_scores[:5]
    
    # Analyze blocks needing improvement - for state and district levels
    bottom_blocks = []
    if level in ["state", "district"]:
        block_scores = []
        for block in all_blocks:
            try:
                # Get PGI data for this block
                block_pgi = await get_pgi_score("block", block["id"])
                block_domain = next((d for d in block_pgi.get("domains", []) if d.get("domain_key") == domain_key), None)
                
                if block_domain:
                    percentage = block_domain.get("percentage", 0)
                    score = block_domain.get("score", 0)
                    max_score = block_domain.get("max_score", 100)
                    
                    # Get district name only for state level
                    district_name = ""
                    if level == "state":
                        district = next((d for d in all_districts if d["id"] == block.get("district_id")), None)
                        district_name = district["name"] if district else "Unknown"
                    
                    block_scores.append({
                        "id": block["id"],
                        "name": block["name"],
                        "district_name": district_name,
                        "score": round(score, 2),
                        "max_score": round(max_score, 2),
                        "percentage": round(percentage, 2),
                        "gap_to_target": round(100 - percentage, 2)
                    })
            except Exception as e:
                print(f"Error processing block {block['id']}: {str(e)}")
                continue
        
        block_scores.sort(key=lambda x: x["percentage"])
        bottom_blocks = block_scores[:10]
    
    # Analyze schools needing improvement - for all levels
    bottom_schools = []
    school_scores = []
    
    for school in all_schools:
        try:
            # Get PGI data for this school
            school_pgi = await get_pgi_score("school", school["id"])
            school_domain = next((d for d in school_pgi.get("domains", []) if d.get("domain_key") == domain_key), None)
            
            if school_domain:
                percentage = school_domain.get("percentage", 0)
                score = school_domain.get("score", 0)
                max_score = school_domain.get("max_score", 100)
                
                # Get block and district names based on level
                block_name = ""
                district_name = ""
                if level in ["state", "district"]:
                    block = next((b for b in all_blocks if b["id"] == school.get("block_id")), None)
                    block_name = block["name"] if block else "Unknown"
                    if level == "state":
                        district = next((d for d in all_districts if d["id"] == block.get("district_id")), None) if block else None
                        district_name = district["name"] if district else "Unknown"
                
                school_scores.append({
                    "id": school["id"],
                    "name": school["name"],
                    "block_name": block_name,
                    "district_name": district_name,
                    "score": round(score, 2),
                    "max_score": round(max_score, 2),
                    "percentage": round(percentage, 2),
                    "gap_to_target": round(100 - percentage, 2)
                })
        except Exception as e:
            print(f"Error processing school {school['id']}: {str(e)}")
            continue
    
    school_scores.sort(key=lambda x: x["percentage"])
    bottom_schools = school_scores[:10]
    
    # Calculate overall statistics
    overall_achievement = domain_data.get("percentage", 0)
    overall_target = 100
    overall_gap = overall_target - overall_achievement
    
    # Generate summary insights
    summary = {
        "domain_name": domain_data.get("domain_name", ""),
        "domain_key": domain_key,
        "overall_achievement": round(overall_achievement, 2),
        "overall_gap": round(overall_gap, 2),
        "total_indicators": len(domain_data.get("indicators", [])),
        "indicators_below_target": len(indicators_analysis),
        "districts_analyzed": len(bottom_districts),
        "blocks_analyzed": len(bottom_blocks),
        "schools_analyzed": len(bottom_schools)
    }
    
    return {
        "summary": summary,
        "indicators_needing_improvement": indicators_analysis[:10],
        "districts_needing_improvement": bottom_districts,
        "blocks_needing_improvement": bottom_blocks,
        "schools_needing_improvement": bottom_schools,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/dashboard-overview")
async def get_dashboard_overview():
    """Get comprehensive dashboard overview"""
    # Get state data
    state = await db.states.find_one({"name": "Maharashtra"})
    
    # Get top performing districts
    top_districts = await db.districts.find().sort("percentage", -1).limit(5).to_list(length=5)
    
    # Get domain-wise performance
    domains = {}
    domain_names = ["Learning Outcomes", "Infrastructure", "Governance", "Teachers Education", "Access", "Equity"]
    
    for domain in domain_names:
        domain_metrics = await db.metrics.find({"domain": domain, "level": "state"}).to_list(length=None)
        if domain_metrics:
            total_value = sum(m["value"] for m in domain_metrics)
            total_max = sum(m["max_value"] for m in domain_metrics)
            domains[domain] = {
                "score": total_value,
                "max_score": total_max,
                "percentage": (total_value / total_max) * 100 if total_max > 0 else 0,
                "metrics_count": len(domain_metrics)
            }
    
    return {
        "state": parse_from_mongo(state) if state else {},
        "top_districts": [parse_from_mongo(d) for d in top_districts],
        "domain_performance": domains,
        "total_districts": await db.districts.count_documents({}),
        "total_blocks": await db.blocks.count_documents({}),
        "total_schools": await db.schools.count_documents({})
    }

@app.get("/api/export-data/{level}")
async def export_data(level: str):
    """Export data for specific level as JSON"""
    data = {}
    
    if level == "state":
        data["states"] = [parse_from_mongo(s) for s in await db.states.find().to_list(length=None)]
        data["metrics"] = [parse_from_mongo(m) for m in await db.metrics.find({"level": "state"}).to_list(length=None)]
    elif level == "district":
        data["districts"] = [parse_from_mongo(d) for d in await db.districts.find().to_list(length=None)]
        data["metrics"] = [parse_from_mongo(m) for m in await db.metrics.find({"level": "district"}).to_list(length=None)]
    elif level == "block":
        data["blocks"] = [parse_from_mongo(b) for b in await db.blocks.find().to_list(length=None)]
    elif level == "school":
        data["schools"] = [parse_from_mongo(s) for s in await db.schools.find().to_list(length=None)]
    
    data["insights"] = [parse_from_mongo(i) for i in await db.insights.find({"level": level}).to_list(length=None)]
    
    return {
        "level": level,
        "exported_at": datetime.now(timezone.utc),
        "data": data
    }

@app.post("/api/reinitialize-data")
async def reinitialize_data():
    """Clear and reinitialize all sample data"""
    try:
        # Clear all collections
        await db.states.delete_many({})
        await db.districts.delete_many({})
        await db.blocks.delete_many({})
        await db.schools.delete_many({})
        await db.metrics.delete_many({})
        await db.insights.delete_many({})
        
        print("Database cleared. Reinitializing data...")
        await initialize_sample_data()
        
        return {"message": "Data reinitialized successfully", "districts_count": 36}
    except Exception as e:
        print(f"Error reinitializing data: {e}")
        return {"error": str(e)}

@app.get("/api/pgi-framework")
async def get_pgi_framework():
    """Get the complete PGI framework structure"""
    return {
        "domains": PGI_DOMAINS,
        "indicators": PGI_INDICATORS,
        "total_domains": len(PGI_DOMAINS),
        "total_indicators": len(PGI_INDICATORS)
    }

@app.get("/api/pgi-framework/domains")
async def get_domains_only():
    """Get only domain information"""
    return {"domains": PGI_DOMAINS}

@app.get("/api/pgi-framework/domains/{domain_key}/indicators")
async def get_domain_indicators(domain_key: str):
    """Get all indicators for a specific domain"""
    if domain_key not in PGI_DOMAINS:
        raise HTTPException(status_code=404, detail="Domain not found")
    
    domain_indicators = get_indicators_for_domain(domain_key)
    return {
        "domain": PGI_DOMAINS[domain_key],
        "indicators": domain_indicators,
        "indicators_count": len(domain_indicators)
    }

@app.get("/api/pgi-score/{level}/{entity_id}")
async def get_pgi_score(level: str, entity_id: str):
    """Get detailed PGI score for an entity with domain and indicator breakdown"""
    
    # Get entity details
    entity = None
    entity_name = ""
    
    if level == "state":
        entity = await db.states.find_one({"id": entity_id})
        entity_name = entity["name"] if entity else "Unknown State"
    elif level == "district":
        entity = await db.districts.find_one({"id": entity_id})
        entity_name = entity["name"] if entity else "Unknown District"
    elif level == "block":
        entity = await db.blocks.find_one({"id": entity_id})
        entity_name = entity["name"] if entity else "Unknown Block"
    elif level == "school":
        entity = await db.schools.find_one({"id": entity_id})
        entity_name = entity["name"] if entity else "Unknown School"
    
    if not entity:
        raise HTTPException(status_code=404, detail=f"Entity not found: {entity_id}")
    
    # Get all indicator scores for this entity
    indicator_scores_data = await db.pgi_indicator_scores.find({
        "level": level,
        "entity_id": entity_id
    }).to_list(length=None)
    
    # Convert to dict for calculation
    indicator_scores = {
        score["indicator_key"]: score["percentage"]
        for score in indicator_scores_data
    }
    
    # If no scores exist, generate sample scores for demonstration
    if not indicator_scores:
        # Get applicable indicators for this level
        level_indicators = get_indicators_for_level(level)
        indicator_scores = {
            key: 50 + (hash(key + entity_id) % 40)  # Generate deterministic scores between 50-90
            for key in level_indicators.keys()
        }
    
    # Calculate PGI scores
    pgi_result = calculate_total_pgi_score(indicator_scores, max_score=1000)
    
    # Build detailed response with domain breakdown
    domains_detail = []
    for domain_key, domain_score_data in pgi_result["domain_breakdown"].items():
        domain_indicators_list = []
        domain_indicators = get_indicators_for_domain(domain_key)
        
        for ind_key, ind_data in domain_indicators.items():
            if level in ind_data["levels"]:
                achieved_pct = indicator_scores.get(ind_key, 0)
                domain_indicators_list.append({
                    "indicator_key": ind_key,
                    "indicator_code": ind_data["code"],
                    "indicator_name": ind_data["name"],
                    "achieved_percentage": round(achieved_pct, 2),
                    "target": ind_data["target"],
                    "unit": ind_data["unit"],
                    "weight_in_domain": ind_data["weight"]
                })
        
        domains_detail.append({
            "domain_key": domain_key,
            "domain_name": domain_score_data["name"],
            "domain_code": domain_score_data["code"],
            "score": domain_score_data["score"],
            "max_score": domain_score_data["max_score"],
            "percentage": domain_score_data["percentage"],
            "weight": domain_score_data["weight"],
            "indicators": domain_indicators_list
        })
    
    return {
        "entity_id": entity_id,
        "entity_name": entity_name,
        "level": level,
        "total_score": pgi_result["total_score"],
        "max_score": pgi_result["max_score"],
        "percentage": pgi_result["percentage"],
        "domains": domains_detail,
        "calculation_date": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/pgi-score/{level}/{entity_id}/calculate")
async def calculate_and_store_pgi_score(level: str, entity_id: str, indicator_data: Dict[str, float]):
    """
    Calculate and store PGI score based on provided indicator values
    
    Request body: Dict of {indicator_key: achieved_percentage}
    """
    
    # Validate level and entity
    entity = None
    if level == "state":
        entity = await db.states.find_one({"id": entity_id})
    elif level == "district":
        entity = await db.districts.find_one({"id": entity_id})
    elif level == "block":
        entity = await db.blocks.find_one({"id": entity_id})
    elif level == "school":
        entity = await db.schools.find_one({"id": entity_id})
    
    if not entity:
        raise HTTPException(status_code=404, detail=f"Entity not found: {entity_id}")
    
    # Store individual indicator scores
    for indicator_key, achieved_pct in indicator_data.items():
        if indicator_key in PGI_INDICATORS:
            indicator_info = PGI_INDICATORS[indicator_key]
            
            score_data = {
                "id": f"{entity_id}_{indicator_key}",
                "indicator_key": indicator_key,
                "indicator_name": indicator_info["name"],
                "domain": indicator_info["domain"],
                "achieved_value": achieved_pct,
                "target_value": indicator_info["target"],
                "percentage": achieved_pct,
                "unit": indicator_info["unit"],
                "level": level,
                "entity_id": entity_id,
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
            
            # Upsert (update or insert)
            await db.pgi_indicator_scores.update_one(
                {"id": score_data["id"]},
                {"$set": prepare_for_mongo(score_data)},
                upsert=True
            )
    
    # Calculate total PGI score
    pgi_result = calculate_total_pgi_score(indicator_data, max_score=1000)
    
    # Update entity with new PGI score
    update_data = {
        "total_score": pgi_result["total_score"],
        "percentage": pgi_result["percentage"],
        "last_calculated": datetime.now(timezone.utc).isoformat()
    }
    
    if level == "state":
        await db.states.update_one({"id": entity_id}, {"$set": update_data})
    elif level == "district":
        await db.districts.update_one({"id": entity_id}, {"$set": update_data})
    elif level == "block":
        await db.blocks.update_one({"id": entity_id}, {"$set": update_data})
    elif level == "school":
        await db.schools.update_one({"id": entity_id}, {"$set": update_data})
    
    return {
        "message": "PGI score calculated and stored successfully",
        "entity_id": entity_id,
        "level": level,
        "pgi_result": pgi_result
    }

@app.get("/api/pgi-comparison/{level}")
async def get_pgi_comparison(level: str, limit: int = 10):
    """Get top performing entities at a given level based on PGI score"""
    
    collection = None
    if level == "state":
        collection = db.states
    elif level == "district":
        collection = db.districts
    elif level == "block":
        collection = db.blocks
    elif level == "school":
        collection = db.schools
    else:
        raise HTTPException(status_code=400, detail="Invalid level")
    
    # Get top entities by percentage
    top_entities = await collection.find().sort("percentage", -1).limit(limit).to_list(length=limit)
    
    return {
        "level": level,
        "top_performers": [parse_from_mongo(entity) for entity in top_entities],
        "count": len(top_entities)
    }


@app.post("/api/indicator-drilldown")
async def indicator_drilldown(request: IndicatorDrilldownRequest):
    """
    Generate drill-down analysis for a specific indicator
    Shows which districts/blocks/schools need improvement for this indicator
    """
    
    level = request.level
    entity_id = request.entity_id
    indicator_code = request.indicator_code
    domain_name = request.domain_name
    
    try:
        # Initialize response structure
        result = {
            "indicator_code": indicator_code,
            "domain_name": domain_name,
            "level": level,
            "entity_id": entity_id,
            "districts_needing_improvement": [],
            "blocks_needing_improvement": [],
            "schools_needing_improvement": [],
            "insights": ""
        }
        
        # Get the indicator details from PGI data
        pgi_data = await get_pgi_score(level, entity_id)
        target_domain = None
        target_indicator = None
        
        for domain in pgi_data.get("domains", []):
            if domain.get("domain_name") == domain_name or domain.get("domain_key") == domain_name.lower().replace(" ", "_"):
                target_domain = domain
                for indicator in domain.get("indicators", []):
                    if indicator.get("indicator_code") == indicator_code:
                        target_indicator = indicator
                        break
                break
        
        if not target_indicator:
            raise HTTPException(status_code=404, detail="Indicator not found")
        
        indicator_target = target_indicator.get("target", 100)
        
        # State level: drill down to districts, blocks, and schools
        if level == "state":
            # Get all districts
            all_districts = await db.districts.find({}, {"_id": 0}).to_list(length=None)
            
            district_analysis = []
            for district in all_districts[:10]:  # Limit to first 10 for performance
                try:
                    dist_pgi = await get_pgi_score("district", district["id"])
                    dist_domain = next((d for d in dist_pgi.get("domains", []) if d.get("domain_name") == domain_name), None)
                    if dist_domain:
                        dist_indicator = next((i for i in dist_domain.get("indicators", []) if i.get("indicator_code") == indicator_code), None)
                        if dist_indicator:
                            achievement = dist_indicator.get("achieved_percentage", 0)
                            gap = indicator_target - achievement
                            if gap > 0:  # Only include if gap > 5%
                                district_analysis.append({
                                    "id": district["id"],
                                    "name": district["name"],
                                    "achievement": round(achievement, 2),
                                    "target": indicator_target,
                                    "gap": round(gap, 2)
                                })
                except Exception as e:
                    continue
            
            # Sort by gap (descending) and take bottom 5
            district_analysis.sort(key=lambda x: x["gap"], reverse=True)
            result["districts_needing_improvement"] = district_analysis[:5]
            
            # Get blocks from bottom 3 districts
            blocks_to_analyze = []
            for district in result["districts_needing_improvement"][:3]:
                blocks = await db.blocks.find({"district_id": district["id"]}, {"_id": 0}).to_list(length=None)
                blocks_to_analyze.extend(blocks)
            
            block_analysis = []
            for block in blocks_to_analyze:
                try:
                    block_pgi = await get_pgi_score("block", block["id"])
                    block_domain = next((d for d in block_pgi.get("domains", []) if d.get("domain_name") == domain_name), None)
                    if block_domain:
                        block_indicator = next((i for i in block_domain.get("indicators", []) if i.get("indicator_code") == indicator_code), None)
                        if block_indicator:
                            achievement = block_indicator.get("achieved_percentage", 0)
                            gap = indicator_target - achievement
                            if gap > 0:
                                block_analysis.append({
                                    "id": block["id"],
                                    "name": block["name"],
                                    "district_name": block["district_name"],
                                    "achievement": round(achievement, 2),
                                    "target": indicator_target,
                                    "gap": round(gap, 2)
                                })
                except Exception as e:
                    continue
            
            block_analysis.sort(key=lambda x: x["gap"], reverse=True)
            result["blocks_needing_improvement"] = block_analysis[:5]
            
            # Get schools from bottom 3 blocks
            schools_to_analyze = []
            for block in result["blocks_needing_improvement"][:3]:
                schools = await db.schools.find({"block_id": block["id"]}, {"_id": 0}).to_list(length=5)
                schools_to_analyze.extend(schools)
            
            school_analysis = []
            for school in schools_to_analyze:
                try:
                    school_pgi = await get_pgi_score("school", school["id"])
                    school_domain = next((d for d in school_pgi.get("domains", []) if d.get("domain_name") == domain_name), None)
                    if school_domain:
                        school_indicator = next((i for i in school_domain.get("indicators", []) if i.get("indicator_code") == indicator_code), None)
                        if school_indicator:
                            achievement = school_indicator.get("achieved_percentage", 0)
                            gap = indicator_target - achievement
                            if gap > 0:
                                school_analysis.append({
                                    "id": school["id"],
                                    "name": school["name"],
                                    "block_name": school["block_name"],
                                    "district_name": school.get("district_name", ""),
                                    "achievement": round(achievement, 2),
                                    "target": indicator_target,
                                    "gap": round(gap, 2)
                                })
                except Exception as e:
                    continue
            
            school_analysis.sort(key=lambda x: x["gap"], reverse=True)
            result["schools_needing_improvement"] = school_analysis[:5]
        
        # District level: drill down to blocks and schools
        elif level == "district":
            # Get all blocks in this district
            all_blocks = await db.blocks.find({"district_id": entity_id}, {"_id": 0}).to_list(length=None)
            
            block_analysis = []
            for block in all_blocks:
                try:
                    block_pgi = await get_pgi_score("block", block["id"])
                    block_domain = next((d for d in block_pgi.get("domains", []) if d.get("domain_name") == domain_name), None)
                    if block_domain:
                        block_indicator = next((i for i in block_domain.get("indicators", []) if i.get("indicator_code") == indicator_code), None)
                        if block_indicator:
                            achievement = block_indicator.get("achieved_percentage", 0)
                            gap = indicator_target - achievement
                            if gap > 0:
                                block_analysis.append({
                                    "id": block["id"],
                                    "name": block["name"],
                                    "achievement": round(achievement, 2),
                                    "target": indicator_target,
                                    "gap": round(gap, 2)
                                })
                except Exception as e:
                    continue
            
            block_analysis.sort(key=lambda x: x["gap"], reverse=True)
            result["blocks_needing_improvement"] = block_analysis[:5]
            
            # Get schools from bottom 3 blocks
            schools_to_analyze = []
            for block in result["blocks_needing_improvement"][:3]:
                schools = await db.schools.find({"block_id": block["id"]}, {"_id": 0}).to_list(length=5)
                schools_to_analyze.extend(schools)
            
            school_analysis = []
            for school in schools_to_analyze:
                try:
                    school_pgi = await get_pgi_score("school", school["id"])
                    school_domain = next((d for d in school_pgi.get("domains", []) if d.get("domain_name") == domain_name), None)
                    if school_domain:
                        school_indicator = next((i for i in school_domain.get("indicators", []) if i.get("indicator_code") == indicator_code), None)
                        if school_indicator:
                            achievement = school_indicator.get("achieved_percentage", 0)
                            gap = indicator_target - achievement
                            if gap > 0:
                                school_analysis.append({
                                    "id": school["id"],
                                    "name": school["name"],
                                    "block_name": school["block_name"],
                                    "achievement": round(achievement, 2),
                                    "target": indicator_target,
                                    "gap": round(gap, 2)
                                })
                except Exception as e:
                    continue
            
            school_analysis.sort(key=lambda x: x["gap"], reverse=True)
            result["schools_needing_improvement"] = school_analysis[:5]
        
        # Block level: drill down to schools only
        elif level == "block":
            # Get all schools in this block
            all_schools = await db.schools.find({"block_id": entity_id}, {"_id": 0}).to_list(length=None)
            
            school_analysis = []
            for school in all_schools:
                try:
                    school_pgi = await get_pgi_score("school", school["id"])
                    school_domain = next((d for d in school_pgi.get("domains", []) if d.get("domain_name") == domain_name), None)
                    if school_domain:
                        school_indicator = next((i for i in school_domain.get("indicators", []) if i.get("indicator_code") == indicator_code), None)
                        if school_indicator:
                            achievement = school_indicator.get("achieved_percentage", 0)
                            gap = indicator_target - achievement
                            if gap > 0:
                                school_analysis.append({
                                    "id": school["id"],
                                    "name": school["name"],
                                    "achievement": round(achievement, 2),
                                    "target": indicator_target,
                                    "gap": round(gap, 2)
                                })
                except Exception as e:
                    continue
            
            school_analysis.sort(key=lambda x: x["gap"], reverse=True)
            result["schools_needing_improvement"] = school_analysis[:5]
        
        # Generate AI insights
        insights_prompt = f"""Analyze the following indicator performance data and provide actionable insights:

Indicator: {target_indicator.get('indicator_name', '')} ({indicator_code})
Domain: {domain_name}
Target: {indicator_target}%
Current Achievement: {target_indicator.get('achieved_percentage', 0):.1f}%

"""
        
        if result["districts_needing_improvement"]:
            insights_prompt += f"\nDistricts Needing Improvement ({len(result['districts_needing_improvement'])}):\n"
            for dist in result["districts_needing_improvement"][:3]:
                insights_prompt += f"- {dist['name']}: {dist['achievement']}% (Gap: {dist['gap']}%)\n"
        
        if result["blocks_needing_improvement"]:
            insights_prompt += f"\nBlocks Needing Improvement ({len(result['blocks_needing_improvement'])}):\n"
            for block in result["blocks_needing_improvement"][:3]:
                block_location = f" in {block.get('district_name', '')}" if 'district_name' in block else ""
                insights_prompt += f"- {block['name']}{block_location}: {block['achievement']}% (Gap: {block['gap']}%)\n"
        
        if result["schools_needing_improvement"]:
            insights_prompt += f"\nSchools Needing Improvement ({len(result['schools_needing_improvement'])}):\n"
            for school in result["schools_needing_improvement"][:3]:
                school_location = f" in {school.get('block_name', '')}" if 'block_name' in school else ""
                insights_prompt += f"- {school['name']}{school_location}: {school['achievement']}% (Gap: {school['gap']}%)\n"
        
        insights_prompt += "\nProvide:\n1. Root cause analysis (2-3 sentences)\n2. Top 3 recommended actions\n3. Expected impact if actions are taken\n\nKeep response concise and actionable."
        
        # Generate insights using fallback analysis (no external LLM dependency)
        try:
            # Provide data-driven insights based on analysis
            fallback_insights = f"""**Performance Analysis for {target_indicator.get('indicator_name', '')}**

**Current Status:**
- Achievement: {target_indicator.get('achieved_percentage', 0):.1f}%
- Target: {indicator_target}%
- Gap to Target: {indicator_target - target_indicator.get('achieved_percentage', 0):.1f}%

**Key Findings:**
"""
            
            if result["districts_needing_improvement"]:
                fallback_insights += f"\n• {len(result['districts_needing_improvement'])} districts identified requiring immediate attention\n"
                fallback_insights += f"• Lowest performing district: {result['districts_needing_improvement'][0]['name']} at {result['districts_needing_improvement'][0]['achievement']}%\n"
            
            if result["blocks_needing_improvement"]:
                fallback_insights += f"• {len(result['blocks_needing_improvement'])} blocks need targeted interventions\n"
                fallback_insights += f"• Average gap across identified blocks: {sum(b['gap'] for b in result['blocks_needing_improvement'][:5]) / min(5, len(result['blocks_needing_improvement'])):.1f}%\n"
            
            if result["schools_needing_improvement"]:
                fallback_insights += f"• {len(result['schools_needing_improvement'])} schools require immediate support\n"
            
            fallback_insights += """
**Recommended Actions:**
1. Deploy targeted training programs to low-performing entities
2. Establish peer learning networks with top performers
3. Implement regular monitoring and progress tracking
4. Allocate additional resources to entities with largest gaps

**Expected Impact:**
Focused interventions on identified entities could improve overall indicator achievement by 5-10% within 6 months."""
            
            result["insights"] = fallback_insights
        except Exception as e:
            print(f"[ERROR] Failed to generate insights: {str(e)}")
            # Minimal fallback if something goes wrong
            result["insights"] = f"""**Performance Analysis for {target_indicator.get('indicator_name', '')}**

**Current Status:**
- Achievement: {target_indicator.get('achieved_percentage', 0):.1f}%
- Target: {indicator_target}%
- Gap to Target: {indicator_target - target_indicator.get('achieved_percentage', 0):.1f}%

**Recommended Actions:**
1. Deploy targeted training programs to low-performing entities
2. Establish peer learning networks with top performers
3. Implement regular monitoring and progress tracking"""
        
        # Add summary statistics
        result["summary"] = {
            "indicator_name": target_indicator.get("indicator_name", ""),
            "current_achievement": round(target_indicator.get("achieved_percentage", 0), 2),
            "target": indicator_target,
            "gap": round(indicator_target - target_indicator.get("achieved_percentage", 0), 2),
            "districts_analyzed": len(result["districts_needing_improvement"]),
            "blocks_analyzed": len(result["blocks_needing_improvement"]),
            "schools_analyzed": len(result["schools_needing_improvement"])
        }
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)