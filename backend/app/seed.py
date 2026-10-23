import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.pipeline_stage import PipelineStage
from app.models.lead import Lead
from app.models.follow_up import FollowUp
from app.models.activity import Activity
from app.services.auth_service import get_password_hash


DEFAULT_STAGES = [
    {"id": "New", "label": "New", "display_order": 1, "color": "#64748b", "terminal_outcome": None},
    {"id": "Contacted", "label": "Contacted", "display_order": 2, "color": "#0284c7", "terminal_outcome": None},
    {"id": "Qualified", "label": "Qualified", "display_order": 3, "color": "#3b82f6", "terminal_outcome": None},
    {"id": "Meeting", "label": "Meeting", "display_order": 4, "color": "#8b5cf6", "terminal_outcome": None},
    {"id": "Proposal", "label": "Proposal", "display_order": 5, "color": "#f59e0b", "terminal_outcome": None},
    {"id": "Negotiation", "label": "Negotiation", "display_order": 6, "color": "#ec4899", "terminal_outcome": None},
    {"id": "Won", "label": "Won", "display_order": 7, "color": "#10b981", "terminal_outcome": "WON"},
    {"id": "Lost", "label": "Lost", "display_order": 8, "color": "#ef4444", "terminal_outcome": "LOST"},
]

DEFAULT_USERS = [
    {"full_name": "CRM Administrator", "email": "admin@belvo.com", "password": "Admin@12345", "role": "ADMIN"},
    {"full_name": "Pavan Kumar", "email": "pavan@belvo.com", "password": "Pavan@12345", "role": "EMPLOYEE"},
    {"full_name": "Carlos Mendes", "email": "carlos@belvo.com", "password": "Carlos@12345", "role": "EMPLOYEE"},
    {"full_name": "Mariana Silva", "email": "mariana@belvo.com", "password": "Mariana@12345", "role": "EMPLOYEE"},
    {"full_name": "Alex Rivera", "email": "alex@belvo.com", "password": "Alex@12345", "role": "EMPLOYEE"},
]

