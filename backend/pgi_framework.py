"""
PGI (Performance Grading Index) Framework Configuration
Based on Maharashtra Education System Performance Indicators
"""

# PGI Domain Structure with Weights (Total = 1.0)
PGI_DOMAINS = {
    "learning_outcomes": {
        "name": "Learning Outcomes and Quality",
        "code": "LO",
        "weight": 0.30,  # 30% of total score
        "description": "Student learning achievements, assessment results, and equity in performance"
    },
    "access": {
        "name": "Access",
        "code": "A",
        "weight": 0.15,  # 15% of total score
        "description": "Student enrollment, retention, transition rates, and participation"
    },
    "infrastructure": {
        "name": "Infrastructure & Facilities",
        "code": "I&F",
        "weight": 0.18,  # 18% of total score
        "description": "Physical facilities, digital infrastructure, and learning resources"
    },
    "equity": {
        "name": "Equity",
        "code": "E",
        "weight": 0.10,  # 10% of total score
        "description": "Equal opportunities, support for disadvantaged groups, and inclusion"
    },
    "governance": {
        "name": "Governance Processes",
        "code": "GP",
        "weight": 0.10,  # 10% of total score
        "description": "Administrative efficiency, fund management, and policy implementation"
    },
    "teacher_education": {
        "name": "Teacher Education & Training",
        "code": "TE&T",
        "weight": 0.12,  # 12% of total score
        "description": "Teacher qualifications, professional development, and training effectiveness"
    }
}

