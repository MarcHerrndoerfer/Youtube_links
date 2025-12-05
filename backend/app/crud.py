
from sqlalchemy.orm import Session
from . import models, schemas


def get_videos(db: Session):
    return db.query(models.Video).all()


def get_video(db: Session, video_id: int):
    return db.query(models.Video).filter(models.Video.id == video_id).first()


def get_video_by_youtube_id(db: Session, youtube_id: str):
    return db.query(models.Video).filter(models.Video.youtube_id == youtube_id).first()


def create_video(db: Session, info: schemas.YouTubeVideoInfo):
    video = models.Video(
        youtube_id=info.youtube_id,
        title=info.title,
        description=info.description,
        thumbnail_url=info.thumbnail_url,
        channel_title=info.channel_title,
        duration=info.duration,
        url=info.url
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


def delete_video(db: Session, video_id: int) -> bool:
    video = get_video(db, video_id)
    if not video:
        return False

    db.delete(video)
    db.commit()
    return True
