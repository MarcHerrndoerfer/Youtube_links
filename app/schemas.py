from pydantic import BaseModel, HttpUrl


class VideoBase(BaseModel):
    youtube_id: str
    title: str
    description: str | None = None
    thumbnail_url: HttpUrl | None = None
    channel_title: str | None = None
    duration: str | None = None


class VideoCreate(BaseModel):
    url: HttpUrl


class VideoRead(VideoBase):
    id: int

    class Config:
        orm_mode = True
