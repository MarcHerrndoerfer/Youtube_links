from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import SessionLocal, Base, engine
from . import models, schemas, crud, youtube_service

Base.metadata.create_all(bind=engine)

app = FastAPI(title="YouTube Bookmark API")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/videos", response_model=list[schemas.YouTubeLinkRead])
def list_videos(db: Session = Depends(get_db)):
    return crud.get_videos(db)


@app.get("/videos/{video_id}", response_model=schemas.YouTubeLinkRead)
def get_video(video_id: int, db: Session = Depends(get_db)):
    video = crud.get_video(db, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@app.post("/videos", response_model=schemas.YouTubeLinkRead, status_code=201)
def add_video(payload: schemas.YouTubeLinkCreate, db: Session = Depends(get_db)):
    video_id = youtube_service.extract_video_id(str(payload.url))
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    existing = crud.get_video_by_youtube_id(db, video_id)
    if existing:
        return existing

    details = youtube_service.fetch_video_details(video_id)
    if not details:
        raise HTTPException(status_code=400, detail="Could not fetch video details")
    
    details.url = str(payload.url)

    return crud.create_video(db, details)


@app.delete("/videos/{video_id}", status_code=204)
def delete_video(video_id: int, db: Session = Depends(get_db)):
    video = crud.delete_video(db, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

