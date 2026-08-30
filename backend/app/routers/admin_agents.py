from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import User, UserRole, Policy
from app.schemas import (
    AgentCreate,
    AgentUpdate,
    UserStatusUpdate,
    AgentDetailOut,
    AgentListResponse,
    GenericMessageResponse
)
from app.dependencies import require_roles, get_password_hash

router = APIRouter(prefix="/api/admin/agents", tags=["Admin Agents"])

def format_agent_detail(agent: User, db: Session) -> AgentDetailOut:
    purchases = db.query(Policy).filter(Policy.agent_id == agent.id).all()
    total_premium = 0.0
    for p in purchases:
        if p.premium_amount:
            total_premium += float(p.premium_amount)

    role_str = agent.role.value if hasattr(agent.role, 'value') else str(agent.role)

    return AgentDetailOut(
        id=agent.id,
        full_name=agent.name,
        email=agent.email,
        phone=agent.phone,
        role=role_str,
        is_active=getattr(agent, 'is_active', True),
        created_at=agent.created_at,
        purchases_handled_count=len(purchases),
        total_premium_generated=round(total_premium, 2)
    )

@router.get("", response_model=AgentListResponse)
def list_agents(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    query = db.query(User).filter(User.role == UserRole.AGENT)

    if search and isinstance(search, str) and search.strip():
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.name.ilike(search_term),
                User.email.ilike(search_term),
                User.phone.ilike(search_term)
            )
        )

    total = query.count()
    agents = query.order_by(User.id.asc()).offset((page - 1) * page_size).limit(page_size).all()

    items = [format_agent_detail(a, db) for a in agents]

    return AgentListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/{id}", response_model=AgentDetailOut)
def get_agent_by_id(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    agent = db.query(User).filter(User.id == id, User.role == UserRole.AGENT).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return format_agent_detail(agent, db)

@router.post("", response_model=AgentDetailOut, status_code=status.HTTP_201_CREATED)
def create_agent(
    payload: AgentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    existing = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists"
        )
    
    new_agent = User(
        name=payload.full_name.strip(),
        email=payload.email.lower().strip(),
        phone=payload.phone.strip() if payload.phone else None,
        hashed_password=get_password_hash(payload.password),
        role=UserRole.AGENT,
        is_active=payload.is_active
    )
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)

    return format_agent_detail(new_agent, db)

@router.put("/{id}", response_model=AgentDetailOut)
def update_agent(
    id: int,
    payload: AgentUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    agent = db.query(User).filter(User.id == id, User.role == UserRole.AGENT).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if payload.email and payload.email.lower().strip() != agent.email:
        existing = db.query(User).filter(User.email == payload.email.lower().strip()).first()
        if existing and existing.id != agent.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email address is already taken"
            )
        agent.email = payload.email.lower().strip()

    if payload.full_name is not None:
        agent.name = payload.full_name.strip()
    if payload.phone is not None:
        agent.phone = payload.phone.strip() if payload.phone else None
    if payload.password:
        agent.hashed_password = get_password_hash(payload.password)

    db.commit()
    db.refresh(agent)

    return format_agent_detail(agent, db)

@router.patch("/{id}/status", response_model=AgentDetailOut)
def update_agent_status(
    id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    agent = db.query(User).filter(User.id == id, User.role == UserRole.AGENT).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent.is_active = payload.is_active
    db.commit()
    db.refresh(agent)

    return format_agent_detail(agent, db)

@router.delete("/{id}", response_model=GenericMessageResponse)
def delete_agent(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    agent = db.query(User).filter(User.id == id, User.role == UserRole.AGENT).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent_email = agent.email
    db.delete(agent)
    db.commit()

    return GenericMessageResponse(message=f"Agent {agent_email} deleted successfully")
