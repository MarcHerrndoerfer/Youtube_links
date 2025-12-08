
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware


from .database import SessionLocal, Base, engine
from . import models, schemas, crud, youtube_service
from .auth import router as auth_router, get_current_user 

Base.metadata.create_all(bind=engine)

app = FastAPI(title="YouTube Bookmark API")
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



app.include_router(auth_router)




@app.get("/videos", response_model=list[schemas.YouTubeLinkRead])
def list_videos(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.get_videos_for_user(db, user_id=current_user.id)


@app.post("/videos", response_model=schemas.YouTubeLinkRead, status_code=201)
def add_video(
    payload: schemas.YouTubeLinkCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    video_id = youtube_service.extract_video_id(str(payload.url))
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    existing = crud.get_video_by_youtube_id_for_user(db, video_id, current_user.id)
    if existing:
        return existing

    details = youtube_service.fetch_video_details(video_id)
    if not details:
        raise HTTPException(status_code=400, detail="Could not fetch video details")
    details.url = str(payload.url)
    return crud.create_video(db, details, owner_id=current_user.id)


@app.delete("/videos/{video_id}", status_code=204)
def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    success = crud.delete_video_for_user(db, video_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Video not found")
