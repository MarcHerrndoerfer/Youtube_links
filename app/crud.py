
from sqlalchemy.orm import Session
from . import models, schemas


def create_link(db: Session, data: schemas.YouTubeLinkCreate):
    db_link = models.YouTubeLink(
        url=data.url,
        title=data.title,
    )
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link


def get_links(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.YouTubeLink)
        .offset(skip)
        .limit(limit)
        .all()
    )


def delete_link(db: Session, link_id: int) -> bool:
    link = (
        db.query(models.YouTubeLink)
        .filter(models.YouTubeLink.id == link_id)
        .first()
    )
    if not link:
        return False

    db.delete(link)
    db.commit()
    return True
