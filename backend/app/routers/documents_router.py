import os
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models import User, UserRole, Claim, Document, DocType, VerificationStatus
from app.schemas import DocumentResponse, DocumentVerifyRequest
from app.dependencies import get_current_user, require_roles
from app.services.risk_engine import calculate_claim_risk

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.post("/upload/{claim_id}", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_claim_document(
    claim_id: int,
    doc_type: DocType = Form(DocType.OTHER),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    if current_user.role == UserRole.CUSTOMER and claim.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot upload files to another customer's claim")

    # Generate safe local filename
    filename = f"claim_{claim_id}_{int(os.path.basename(file.filename).replace(' ', '_'))}" if hasattr(file, 'filename') else f"claim_{claim_id}_doc"
    # Simplify safe filename
    safe_name = f"claim_{claim_id}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    doc = Document(
        file_name=file.filename,
        file_path=file_path,
        file_type=file.content_type or "application/octet-stream",
        file_size=file_size,
        doc_type=doc_type,
        status=VerificationStatus.PENDING,
        claim_id=claim.id
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Recalculate claim risk score with newly attached document
    doc_count = db.query(Document).filter(Document.claim_id == claim.id).count()
    risk_info = calculate_claim_risk(
        claim_amount=claim.amount,
        max_coverage=claim.policy.coverage_amount,
        policy_start_date=claim.policy.start_date,
        incident_date=claim.incident_date,
        doc_count=doc_count,
        recent_claims_count=0
    )
    claim.risk_score = risk_info["risk_score"]
    claim.risk_level = risk_info["risk_level"]
    claim.fraud_flags = risk_info["fraud_flags"]
    db.commit()

    return doc

@router.get("/{id}/download")
def download_document(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File binary not found on server disk")

    return FileResponse(path=doc.file_path, filename=doc.file_name, media_type=doc.file_type)

@router.patch("/{id}/verify", response_model=DocumentResponse)
def verify_document(
    id: int,
    req: DocumentVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.CLAIMS_OFFICER, UserRole.AGENT, UserRole.ADMIN]))
):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.status = req.status
    if req.notes:
        doc.notes = req.notes

    db.commit()
    db.refresh(doc)
    return doc