# PGI Indicators with weights within each domain
# Weight represents the relative importance within the domain (sum = 1.0 per domain)
PGI_INDICATORS = {
    # Learning Outcomes Domain (30% total) - 12 indicators, each weight 20/240 = 0.0833
    "lo_language_class3": {
        "code": "LO-L3",
        "name": "Learning Outcome in Language in Class 3 -All Schools",
        "domain": "learning_outcomes",
        "weight": 0.0833,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 65.0,
        "formula": "percentage_achieving_grade_level_competency"
    },
    "lo_math_class3": {
        "code": "LO-M3",
        "name": "Learning Outcome in Mathematics in Class 3 -All Schools",
        "domain": "learning_outcomes",
        "weight": 0.0833,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 65.0,
        "formula": "percentage_achieving_grade_level_competency"
    },
    "lo_language_class5": {
        "code": "LO-L5",
        "name": "Learning Outcome in Language in Class 5 -All Schools",
        "domain": "learning_outcomes",
        "weight": 0.0833,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 65.0,
        "formula": "percentage_achieving_foundational_literacy"
    },
    "lo_math_class5": {
        "code": "LO-M5",
        "name": "Learning Outcome in Mathematics in Class 5 -All Schools",
        "domain": "learning_outcomes",
        "weight": 0.0833,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 65.0,
        "formula": "percentage_achieving_foundational_numeracy"
    },
    "lo_language_class8": {
        "code": "LO-L8",
        "name": "Learning Outcome in Language in Class 8 -All Schools",
        "domain": "learning_outcomes",
        "weight": 0.0833,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 70.0,
        "formula": "percentage_achieving_grade_level_competency"
    },
    "lo_math_class8": {
        "code": "LO-M8",
        "name": "Learning Outcome in Mathematics in Class 8 -All Schools",
        "domain": "learning_outcomes",
        "weight": 0.0833,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 70.0,
        "formula": "percentage_achieving_grade_level_competency"
    },
    "lo_science_class8": {
        "code": "LO-SC8",
        "name": "Learning Outcome in Science in Class 8 -All Schools",
        "domain": "learning_outcomes",
        "weight": 0.0833,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 70.0,
        "formula": "percentage_achieving_grade_level_competency"
    },
    "lo_social_class8": {
        "code": "LO-SS8",
        "name": "Learning Outcome in Social Science in Class 8 -All Schools",
        "domain": "learning_outcomes",
        "weight": 0.0833,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 70.0,
        "formula": "percentage_achieving_grade_level_competency"
    },
    "lo_language_class10": {
        "code": "LO-L10",
        "name": "Learning Outcome in Language in Class 10 -All Schools",
        "domain": "learning_outcomes",
        "weight": 0.0833,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 75.0,
        "formula": "percentage_of_students_scoring_above_60"
    },
    "lo_math_class10": {
        "code": "LO-M10",
        "name": "Learning Outcome in Mathematics in Class 10 -All Schools",
        "domain": "learning_outcomes",
        "weight": 0.0833,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 75.0,
        "formula": "percentage_of_students_scoring_above_60"
    },
    "lo_science_class10": {
        "code": "LO-SC10",
        "name": "Learning Outcome in Science in Class 10 -All Schools",
        "domain": "learning_outcomes",
        "weight": 0.0833,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 75.0,
        "formula": "percentage_of_students_scoring_above_60"
    },
    "lo_social_class10": {
        "code": "LO-SS10",
        "name": "Learning Outcome in Social Science in Class 10 -All Schools",
        "domain": "learning_outcomes",
        "weight": 0.0833,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 75.0,
        "formula": "percentage_of_students_scoring_above_60"
    },
    
    # Access Domain (15% total) - 8 indicators, each weight 10/80 = 0.125
    "adjusted_ner_secondary": {
        "code": "ACC-ANER-SEC",
        "name": "Adjusted NER at Secondary level (All Schools)",
        "domain": "access",
        "weight": 0.125,
        "levels": ["state", "district", "block"],
        "unit": "percentage",
        "target": 90.0,
        "formula": "adjusted_enrolled_students_age_group / total_population_age_group * 100"
    },
    "ner_higher_secondary": {
        "code": "ACC-NER-HS",
        "name": "NER at Higher Secondary level (11-12) (All Schools)",
        "domain": "access",
        "weight": 0.125,
        "levels": ["state", "district", "block"],
        "unit": "percentage",
        "target": 85.0,
        "formula": "enrolled_students_hs / total_population_hs_age * 100"
    },
    "retention_rate_primary": {
        "code": "ACC-RET-PRI",
        "name": "Retention rate at primary level (all schools)",
        "domain": "access",
        "weight": 0.125,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 95.0,
        "formula": "students_completing_primary / students_enrolled_grade1 * 100"
    },
    "retention_rate_upper_primary": {
        "code": "ACC-RET-UP",
        "name": "Retention rate at Upper primary level (All schools)",
        "domain": "access",
        "weight": 0.125,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 93.0,
        "formula": "students_completing_upper_primary / students_enrolled_grade6 * 100"
    },
    "retention_rate_secondary": {
        "code": "ACC-RET-SEC",
        "name": "Retention rate at secondary level (All schools)",
        "domain": "access",
        "weight": 0.125,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 90.0,
        "formula": "students_completing_secondary / students_enrolled_grade9 * 100"
    },
    "completion_rate_secondary": {
        "code": "ACC-COMP-SEC",
        "name": "Completion Rate -Secondary",
        "domain": "access",
        "weight": 0.125,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 85.0,
        "formula": "students_passed_grade10 / total_students_cohort * 100"
    },
    "completion_rate_higher_secondary": {
        "code": "ACC-COMP-HS",
        "name": "Completion Rate – Higher Secondary",
        "domain": "access",
        "weight": 0.125,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 80.0,
        "formula": "students_passed_grade12 / total_students_cohort_hs * 100"
    },
    "participation_rate_pre_primary": {
        "code": "ACC-PART-PP",
        "name": "Participation Rate in organized learning (One year before the official primary entry age)",
        "domain": "access",
        "weight": 0.125,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 85.0,
        "formula": "children_in_organized_learning / total_children_eligible_age * 100"
    },
    
    # Infrastructure & Facilities Domain (18% total) - 24 indicators, total weights = 180
    "inf_ict_lab": {
        "code": "INF-ICT",
        "name": "Percentage of schools having ICT lab- All Government and Government Aided Schools having classes Primary and above",
        "domain": "infrastructure",
        "weight": 0.0556,  # 10/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 85.0,
        "formula": "schools_with_ict_lab / govt_aided_schools_primary_above * 100"
    },
    "inf_smart_classes": {
        "code": "INF-SMART",
        "name": "Percentage of schools having Smart Classes - All Schools",
        "domain": "infrastructure",
        "weight": 0.0556,  # 10/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 60.0,
        "formula": "schools_with_smart_classes / total_schools * 100"
    },
    "inf_integrated_science_lab": {
        "code": "INF-ISCI",
        "name": "Percentage of schools having integrated Science lab facility up to Secondary level",
        "domain": "infrastructure",
        "weight": 0.0278,  # 5/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 85.0,
        "formula": "schools_with_integrated_science_lab / schools_upto_secondary * 100"
    },
    "inf_separate_science_lab_hs": {
        "code": "INF-SSCI",
        "name": "Percentage of schools having separate science lab facility for higher Secondary level",
        "domain": "infrastructure",
        "weight": 0.0278,  # 5/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 90.0,
        "formula": "schools_with_separate_science_lab / higher_secondary_schools * 100"
    },
    "inf_cocurricular_rooms": {
        "code": "INF-COCU",
        "name": "Percentage of schools having separate rooms for Co-Curricular activities/Arts and Crafts - All Schools having Secondary and Higher Secondary level",
        "domain": "infrastructure",
        "weight": 0.0278,  # 5/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 75.0,
        "formula": "schools_with_cocurricular_rooms / schools_secondary_hs * 100"
    },
    "inf_library_basic": {
        "code": "INF-LIBB",
        "name": "Percentage of schools having Library/Book Bank/Reading Corner - All Schools",
        "domain": "infrastructure",
        "weight": 0.0278,  # 5/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 95.0,
        "formula": "schools_with_library_basic / total_schools * 100"
    },
    "inf_library_separate_room": {
        "code": "INF-LIBR",
        "name": "Percentage of schools having separate room for library - All Schools",
        "domain": "infrastructure",
        "weight": 0.0278,  # 5/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 80.0,
        "formula": "schools_with_library_room / total_schools * 100"
    },
    "inf_prevocational_exposure": {
        "code": "INF-PVOC",
        "name": "Percentage of schools offering pre-vocational exposure at Upper Primary level",
        "domain": "infrastructure",
        "weight": 0.0278,  # 5/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 50.0,
        "formula": "schools_with_prevocational / schools_with_upper_primary * 100"
    },
    "inf_nsqf_vocational": {
        "code": "INF-NSQF",
        "name": "Percentage of Schools offering any vocational course under NSQF at Secondary and Higher Secondary level- Govt and Govt Aided Schools",
        "domain": "infrastructure",
        "weight": 0.0556,  # 10/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 40.0,
        "formula": "schools_with_nsqf_courses / govt_aided_secondary_hs * 100"
    },
    "inf_vocational_placement_class10": {
        "code": "INF-VP10",
        "name": "Percentage of students got placed after receiving vocational Education – Class 10",
        "domain": "infrastructure",
        "weight": 0.0278,  # 5/180
        "levels": ["state", "district", "block"],
        "unit": "percentage",
        "target": 60.0,
        "formula": "students_placed_class10 / vocational_students_class10 * 100"
    },
    "inf_vocational_placement_class12": {
        "code": "INF-VP12",
        "name": "Percentage of students who got placed after receiving vocational Education – Class 12",
        "domain": "infrastructure",
        "weight": 0.0278,  # 5/180
        "levels": ["state", "district", "block"],
        "unit": "percentage",
        "target": 65.0,
        "formula": "students_placed_class12 / vocational_students_class12 * 100"
    },
    "inf_vocational_selfemployed_class10": {
        "code": "INF-VSE10",
        "name": "Percentage of students self-employed after receiving vocational Education - Class 10",
        "domain": "infrastructure",
        "weight": 0.0278,  # 5/180
        "levels": ["state", "district", "block"],
        "unit": "percentage",
        "target": 25.0,
        "formula": "students_selfemployed_class10 / vocational_students_class10 * 100"
    },
    "inf_vocational_selfemployed_class12": {
        "code": "INF-VSE12",
        "name": "Percentage of students self-employed after receiving vocational Education - Class 12",
        "domain": "infrastructure",
        "weight": 0.0278,  # 5/180
        "levels": ["state", "district", "block"],
        "unit": "percentage",
        "target": 30.0,
        "formula": "students_selfemployed_class12 / vocational_students_class12 * 100"
    },
    "inf_midday_meal": {
        "code": "INF-MDM",
        "name": "Percentage of days midday meal served to children up to elementary level against total working days - Govt and aided elementary schools",
        "domain": "infrastructure",
        "weight": 0.0556,  # 10/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 95.0,
        "formula": "days_mdm_served / total_working_days * 100"
    },
    "inf_pm_poshan_audit": {
        "code": "INF-PMP",
        "name": "Percentage of Schools carried out social audit of PM-POSHAN Scheme - Government and Aided Schools",
        "domain": "infrastructure",
        "weight": 0.0556,  # 10/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 100.0,
        "formula": "schools_pm_poshan_audit / govt_aided_schools * 100"
    },
    "inf_health_checkup": {
        "code": "INF-HLTH",
        "name": "Percentage of schools carried out health check-up of all students during the last academic year",
        "domain": "infrastructure",
        "weight": 0.0556,  # 10/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 100.0,
        "formula": "schools_health_checkup / total_schools * 100"
    },
    "inf_sanitary_pad_vending": {
        "code": "INF-SPV",
        "name": "Percentage of Co-ed and girls' schools having Sanitary Pad vending Machine - For schools having Secondary and Higher Secondary Sections",
        "domain": "infrastructure",
        "weight": 0.0556,  # 10/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 90.0,
        "formula": "schools_sanitary_pad_vending / coed_girls_schools_secondary_hs * 100"
    },
    "inf_functional_incinerator": {
        "code": "INF-INC",
        "name": "Percentage of Co-ed and girls' schools having functional incinerator in girls' toilets - For schools having Secondary and Higher Secondary Sections",
        "domain": "infrastructure",
        "weight": 0.0556,  # 10/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 85.0,
        "formula": "schools_functional_incinerator / coed_girls_schools_secondary_hs * 100"
    },
    "inf_free_textbook": {
        "code": "INF-FTB",
        "name": "Percentage of Elementary Level students getting Free Textbook within one month of start of academic year - For Government and Aided Schools",
        "domain": "infrastructure",
        "weight": 0.0556,  # 10/180
        "levels": ["state", "district", "block"],
        "unit": "percentage",
        "target": 100.0,
        "formula": "students_free_textbook_month1 / elementary_students_govt_aided * 100"
    },
    "inf_balavatika": {
        "code": "INF-BALV",
        "name": "Percentage of schools where Balavatika is started in the Co-located Anganwadi/school- Government and Government Aided Schools",
        "domain": "infrastructure",
        "weight": 0.0556,  # 10/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 70.0,
        "formula": "schools_with_balavatika / govt_aided_schools * 100"
    },
    "inf_kitchen_garden": {
        "code": "INF-KG",
        "name": "Percentage of schools having Kitchen Garden - All Schools",
        "domain": "infrastructure",
        "weight": 0.0556,  # 10/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 80.0,
        "formula": "schools_with_kitchen_garden / total_schools * 100"
    },
    "inf_rainwater_harvesting": {
        "code": "INF-RWH",
        "name": "Percentage of schools having functional Rainwater harvesting facility – All Schools",
        "domain": "infrastructure",
        "weight": 0.0556,  # 10/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 75.0,
        "formula": "schools_with_rainwater_harvesting / total_schools * 100"
    },
    "inf_drinking_water": {
        "code": "INF-DW",
        "name": "Percentage of schools having functional drinking water facility – All Schools",
        "domain": "infrastructure",
        "weight": 0.0556,  # 10/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 100.0,
        "formula": "schools_with_drinking_water / total_schools * 100"
    },
    "inf_solar_panel": {
        "code": "INF-SOLAR",
        "name": "Percentage of schools having functional solar panel - All Schools",
        "domain": "infrastructure",
        "weight": 0.0556,  # 10/180
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 50.0,
        "formula": "schools_with_solar_panel / total_schools * 100"
    },
    
    # Equity Domain (10% total) - 44 indicators, total weights = 260
    # SC vs General - Language (Weight 5 each = 0.0192 normalized)
    "eq_sc_lang_class3": {
        "code": "EQ-SC-L3",
        "name": "Difference in student performance in Language between Scheduled Castes (SC) and General category in All Schools: Class 3",
        "domain": "equity",
        "weight": 0.0192,  # 5/260
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,  # Lower is better
        "formula": "abs(sc_language_performance - general_language_performance)"
    },
    "eq_sc_lang_class5": {
        "code": "EQ-SC-L5",
        "name": "Difference in student performance in Language between Scheduled Castes (SC) and General category in All Schools: Class 5",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(sc_language_performance - general_language_performance)"
    },
    "eq_sc_lang_class8": {
        "code": "EQ-SC-L8",
        "name": "Difference in student performance in Language between Scheduled Castes (SC) and General category in All Schools: Class 8",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(sc_language_performance - general_language_performance)"
    },
    "eq_sc_lang_class10": {
        "code": "EQ-SC-L10",
        "name": "Difference in student performance in Language between Scheduled Castes (SC) and General category in All Schools: Class 10",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(sc_language_performance - general_language_performance)"
    },
    # SC vs General - Mathematics (Weight 5 each = 0.0192 normalized)
    "eq_sc_math_class3": {
        "code": "EQ-SC-M3",
        "name": "Difference in student performance in Mathematics between Scheduled Castes (SC) and General category in All Schools: Class 3",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(sc_math_performance - general_math_performance)"
    },
    "eq_sc_math_class5": {
        "code": "EQ-SC-M5",
        "name": "Difference in student performance in Mathematics between Scheduled Castes (SC) and General category in All Schools: Class 5",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(sc_math_performance - general_math_performance)"
    },
    "eq_sc_math_class8": {
        "code": "EQ-SC-M8",
        "name": "Difference in student performance in Mathematics between Scheduled Castes (SC) and General category in All Schools: Class 8",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(sc_math_performance - general_math_performance)"
    },
    "eq_sc_math_class10": {
        "code": "EQ-SC-M10",
        "name": "Difference in student performance in Mathematics between Scheduled Castes (SC) and General category in All Schools: Class 10",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(sc_math_performance - general_math_performance)"
    },
    # ST vs General - Language (Weight 5 each = 0.0192 normalized)
    "eq_st_lang_class3": {
        "code": "EQ-ST-L3",
        "name": "Difference in student performance in Language between Scheduled Tribes (ST) and General category in All Schools: Class 3",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(st_language_performance - general_language_performance)"
    },
    "eq_st_lang_class5": {
        "code": "EQ-ST-L5",
        "name": "Difference in student performance in Language between Scheduled Tribes (ST) and General category in All Schools: Class 5",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(st_language_performance - general_language_performance)"
    },
    "eq_st_lang_class8": {
        "code": "EQ-ST-L8",
        "name": "Difference in student performance in Language between Scheduled Tribes (ST) and General category in All Schools: Class 8",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(st_language_performance - general_language_performance)"
    },
    "eq_st_lang_class10": {
        "code": "EQ-ST-L10",
        "name": "Difference in student performance in Language between Scheduled Tribes (ST) and General category in All Schools: Class 10",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(st_language_performance - general_language_performance)"
    },
    # ST vs General - Mathematics (Weight 5 each = 0.0192 normalized)
    "eq_st_math_class3": {
        "code": "EQ-ST-M3",
        "name": "Difference in student performance in Mathematics between Scheduled Tribes (ST) and General category in All Schools: Class 3",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(st_math_performance - general_math_performance)"
    },
    "eq_st_math_class5": {
        "code": "EQ-ST-M5",
        "name": "Difference in student performance in Mathematics between Scheduled Tribes (ST) and General category in All Schools: Class 5",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(st_math_performance - general_math_performance)"
    },
    "eq_st_math_class8": {
        "code": "EQ-ST-M8",
        "name": "Difference in student performance in Mathematics between Scheduled Tribes (ST) and General category in All Schools: Class 8",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(st_math_performance - general_math_performance)"
    },
    "eq_st_math_class10": {
        "code": "EQ-ST-M10",
        "name": "Difference in student performance in Mathematics between Scheduled Tribes (ST) and General category in All Schools: Class 10",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(st_math_performance - general_math_performance)"
    },
    # Urban vs Rural - Language (Weight 5 each = 0.0192 normalized)
    "eq_urban_rural_lang_class3": {
        "code": "EQ-UR-L3",
        "name": "Difference in student performance in Language between Urban and Rural areas in All Schools: Class 3",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district"],
        "unit": "percentage_point_difference",
        "target": 8.0,
        "formula": "abs(urban_language_performance - rural_language_performance)"
    },
    "eq_urban_rural_lang_class5": {
        "code": "EQ-UR-L5",
        "name": "Difference in student performance in Language between Urban and Rural areas in All Schools: Class 5",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district"],
        "unit": "percentage_point_difference",
        "target": 8.0,
        "formula": "abs(urban_language_performance - rural_language_performance)"
    },
    "eq_urban_rural_lang_class8": {
        "code": "EQ-UR-L8",
        "name": "Difference in student performance in Language between Urban and Rural areas in All Schools: Class 8",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district"],
        "unit": "percentage_point_difference",
        "target": 8.0,
        "formula": "abs(urban_language_performance - rural_language_performance)"
    },
    "eq_urban_rural_lang_class10": {
        "code": "EQ-UR-L10",
        "name": "Difference in student performance in Language between Urban and Rural areas in All Schools: Class 10",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district"],
        "unit": "percentage_point_difference",
        "target": 8.0,
        "formula": "abs(urban_language_performance - rural_language_performance)"
    },
    # Urban vs Rural - Mathematics (Weight 5 each = 0.0192 normalized)
    "eq_urban_rural_math_class3": {
        "code": "EQ-UR-M3",
        "name": "Difference in student performance in Mathematics between  Urban and Rural areas in All Schools: Class 3",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district"],
        "unit": "percentage_point_difference",
        "target": 8.0,
        "formula": "abs(urban_math_performance - rural_math_performance)"
    },
    "eq_urban_rural_math_class5": {
        "code": "EQ-UR-M5",
        "name": "Difference in student performance in Mathematics between Urban and Rural areas in All Schools: Class 5",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district"],
        "unit": "percentage_point_difference",
        "target": 8.0,
        "formula": "abs(urban_math_performance - rural_math_performance)"
    },
    "eq_urban_rural_math_class8": {
        "code": "EQ-UR-M8",
        "name": "Difference in student performance in Mathematics between Urban and Rural areas in All Schools: Class 8",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district"],
        "unit": "percentage_point_difference",
        "target": 8.0,
        "formula": "abs(urban_math_performance - rural_math_performance)"
    },
    "eq_urban_rural_math_class10": {
        "code": "EQ-UR-M10",
        "name": "Difference in student performance in Mathematics between Urban and Rural areas in All Schools: Class 10",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district"],
        "unit": "percentage_point_difference",
        "target": 8.0,
        "formula": "abs(urban_math_performance - rural_math_performance)"
    },
    # Boys vs Girls - Language (Weight 5 each = 0.0192 normalized)
    "eq_gender_lang_class3": {
        "code": "EQ-GEN-L3",
        "name": "Difference in student performance in Language between Boys and Girls in All Schools: Class 3",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 3.0,
        "formula": "abs(boys_language_performance - girls_language_performance)"
    },
    "eq_gender_lang_class5": {
        "code": "EQ-GEN-L5",
        "name": "Difference in student performance in Language between Boys and Girls in All Schools: Class 5",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 3.0,
        "formula": "abs(boys_language_performance - girls_language_performance)"
    },
    "eq_gender_lang_class8": {
        "code": "EQ-GEN-L8",
        "name": "Difference in student performance in Language between Boys and Girls in All Schools: Class 8",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 3.0,
        "formula": "abs(boys_language_performance - girls_language_performance)"
    },
    "eq_gender_lang_class10": {
        "code": "EQ-GEN-L10",
        "name": "Difference in student performance in Language between Boys and Girls in All Schools: Class 10",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 3.0,
        "formula": "abs(boys_language_performance - girls_language_performance)"
    },
    # Boys vs Girls - Mathematics (Weight 5 each = 0.0192 normalized)
    "eq_gender_math_class3": {
        "code": "EQ-GEN-M3",
        "name": "Difference in student performance in Mathematics between Boys and Girls in All Schools: Class 3",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 3.0,
        "formula": "abs(boys_math_performance - girls_math_performance)"
    },
    "eq_gender_math_class5": {
        "code": "EQ-GEN-M5",
        "name": "Difference in student performance in Mathematics between Boys and Girls in All Schools: Class 5",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 3.0,
        "formula": "abs(boys_math_performance - girls_math_performance)"
    },
    "eq_gender_math_class8": {
        "code": "EQ-GEN-M8",
        "name": "Difference in student performance in Mathematics between Boys and Girls in All Schools: Class 8",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 3.0,
        "formula": "abs(boys_math_performance - girls_math_performance)"
    },
    "eq_gender_math_class10": {
        "code": "EQ-GEN-M10",
        "name": "Difference in student performance in Mathematics between Boys and Girls in All Schools: Class 10",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 3.0,
        "formula": "abs(boys_math_performance - girls_math_performance)"
    },
    # Examination Result gaps (Weight 5 each = 0.0192 normalized)
    "eq_sc_exam_class10": {
        "code": "EQ-SC-EX10",
        "name": "Difference between SC's and General Category's Performance in Examination Result - Class 10",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(sc_exam_result - general_exam_result)"
    },
    "eq_st_exam_class10": {
        "code": "EQ-ST-EX10",
        "name": "Difference between ST's and General Category's Performance in Examination Result - Class 10",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(st_exam_result - general_exam_result)"
    },
    "eq_sc_exam_class12": {
        "code": "EQ-SC-EX12",
        "name": "Difference between SC's and General Category's Performance in Examination Result - Class 12",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(sc_exam_result - general_exam_result)"
    },
    "eq_st_exam_class12": {
        "code": "EQ-ST-EX12",
        "name": "Difference between ST's and General Category's Performance in Examination Result - Class 12",
        "domain": "equity",
        "weight": 0.0192,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 5.0,
        "formula": "abs(st_exam_result - general_exam_result)"
    },
    # Transition Rate gaps (Weight 10 each = 0.0385 normalized)
    "eq_gender_transition": {
        "code": "EQ-GEN-TR",
        "name": "Difference between boys and girls Transition Rate from Upper Primary to Secondary level",
        "domain": "equity",
        "weight": 0.0385,  # 10/260
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 2.0,
        "formula": "abs(boys_transition_rate - girls_transition_rate)"
    },
    "eq_minority_transition": {
        "code": "EQ-MIN-TR",
        "name": "Difference between Minorities and General Category Transition Rate from Upper Primary to Secondary level",
        "domain": "equity",
        "weight": 0.0385,
        "levels": ["state", "district", "block"],
        "unit": "percentage_point_difference",
        "target": 3.0,
        "formula": "abs(minority_transition_rate - general_transition_rate)"
    },
    # Facilities (Weight 10 each = 0.0385 normalized)
    "eq_cwsn_assistive_tech": {
        "code": "EQ-CWSN-AT",
        "name": "Percentage of schools having assistive tech-based solutions for CWSN - All Schools",
        "domain": "equity",
        "weight": 0.0385,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 80.0,
        "formula": "schools_with_cwsn_assistive_tech / total_schools * 100"
    },
    "eq_cwsn_aids_appliances": {
        "code": "EQ-CWSN-AA",
        "name": "Percentage of entitled CWSN receiving Aids and Appliances for Government and Aided schools",
        "domain": "equity",
        "weight": 0.0385,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 90.0,
        "formula": "cwsn_receiving_aids / entitled_cwsn * 100"
    },
    "eq_cwsn_ramp": {
        "code": "EQ-CWSN-RAMP",
        "name": "Percentage of schools having ramp for CWSN to access school building",
        "domain": "equity",
        "weight": 0.0385,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 95.0,
        "formula": "schools_with_cwsn_ramp / total_schools * 100"
    },
    "eq_cwsn_toilets": {
        "code": "EQ-CWSN-TOILET",
        "name": "Percentage of schools having functional CWSN friendly toilets",
        "domain": "equity",
        "weight": 0.0385,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 85.0,
        "formula": "schools_with_cwsn_toilets / total_schools * 100"
    },
    "eq_boys_toilets": {
        "code": "EQ-BOYS-TOILET",
        "name": "Percentage of Co-Ed and Boys schools having functional toilet -Boy's toilet",
        "domain": "equity",
        "weight": 0.0385,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 100.0,
        "formula": "coed_boys_schools_with_boys_toilet / coed_boys_schools * 100"
    },
    "eq_girls_toilets": {
        "code": "EQ-GIRLS-TOILET",
        "name": "Percentage of Co-Ed and Girls schools having functional toilet -Girl's toilet",
        "domain": "equity",
        "weight": 0.0385,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 100.0,
        "formula": "coed_girls_schools_with_girls_toilet / coed_girls_schools * 100"
    },
    
    # Governance Processes Domain (10% total) - 16 indicators, total weights = 130
    # Weight 5 indicators (0.0385 normalized)
    "gp_aadhar_seeding": {
        "code": "GP-AADHAR",
        "name": "% Of Students with Aadhar seeded information- All Schools",
        "domain": "governance",
        "weight": 0.0385,  # 5/130
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 100.0,
        "formula": "students_with_aadhar / total_students * 100"
    },
    "gp_student_attendance_digital": {
        "code": "GP-STATT",
        "name": "Percentage of schools having system to capture students' attendance digitally - For Government and Aided schools",
        "domain": "governance",
        "weight": 0.0385,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 90.0,
        "formula": "govt_aided_schools_digital_student_attendance / govt_aided_schools * 100"
    },
    "gp_teacher_attendance_digital": {
        "code": "GP-TCHATT",
        "name": "Percentage of schools having system to capture teachers' attendance digitally - For Government and Aided schools",
        "domain": "governance",
        "weight": 0.0385,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 90.0,
        "formula": "govt_aided_schools_digital_teacher_attendance / govt_aided_schools * 100"
    },
    "gp_head_teacher_primary": {
        "code": "GP-HT-PRI",
        "name": "Percentage of primary schools meeting head-teacher norms as per RTE",
        "domain": "governance",
        "weight": 0.0385,
        "levels": ["state", "district", "block"],
        "unit": "percentage",
        "target": 100.0,
        "formula": "primary_schools_meeting_ht_norms / primary_schools * 100"
    },
    "gp_head_teacher_upper_primary": {
        "code": "GP-HT-UP",
        "name": "Percentage of schools meeting head-teacher norms for Upper Primary level as per RTE",
        "domain": "governance",
        "weight": 0.0385,
        "levels": ["state", "district", "block"],
        "unit": "percentage",
        "target": 100.0,
        "formula": "upper_primary_schools_meeting_ht_norms / upper_primary_schools * 100"
    },
    "gp_vidyanjali_portal": {
        "code": "GP-VID",
        "name": "Percentage of schools who have received assistance through Vidyanjali Portal - Government and Aided Schools",
        "domain": "governance",
        "weight": 0.0385,
        "levels": ["state", "district", "block"],
        "unit": "percentage",
        "target": 50.0,
        "formula": "govt_aided_schools_vidyanjali / govt_aided_schools * 100"
    },
    # Weight 10 indicators (0.0769 normalized)
    "gp_anganwadi_colocated": {
        "code": "GP-ANGW",
        "name": "Percentage of Anganwadi Centre (s) co-located in the school Premises - Government and Government Aided Schools",
        "domain": "governance",
        "weight": 0.0769,  # 10/130
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 70.0,
        "formula": "schools_with_colocated_anganwadi / govt_aided_schools * 100"
    },
    "gp_ptr_primary": {
        "code": "GP-PTR",
        "name": "Percentage of schools having PTR as per RTE norm at primary level",
        "domain": "governance",
        "weight": 0.0769,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 85.0,
        "formula": "primary_schools_with_ptr_rte / primary_schools * 100"
    },
    "gp_principals_secondary": {
        "code": "GP-PRIN",
        "name": "Percentage of Secondary Schools having Principals/Head masters in position",
        "domain": "governance",
        "weight": 0.0769,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 100.0,
        "formula": "secondary_schools_with_principals / secondary_schools * 100"
    },
    "gp_central_fund_release_recurring": {
        "code": "GP-CFR-REC",
        "name": "Average no of days taken by States/UTs to release Central share of fund on Elementary education/Secondary education/Teacher's education - Recurring",
        "domain": "governance",
        "weight": 0.0769,
        "levels": ["state"],
        "unit": "days",
        "target": 15.0,  # Lower is better
        "formula": "avg_days_central_fund_release_recurring"
    },
    "gp_central_fund_release_nonrecurring": {
        "code": "GP-CFR-NREC",
        "name": "Average no of days taken by States/UTs to release Central share of fund on Elementary education/Secondary education/Teacher's education- non-Recurring",
        "domain": "governance",
        "weight": 0.0769,
        "levels": ["state"],
        "unit": "days",
        "target": 20.0,  # Lower is better
        "formula": "avg_days_central_fund_release_nonrecurring"
    },
    "gp_cyber_safety": {
        "code": "GP-CYBER",
        "name": "Percentage of children receiving orientation on cyber safety to students - All Schools",
        "domain": "governance",
        "weight": 0.0769,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 85.0,
        "formula": "students_cyber_safety_orientation / total_students * 100"
    },
    "gp_internet_pedagogical": {
        "code": "GP-INET",
        "name": "Percentage of schools having internet used for pedagogical purposes - All Schools",
        "domain": "governance",
        "weight": 0.0769,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 75.0,
        "formula": "schools_internet_pedagogical / total_schools * 100"
    },
    "gp_state_fund_release": {
        "code": "GP-SFR",
        "name": "Average no of days taken by States/UTs to release State share of fund on Elementary education/Secondary education/Teacher's education",
        "domain": "governance",
        "weight": 0.0769,
        "levels": ["state"],
        "unit": "days",
        "target": 15.0,  # Lower is better
        "formula": "avg_days_state_fund_release"
    },
    "gp_oosc_identified": {
        "code": "GP-OOSC-ID",
        "name": "Percentage of Out of School Children (OoSC) identified as per PRABANDH Portal",
        "domain": "governance",
        "weight": 0.0769,
        "levels": ["state", "district", "block"],
        "unit": "percentage",
        "target": 100.0,
        "formula": "oosc_identified / estimated_oosc * 100"
    },
    "gp_oosc_mainstreamed": {
        "code": "GP-OOSC-MS",
        "name": "Percentage of OoSC mainstreamed as per PRABANDH Portal",
        "domain": "governance",
        "weight": 0.0769,
        "levels": ["state", "district", "block"],
        "unit": "percentage",
        "target": 80.0,
        "formula": "oosc_mainstreamed / oosc_identified * 100"
    },
    
    # Teacher Education & Training Domain (12% total) - 8 indicators, total weights = 100
    # Weight 10 indicators (0.10 normalized)
    "tet_trained_cwsn_teachers": {
        "code": "TET-CWSN",
        "name": "Percentage of schools having trained teachers for teaching CWSN",
        "domain": "teacher_education",
        "weight": 0.10,  # 10/100
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 85.0,
        "formula": "schools_with_cwsn_trained_teachers / total_schools * 100"
    },
    "tet_career_counselling": {
        "code": "TET-CAREER",
        "name": "Percentage of schools where teachers are providing career counselling and guidance to children - Government Schools",
        "domain": "teacher_education",
        "weight": 0.10,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 80.0,
        "formula": "govt_schools_with_career_counselling / govt_schools * 100"
    },
    # Weight 5 indicator (0.05 normalized)
    "tet_teacher_aadhar": {
        "code": "TET-AADHAR",
        "name": "Percentage of teachers whose Aadhar/Unique ID is seeded in electronic database - Government and Government Aided Schools",
        "domain": "teacher_education",
        "weight": 0.05,  # 5/100
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 100.0,
        "formula": "teachers_with_aadhar / total_teachers_govt_aided * 100"
    },
    # Weight 15 indicators (0.15 normalized each)
    "tet_qualified_preprimary": {
        "code": "TET-QUAL-PP",
        "name": "Proportion of teachers with minimal professional qualifications -Pre-Primary",
        "domain": "teacher_education",
        "weight": 0.15,  # 15/100
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 95.0,
        "formula": "qualified_preprimary_teachers / total_preprimary_teachers * 100"
    },
    "tet_qualified_primary": {
        "code": "TET-QUAL-PRI",
        "name": "Proportion of teachers with minimal professional qualifications -Primary",
        "domain": "teacher_education",
        "weight": 0.15,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 100.0,
        "formula": "qualified_primary_teachers / total_primary_teachers * 100"
    },
    "tet_qualified_upper_primary": {
        "code": "TET-QUAL-UP",
        "name": "Proportion of teachers with minimal professional qualifications – Upper Primary",
        "domain": "teacher_education",
        "weight": 0.15,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 100.0,
        "formula": "qualified_upper_primary_teachers / total_upper_primary_teachers * 100"
    },
    "tet_qualified_secondary": {
        "code": "TET-QUAL-SEC",
        "name": "Proportion of teachers with minimal professional qualifications -Secondary",
        "domain": "teacher_education",
        "weight": 0.15,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 100.0,
        "formula": "qualified_secondary_teachers / total_secondary_teachers * 100"
    },
    "tet_qualified_higher_secondary": {
        "code": "TET-QUAL-HS",
        "name": "Proportion of teachers with minimal professional qualifications – Higher Secondary",
        "domain": "teacher_education",
        "weight": 0.15,
        "levels": ["state", "district", "block", "school"],
        "unit": "percentage",
        "target": 100.0,
        "formula": "qualified_higher_secondary_teachers / total_higher_secondary_teachers * 100"
    }
}

