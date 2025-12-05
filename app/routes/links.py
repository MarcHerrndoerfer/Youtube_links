
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import SessionLocal

router = APIRouter(prefix="/links", tags=["YouTube Links"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.YouTubeLinkRead)
def create_youtube_link(link: schemas.YouTubeLinkCreate, db: Session = Depends(get_db)):
    return crud.create_link(db, link)

@router.get("/", response_model=list[schemas.YouTubeLinkRead])
def list_youtube_links(db: Session = Depends(get_db)):
    return crud.get_links(db)

@router.delete("/{link_id}")
def delete_youtube_link(link_id: int, db: Session = Depends(get_db)):
    success = crud.delete_link(db, link_id)
    if not success:
        raise HTTPException(status_code=404, detail="Link not found")
    return {"detail": "deleted"}
