
from datetime import datetime
from pydantic import BaseModel, HttpUrl, ConfigDict


class YouTubeLinkBase(BaseModel):
    url: HttpUrl | None = None
    title: str | None = None


class YouTubeLinkCreate(YouTubeLinkBase):
    pass


class YouTubeLinkRead(YouTubeLinkBase):

    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
    

class YouTubeVideoInfo(BaseModel):
    
    youtube_id: str
    title: str
    description: str | None = None
    thumbnail_url: str | None = None
    channel_title: str | None = None
    duration: str | None = None
    url: str | None = None
