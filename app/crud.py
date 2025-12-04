from sqlalchemy.orm import Session
from . import models, schemas


def get_videos(db: Session):
    return db.query(models.Video).all()


def get_video(db: Session, video_id: int):
    return db.query(models.Video).filter(models.Video.id == video_id).first()


def get_video_by_youtube_id(db: Session, youtube_id: str):
    return db.query(models.Video).filter(models.Video.youtube_id == youtube_id).first()


def create_video(db: Session, data: schemas.VideoBase):
    db_video = models.Video(**data.dict())
    db.add(db_video)
    db.commit()
    db.refresh(db_video)
    return db_video


def delete_video(db: Session, video_id: int):
    video = get_video(db, video_id)
    if video:
        db.delete(video)
        db.commit()
    return video
