import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_pdf():
    output_filename = "Team_Collaboration_Guide.pdf"
    artifact_path = r"C:\Users\harsh\.gemini\antigravity\brain\e54ac7f2-b81a-463e-a84c-baa4226e7d1e\Team_Collaboration_Guide.pdf"
    workspace_path = os.path.abspath(output_filename)

    doc = SimpleDocTemplate(
        workspace_path,
        pagesize=letter,
        rightMargin=0.5*inch,
        leftMargin=0.5*inch,
        topMargin=0.5*inch,
        bottomMargin=0.5*inch
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0d9488'),
        spaceAfter=12
    )

    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1e3a8a'),
        spaceBefore=12,
        spaceAfter=6
    )

    h3_style = ParagraphStyle(
        'SubSectionHeader',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
    )

    code_style = ParagraphStyle(
        'CodeBlock',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#0f172a'),
        backColor=colors.HexColor('#f1f5f9'),
        borderColor=colors.HexColor('#cbd5e1'),
        borderWidth=0.5,
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=6,
        borderRadius=4
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#1e293b')
    )

    story = []

    # Title & Header
    story.append(Paragraph("Team Collaboration & Integration Guide", title_style))
    story.append(Paragraph("Insurance Policy & Claims Management System | Architecture & Workflow", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0d9488'), spaceAfter=10))

    # Section 1
    story.append(Paragraph("1. Project Architecture & Tech Stack", h2_style))
    story.append(Paragraph("<b>Backend:</b> Python 3.12, FastAPI, Uvicorn, SQLAlchemy ORM, SQLite (insurance.db), Pydantic v2, PyJWT, Bcrypt.", body_style))
    story.append(Paragraph("<b>Frontend:</b> ReactJS 18, Material UI (MUI v5), Recharts, Axios, React Router v6, Vite.", body_style))
    story.append(Paragraph("<b>Repository:</b> https://github.com/harshithcheripally16-ui/Insurance-Policy-Claims-Management.git", body_style))

    # Section 2: Module Assignments Table
    story.append(Paragraph("2. Module Assignments & Responsibilities", h2_style))
    module_data = [
        [Paragraph("Module", table_header_style), Paragraph("Role", table_header_style), Paragraph("Key Features & Pages", table_header_style), Paragraph("Status", table_header_style)],
        [Paragraph("<b>Insurance Agent</b>", table_cell_style), Paragraph("Agent", table_cell_style), Paragraph("Agent Portfolio, Sales (₹), Client Policies, Customer Directory", table_cell_style), Paragraph("<font color='#166534'><b>Completed (main)</b></font>", table_cell_style)],
        [Paragraph("<b>Customer Module</b>", table_cell_style), Paragraph("Customer", table_cell_style), Paragraph("Browse Policy Catalog, Purchase Plans, Submit Claims & Track Reviews", table_cell_style), Paragraph("<font color='#1e40af'><b>Open for Integration</b></font>", table_cell_style)],
        [Paragraph("<b>Claims Officer</b>", table_cell_style), Paragraph("Claims Officer", table_cell_style), Paragraph("Review Workbench, Risk Score Engine (0-100), Document Verification", table_cell_style), Paragraph("<font color='#1e40af'><b>Open for Integration</b></font>", table_cell_style)],
        [Paragraph("<b>Admin Module</b>", table_cell_style), Paragraph("System Admin", table_cell_style), Paragraph("Master Financial Analytics, User Directory, Policy Catalog Creation", table_cell_style), Paragraph("<font color='#1e40af'><b>Open for Integration</b></font>", table_cell_style)],
    ]
    t1 = Table(module_data, colWidths=[1.3*inch, 1.0*inch, 3.2*inch, 1.5*inch])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    story.append(t1)
    story.append(Spacer(1, 8))

    # Section 3: Developer Setup
    story.append(Paragraph("3. Initial Developer Setup Commands", h2_style))
    story.append(Paragraph("Step 1: Clone Repository & Create Feature Branch", h3_style))
    story.append(Paragraph(
        "git clone https://github.com/harshithcheripally16-ui/Insurance-Policy-Claims-Management.git<br/>"
        "cd Insurance-Policy-Claims-Management<br/>"
        "git checkout -b feature/customer-module   # (or feature/claims-officer-module / feature/admin-module)",
        code_style
    ))

    story.append(Paragraph("Step 2: Set Up Backend (Python FastAPI)", h3_style))
    story.append(Paragraph(
        "cd backend<br/>"
        "python -m venv venv<br/>"
        ".\\venv\\Scripts\\activate   # (macOS/Linux: source venv/bin/activate)<br/>"
        "pip install -r requirements.txt<br/>"
        "python -m app.seed<br/>"
        "python run.py   # Running at http://127.0.0.1:8000 (Swagger docs: http://127.0.0.1:8000/docs)",
        code_style
    ))

    story.append(Paragraph("Step 3: Set Up Frontend (ReactJS + Vite)", h3_style))
    story.append(Paragraph(
        "cd frontend<br/>"
        "npm install<br/>"
        "npm run dev   # Running at http://localhost:3000",
        code_style
    ))

    # Section 4: Backend Router Integration
    story.append(Paragraph("4. Back-End Integration Instructions (backend/app/)", h2_style))
    story.append(Paragraph("Place all your API endpoints inside your assigned router file:", body_style))
    story.append(Paragraph("• Customer: <code>backend/app/routers/customer_router.py</code><br/>"
                           "• Claims Officer: <code>backend/app/routers/claims_officer_router.py</code><br/>"
                           "• Admin: <code>backend/app/routers/admin_router.py</code>", body_style))
    
    story.append(Paragraph("Router File Example (backend/app/routers/your_module_router.py):", h3_style))
    story.append(Paragraph(
        "from fastapi import APIRouter, Depends<br/>"
        "from sqlalchemy.orm import Session<br/>"
        "from app.database import get_db<br/>"
        "from app.models import User, UserRole<br/>"
        "from app.dependencies import require_roles<br/><br/>"
        "router = APIRouter(prefix=\"/api/your-module\", tags=[\"Your Module\"])\<br/><br/>"
        "@router.get(\"/dashboard\")<br/>"
        "def get_data(db: Session = Depends(get_db), user: User = Depends(require_roles([UserRole.CUSTOMER]))):<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;return {\"message\": \"Module loaded\"}",
        code_style
    ))

    story.append(Paragraph("Register Router in backend/app/main.py:", h3_style))
    story.append(Paragraph("from app.routers import your_module_router<br/>app.include_router(your_module_router.router)", code_style))

    # Section 5: Frontend Component Integration
    story.append(Paragraph("5. Front-End Integration Instructions (frontend/src/)", h2_style))
    story.append(Paragraph("Create your page in <code>frontend/src/pages/</code> and register it in <code>frontend/src/App.jsx</code>:", body_style))
    story.append(Paragraph(
        "// In frontend/src/App.jsx<br/>"
        "import CustomerDashboard from './pages/CustomerDashboard';<br/><br/>"
        "&lt;Routes&gt;<br/>"
        "&nbsp;&nbsp;&lt;Route path=\"/customer/dashboard\" element={&lt;CustomerDashboard /&gt;} /&gt;<br/>"
        "&lt;/Routes&gt;",
        code_style
    ))

    # Section 6: Test Credentials Table
    story.append(Paragraph("6. Pre-Seeded Test Credentials", h2_style))
    cred_data = [
        [Paragraph("Role", table_header_style), Paragraph("Email", table_header_style), Paragraph("Password", table_header_style), Paragraph("Module Developer", table_header_style)],
        [Paragraph("💼 Insurance Agent", table_cell_style), Paragraph("agent@insure.com", table_cell_style), Paragraph("password123", table_cell_style), Paragraph("Completed (Priya Nair)", table_cell_style)],
        [Paragraph("👤 Customer", table_cell_style), Paragraph("customer@insure.com", table_cell_style), Paragraph("password123", table_cell_style), Paragraph("Customer Module Teammate", table_cell_style)],
        [Paragraph("🔍 Claims Officer", table_cell_style), Paragraph("officer@insure.com", table_cell_style), Paragraph("password123", table_cell_style), Paragraph("Claims Officer Teammate", table_cell_style)],
        [Paragraph("👑 Admin", table_cell_style), Paragraph("admin@insure.com", table_cell_style), Paragraph("password123", table_cell_style), Paragraph("Admin Teammate", table_cell_style)],
    ]
    t2 = Table(cred_data, colWidths=[1.5*inch, 1.8*inch, 1.2*inch, 2.5*inch])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f766e')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    story.append(t2)
    story.append(Spacer(1, 8))

    # Section 7: Git Push & PR
    story.append(Paragraph("7. Git Commit & Push Guidelines", h2_style))
    story.append(Paragraph(
        "git status<br/>"
        "git add .<br/>"
        "git commit -m \"feat: implement &lt;your-module-name&gt; functionality\"<br/>"
        "git push origin feature/&lt;your-module-name&gt;<br/>"
        "# Open Pull Request (PR) on GitHub to merge into main.",
        code_style
    ))

    doc.build(story)

    # Copy to artifact path as well
    import shutil
    shutil.copyfile(workspace_path, artifact_path)
    print(f"PDF successfully generated at {workspace_path} and copied to {artifact_path}")

if __name__ == "__main__":
    generate_pdf()