INITIAL_LEADS_DATA = [
    {
        "id": "LEAD-101",
        "full_name": "Rodrigo Sanchez",
        "company": "Nubank Brasil",
        "email": "rodrigo.sanchez@nubank.com",
        "phone": "+55 11 98765-4321",
        "lead_source": "Referral",
        "lead_category": "Enterprise Banking",
        "priority": "High",
        "pipeline_stage": "Negotiation",
        "assigned_employee": "Pavan Kumar",
        "expected_value": 85000.0,
        "notes": "Evaluating Open Finance data aggregation API for 2M+ active credit card users. Final security review in progress.",
        "created_date": "2026-09-12",
        "next_follow_up_date": "2026-10-14",
        "website": "https://nubank.com.br",
        "location": "São Paulo, Brazil",
        "ai_score": 92,
        "ai_summary": "High buying intent with executive sponsorship. Decision cycle near completion."
    },
    {
        "id": "LEAD-102",
        "full_name": "Camila Delgado",
        "company": "Clara Cards",
        "email": "camila.delgado@clara.com",
        "phone": "+52 55 4123-8900",
        "lead_source": "LinkedIn",
        "lead_category": "Corporate Fintech",
        "priority": "High",
        "pipeline_stage": "Proposal",
        "assigned_employee": "Carlos Mendes",
        "expected_value": 62000.0,
        "notes": "Sent enterprise proposal for automated fiscal receipt validation & bank statement enrichment. Awaiting CFO signoff.",
        "created_date": "2026-09-18",
        "next_follow_up_date": "2026-10-12",
        "website": "https://clara.com",
        "location": "Mexico City, Mexico",
        "ai_score": 88,
        "ai_summary": "Strong technical fit with corporate expense management roadmap."
    },
    {
        "id": "LEAD-103",
        "full_name": "Mateo Gutierrez",
        "company": "Kavak Auto",
        "email": "mateo.gutierrez@kavak.com",
        "phone": "+52 55 9988-7766",
        "lead_source": "Website",
        "lead_category": "Auto Financing",
        "priority": "Medium",
        "pipeline_stage": "Meeting",
        "assigned_employee": "Pavan Kumar",
        "expected_value": 45000.0,
        "notes": "Discovery call completed. Technical deep-dive scheduled with their underwriting risk team next Tuesday.",
        "created_date": "2026-09-25",
        "next_follow_up_date": "2026-10-10",
        "website": "https://kavak.com",
        "location": "Mexico City, Mexico",
        "ai_score": 74,
        "ai_summary": "Interested in instant income verification to shorten car loan approval time."
    },
    {
        "id": "LEAD-104",
        "full_name": "Lucia Morales",
        "company": "Mercado Pago",
        "email": "lucia.morales@mercadolibre.com",
        "phone": "+54 11 4455-6677",
        "lead_source": "Partner",
        "lead_category": "Payment Gateway",
        "priority": "High",
        "pipeline_stage": "Won",
        "assigned_employee": "Carlos Mendes",
        "expected_value": 120000.0,
        "notes": "Contract signed for multi-country payment initiation API. Onboarding engineering squad kick-off next Monday.",
        "created_date": "2026-08-10",
        "next_follow_up_date": "2026-10-20",
        "website": "https://mercadopago.com",
        "location": "Buenos Aires, Argentina",
        "ai_score": 98,
        "ai_summary": "Closed deal. High potential for annual account expansion across LatAm."
    },
    {
        "id": "LEAD-105",
        "full_name": "Fernando Ortiz",
        "company": "Clip Payments",
        "email": "fernando.ortiz@clip.mx",
        "phone": "+52 55 3322-1144",
        "lead_source": "Inbound",
        "lead_category": "Merchant Solutions",
        "priority": "Medium",
        "pipeline_stage": "Qualified",
        "assigned_employee": "Mariana Silva",
        "expected_value": 38000.0,
        "notes": "Qualified on budget and authority. Looking to replace legacy manual bank account validation for merchants.",
        "created_date": "2026-10-01",
        "next_follow_up_date": "2026-10-11",
        "website": "https://clip.mx",
        "location": "Mexico City, Mexico",
        "ai_score": 81,
        "ai_summary": "High transaction volume merchant base ready for automated verification."
    },
    {
        "id": "LEAD-106",
        "full_name": "Sofia Alvares",
        "company": "Rappi Pay",
        "email": "sofia.alvares@rappi.com",
        "phone": "+57 1 7890-1234",
        "lead_source": "Outbound",
        "lead_category": "SuperApp / Digital Wallet",
        "priority": "High",
        "pipeline_stage": "Contacted",
        "assigned_employee": "Pavan Kumar",
        "expected_value": 75000.0,
        "notes": "Initial outreach connected. Sent overview presentation and requested an intro with Head of Product.",
        "created_date": "2026-10-04",
        "next_follow_up_date": "2026-10-09",
        "website": "https://rappi.com",
        "location": "Bogotá, Colombia",
        "ai_score": 68,
        "ai_summary": "Exploration phase. Receptive to LatAm cross-border account aggregation."
    },
    {
        "id": "LEAD-107",
        "full_name": "Esteban Rios",
        "company": "Bitso Crypto",
        "email": "esteban.rios@bitso.com",
        "phone": "+52 55 7711-2233",
        "lead_source": "Event",
        "lead_category": "Crypto Exchange",
        "priority": "Low",
        "pipeline_stage": "New",
        "assigned_employee": "Mariana Silva",
        "expected_value": 24000.0,
        "notes": "Met at FinTech Summit Mexico. Inquired about Open Banking rail integration for instant fiat deposits.",
        "created_date": "2026-10-07",
        "next_follow_up_date": "2026-10-15",
        "website": "https://bitso.com",
        "location": "Mexico City, Mexico",
        "ai_score": 55,
        "ai_summary": "Early discovery stage. Requires product demo regarding regulatory compliance."
    },
    {
        "id": "LEAD-108",
        "full_name": "Valeria Mendoza",
        "company": "Konfio SME Credit",
        "email": "valeria.mendoza@konfio.mx",
        "phone": "+52 55 5544-3322",
        "lead_source": "Referral",
        "lead_category": "SME Lending",
        "priority": "High",
        "pipeline_stage": "Negotiation",
        "assigned_employee": "Carlos Mendes",
        "expected_value": 54000.0,
        "notes": "MSA with legal department. Pricing tier agreed on monthly active connections volume.",
        "created_date": "2026-09-05",
        "next_follow_up_date": "2026-10-13",
        "website": "https://konfio.mx",
        "location": "Guadalajara, Mexico",
        "ai_score": 91,
        "ai_summary": "Negotiating SLA terms. 85% probability of closing this month."
    },
    {
        "id": "LEAD-109",
        "full_name": "Gabriel Costa",
        "company": "Uala Fintech",
        "email": "gabriel.costa@uala.com.ar",
        "phone": "+54 11 8877-6655",
        "lead_source": "Website",
        "lead_category": "Neobank",
        "priority": "Medium",
        "pipeline_stage": "Lost",
        "assigned_employee": "Mariana Silva",
        "expected_value": 32000.0,
        "notes": "Selected local in-house build for current quarter. Re-evaluate relationship in Q2 2027.",
        "created_date": "2026-08-15",
        "next_follow_up_date": "2026-12-01",
        "website": "https://uala.com.ar",
        "location": "Buenos Aires, Argentina",
        "ai_score": 30,
        "ai_summary": "Deal lost due to internal engineering allocation. Keep on nurture sequence."
    },
    {
        "id": "LEAD-110",
        "full_name": "Daniela Paredes",
        "company": "Albo Banking",
        "email": "daniela.paredes@albo.mx",
        "phone": "+52 55 1290-3456",
        "lead_source": "Inbound",
        "lead_category": "Digital Banking",
        "priority": "Medium",
        "pipeline_stage": "Qualified",
        "assigned_employee": "Pavan Kumar",
        "expected_value": 41000.0,
        "notes": "Passed initial compliance checklist. Wants sample sandbox access for developer team testing.",
        "created_date": "2026-09-29",
        "next_follow_up_date": "2026-10-16",
        "website": "https://albo.mx",
        "location": "Mexico City, Mexico",
        "ai_score": 78,
        "ai_summary": "Sandbox testing underway. Positive developer feedback on Belvo documentation."
    }
]

