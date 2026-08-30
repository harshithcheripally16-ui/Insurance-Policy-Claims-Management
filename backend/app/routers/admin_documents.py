import os
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Document, Claim, User
from app.schemas import DocumentOut, DocumentListResponse
from app.dependencies import require_admin
from app.config import settings

router = APIRouter(prefix="/api/admin/documents", tags=["Admin Documents"])

@router.get("", response_model=DocumentListResponse)
def list_documents(
    page: int = 1,
    page_size: int = 10,
    claim_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    query = db.query(Document)
    if claim_id:
        query = query.filter(Document.claim_id == claim_id)

    total = query.count()
    documents = query.order_by(Document.id.asc()).offset((page - 1) * page_size).limit(page_size).all()

    items = [DocumentOut.model_validate(d) for d in documents]

    return DocumentListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/{id}", response_model=DocumentOut)
def get_document_metadata(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentOut.model_validate(doc)

@router.get("/{id}/file")
def view_or_download_document_file(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document record not found")

    # Secure Path Traversal Check
    base_dir = Path(settings.UPLOAD_DIR).resolve()
    requested_path = Path(doc.file_path).resolve()

    # Ensure requested path is strictly within upload directory or mock file
    if not str(requested_path).startswith(str(base_dir)):
        # Check relative fallback within base_dir
        safe_rel_path = Path(os.path.basename(doc.file_path))
        requested_path = (base_dir / safe_rel_path).resolve()

    if not str(requested_path).startswith(str(base_dir)):
        raise HTTPException(status_code=403, detail="Access denied: Invalid file path")

    if not requested_path.exists():
        # If file on disk is missing, generate mock placeholder file safely
        sample_path = base_dir / "sample_claim_document.pdf"
        if not sample_path.exists():
            with open(sample_path, "w") as f:
                f.write("%PDF-1.4 Mock Insurance Claim Supporting Document\n1 0 obj<<>>endobj\ntrailer<<>>startxref\n0\n%%EOF")
        requested_path = sample_path

    return FileResponse(
        path=requested_path,
        filename=doc.file_name,
        media_type=doc.file_type or "application/pdf"
    )
