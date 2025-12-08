
from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext


def get_videos(db: Session):
    return db.query(models.Video).all()


def get_video(db: Session, video_id: int):
    return db.query(models.Video).filter(models.Video.id == video_id).first()

def get_videos_for_user(db: Session, user_id: int):
    return (
        db.query(models.Video)
        .filter(models.Video.user_id == user_id)
        .all()
    )



def get_video_by_youtube_id_for_user(
    db: Session,
    youtube_id: str,
    user_id: int,
):
    return (
        db.query(models.Video)
        .filter(
            models.Video.youtube_id == youtube_id,
            models.Video.user_id == user_id,
        )
        .first()
    )


def create_video(db: Session, info: schemas.YouTubeVideoInfo,owner_id:int):
    video = models.Video(
        youtube_id=info.youtube_id,
        title=info.title,
        description=info.description,
        thumbnail_url=info.thumbnail_url,
        channel_title=info.channel_title,
        duration=info.duration,
        url=info.url,
        user_id=owner_id,
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


pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def _normalize_password(password: str) -> str:
    if not isinstance(password, str):
        password = str(password)

    pw_bytes = password.encode("utf-8")
    if len(pw_bytes) > 72:
        pw_bytes = pw_bytes[:72]
        password = pw_bytes.decode("utf-8", errors="ignore")

    return password


def hash_password(password: str) -> str:
    normalized = _normalize_password(password)
    return pwd_context.hash(normalized)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    normalized = _normalize_password(plain_password)
    return pwd_context.verify(normalized, hashed_password)



def get_user_by_email(db: Session, email: str) -> models.User | None:
    return db.query(models.User).filter(models.User.email == email).first()


def get_user(db: Session, user_id: int) -> models.User | None:
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_user(db: Session, user_in: schemas.UserCreate) -> models.User:
    hashed_pw = hash_password(user_in.password)
    db_user = models.User(
        email=user_in.email,
        hashed_password=hashed_pw,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_video_for_user(db: Session, video_id: int, user_id: int) -> bool:
    video = (
        db.query(models.Video)
        .filter(models.Video.id == video_id, models.Video.user_id == user_id)
        .first()
    )
    if not video:
        return False
    db.delete(video)
    db.commit()
    return True