INITIAL_FOLLOW_UPS_DATA = [
    {
        "id": "FU-201",
        "lead_id": "LEAD-106",
        "lead_name": "Sofia Alvares",
        "company": "Rappi Pay",
        "title": "Follow-up on product deck & intro call",
        "type": "Call",
        "due_date": "2026-10-09",
        "due_time": "11:00",
        "priority": "High",
        "status": "Overdue",
        "assigned_employee": "Pavan Kumar",
        "notes": "Check if Head of Product received the Belvo API LatAm benchmark document."
    },
    {
        "id": "FU-202",
        "lead_id": "LEAD-103",
        "lead_name": "Mateo Gutierrez",
        "company": "Kavak Auto",
        "title": "Risk team underwriting sync prep",
        "type": "Meeting",
        "due_date": "2026-10-10",
        "due_time": "15:30",
        "priority": "High",
        "status": "Pending",
        "assigned_employee": "Pavan Kumar",
        "notes": "Prepare sandbox demo for bank transaction aggregation and payroll parsing."
    },
    {
        "id": "FU-203",
        "lead_id": "LEAD-105",
        "lead_name": "Fernando Ortiz",
        "company": "Clip Payments",
        "title": "Send sandbox API credentials & guide",
        "type": "Email",
        "due_date": "2026-10-11",
        "due_time": "10:00",
        "priority": "Medium",
        "status": "Pending",
        "assigned_employee": "Mariana Silva",
        "notes": "Include Postman collection for Mexican SPEI verification endpoints."
    },
    {
        "id": "FU-204",
        "lead_id": "LEAD-102",
        "lead_name": "Camila Delgado",
        "company": "Clara Cards",
        "title": "Proposal review with CFO",
        "type": "Meeting",
        "due_date": "2026-10-12",
        "due_time": "16:00",
        "priority": "High",
        "status": "Pending",
        "assigned_employee": "Carlos Mendes",
        "notes": "Address queries regarding volume pricing tiers and data encryption SLAs."
    },
    {
        "id": "FU-205",
        "lead_id": "LEAD-108",
        "lead_name": "Valeria Mendoza",
        "company": "Konfio SME Credit",
        "title": "Check MSA redlines with legal",
        "type": "Task",
        "due_date": "2026-10-13",
        "due_time": "14:00",
        "priority": "Medium",
        "status": "Pending",
        "assigned_employee": "Carlos Mendes",
        "notes": "Ensure mutual indemnification clause is acceptable to Belvo counsel."
    },
    {
        "id": "FU-206",
        "lead_id": "LEAD-101",
        "lead_name": "Rodrigo Sanchez",
        "company": "Nubank Brasil",
        "title": "Final security architecture signoff",
        "type": "Call",
        "due_date": "2026-10-14",
        "due_time": "11:00",
        "priority": "High",
        "status": "Pending",
        "assigned_employee": "Pavan Kumar",
        "notes": "Confirm ISO 27001 / SOC2 audit reports and Brazilian LGPD compliance documentation."
    },
    {
        "id": "FU-207",
        "lead_id": "LEAD-104",
        "lead_name": "Lucia Morales",
        "company": "Mercado Pago",
        "title": "Post-contract engineering onboarding",
        "type": "Meeting",
        "due_date": "2026-10-08",
        "due_time": "09:00",
        "priority": "High",
        "status": "Completed",
        "assigned_employee": "Carlos Mendes",
        "notes": "Introduced solution architect and shared dedicated Slack channel invite."
    }
]