def get_indicators_for_domain(domain_key):
    """Get all indicators belonging to a specific domain"""
    return {
        indicator_key: indicator_data 
        for indicator_key, indicator_data in PGI_INDICATORS.items() 
        if indicator_data["domain"] == domain_key
    }

def get_indicators_for_level(level):
    """Get all indicators applicable to a specific level (state/district/block/school)"""
    return {
        indicator_key: indicator_data 
        for indicator_key, indicator_data in PGI_INDICATORS.items() 
        if level in indicator_data["levels"]
    }

def calculate_domain_score(domain_key, indicator_scores, max_score=1000):
    """
    Calculate domain score based on indicator scores
    
    Args:
        domain_key: Domain identifier
        indicator_scores: Dict of {indicator_key: achieved_percentage}
        max_score: Total PGI score (default 1000)
    
    Returns:
        Domain score contribution to total PGI
    """
    domain = PGI_DOMAINS[domain_key]
    domain_indicators = get_indicators_for_domain(domain_key)
    
    if not domain_indicators:
        return 0.0
    
    # Calculate weighted average of indicators within domain
    total_indicator_weight = sum(ind["weight"] for ind in domain_indicators.values())
    weighted_achievement = 0.0
    
    for indicator_key, indicator_data in domain_indicators.items():
        if indicator_key in indicator_scores:
            # For "lower is better" indicators, invert the score
            achieved = indicator_scores[indicator_key]
            if indicator_data.get("unit") in ["percentage_point_difference", "days"]:
                # Lower is better - convert to percentage achieved
                target = indicator_data["target"]
                if achieved <= target:
                    achievement_pct = 100.0
                else:
                    # Penalize based on how far from target
                    achievement_pct = max(0, 100 - ((achieved - target) / target * 100))
            else:
                # Higher is better - percentage already
                achievement_pct = achieved
            
            # Weight within domain
            indicator_weight_normalized = indicator_data["weight"] / total_indicator_weight
            weighted_achievement += achievement_pct * indicator_weight_normalized
    
    # Apply domain weight to get contribution to total score
    domain_contribution = (weighted_achievement / 100) * domain["weight"] * max_score
    
    return domain_contribution

def calculate_total_pgi_score(all_indicator_scores, max_score=1000):
    """
    Calculate total PGI score from all indicator scores
    
    Args:
        all_indicator_scores: Dict of {indicator_key: achieved_percentage}
        max_score: Total PGI score (default 1000)
    
    Returns:
        Dict with total score and domain-wise breakdown
    """
    domain_scores = {}
    total_score = 0.0
    
    for domain_key, domain_data in PGI_DOMAINS.items():
        domain_score = calculate_domain_score(domain_key, all_indicator_scores, max_score)
        domain_scores[domain_key] = {
            "name": domain_data["name"],
            "code": domain_data["code"],
            "weight": domain_data["weight"],
            "score": round(domain_score, 2),
            "max_score": round(domain_data["weight"] * max_score, 2),
            "percentage": round((domain_score / (domain_data["weight"] * max_score) * 100), 2) if domain_data["weight"] > 0 else 0
        }
        total_score += domain_score
    
    return {
        "total_score": round(total_score, 2),
        "max_score": max_score,
        "percentage": round((total_score / max_score) * 100, 2),
        "domain_breakdown": domain_scores
    }