INITIAL_ACTIVITIES_DATA = [
    {
        "id": "ACT-301",
        "lead_id": "LEAD-104",
        "lead_name": "Lucia Morales",
        "company": "Mercado Pago",
        "type": "stage_change",
        "description": "Moved deal from Proposal to Won ($120,000)",
        "timestamp": "2026-10-08 17:30",
        "performed_by": "Carlos Mendes"
    },
    {
        "id": "ACT-302",
        "lead_id": "LEAD-101",
        "lead_name": "Rodrigo Sanchez",
        "company": "Nubank Brasil",
        "type": "note",
        "description": "Updated enterprise pricing parameters for Brazil Open Finance integration.",
        "timestamp": "2026-10-08 14:15",
        "performed_by": "Pavan Kumar"
    },
    {
        "id": "ACT-303",
        "lead_id": "LEAD-107",
        "lead_name": "Esteban Rios",
        "company": "Bitso Crypto",
        "type": "lead_created",
        "description": "New lead added from FinTech Summit Mexico event.",
        "timestamp": "2026-10-07 11:20",
        "performed_by": "Mariana Silva"
    },
    {
        "id": "ACT-304",
        "lead_id": "LEAD-106",
        "lead_name": "Sofia Alvares",
        "company": "Rappi Pay",
        "type": "email",
        "description": "Sent LatAm API case study and scheduled discovery outreach.",
        "timestamp": "2026-10-06 16:45",
        "performed_by": "Pavan Kumar"
    },
    {
        "id": "ACT-305",
        "lead_id": "LEAD-102",
        "lead_name": "Camila Delgado",
        "company": "Clara Cards",
        "type": "stage_change",
        "description": "Moved deal from Meeting to Proposal ($62,000)",
        "timestamp": "2026-10-05 10:00",
        "performed_by": "Carlos Mendes"
    }
]


def seed_database(db: Session, force: bool = False, seed_demo: bool = False):
    from app.config import settings
    if settings.ENVIRONMENT.lower() == "production" and not force:
        print("[SEED] Production environment detected. Skipping automatic demo data seed.")
        return

    print("[SEED] Initializing Belvo CRM system metadata (stages & user accounts)...")

    # 1. Pipeline Stages
    for s_data in DEFAULT_STAGES:
        existing_stage = db.query(PipelineStage).filter(PipelineStage.id == s_data["id"]).first()
        if not existing_stage:
            db.add(PipelineStage(**s_data))
    db.commit()

    # 2. Users
    for u_data in DEFAULT_USERS:
        existing_user = db.query(User).filter(User.email == u_data["email"]).first()
        if not existing_user:
            user = User(
                full_name=u_data["full_name"],
                email=u_data["email"],
                password_hash=get_password_hash(u_data["password"]),
                role=u_data["role"],
                is_active=True
            )
            db.add(user)
    db.commit()

    # 3. Only seed synthetic demo data if explicitly requested (e.g. test fixtures)
    if seed_demo or force:
        for l_data in INITIAL_LEADS_DATA:
            existing_lead = db.query(Lead).filter(Lead.id == l_data["id"]).first()
            if not existing_lead:
                db.add(Lead(**l_data, is_archived=False))
        db.commit()

        for fu_data in INITIAL_FOLLOW_UPS_DATA:
            existing_fu = db.query(FollowUp).filter(FollowUp.id == fu_data["id"]).first()
            if not existing_fu:
                db.add(FollowUp(**fu_data))
        db.commit()

        for act_data in INITIAL_ACTIVITIES_DATA:
            existing_act = db.query(Activity).filter(Activity.id == act_data["id"]).first()
            if not existing_act:
                db.add(Activity(**act_data))
        db.commit()
        print("[OK] Demo records seeded.")
    else:
        print("[OK] Belvo CRM ready with ZERO default data.")


def provision_admin(db: Session, email: str, password: str, full_name: str = "System Admin"):
    """Dedicated, secure CLI function for provisioning production administrators."""
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        print(f"[PROVISION] User with email {email} already exists.")
        return existing_user

    user = User(
        full_name=full_name,
        email=email,
        password_hash=get_password_hash(password),
        role="ADMIN",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"[PROVISION] Administrator account successfully created: {email}")
    return user


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Belvo CRM Seed & Admin Provisioning")
    parser.add_argument("--provision-admin", action="store_true", help="Provision a production administrator account")
    parser.add_argument("--email", type=str, help="Admin email")
    parser.add_argument("--password", type=str, help="Admin password")
    parser.add_argument("--name", type=str, default="System Admin", help="Admin full name")
    parser.add_argument("--force-seed", action="store_true", help="Force synthetic demo seeding")
    args = parser.parse_args()

    session = SessionLocal()
    try:
        if args.provision_admin:
            if not args.email or not args.password:
                print("Error: --email and --password are required when using --provision-admin")
                sys.exit(1)
            provision_admin(session, email=args.email, password=args.password, full_name=args.name)
        else:
            seed_database(session, force=args.force_seed)
    finally:
        session.close()
