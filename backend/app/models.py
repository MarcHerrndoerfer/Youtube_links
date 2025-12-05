from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Integer, String, Text
from .database import Base


class Video(Base):
    __tablename__ = "youtube_links"

    id = Column(Integer, primary_key=True, index=True)
    youtube_id = Column(String(20), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    thumbnail_url = Column(String(255))
    channel_title = Column(String(255))
    duration = Column(String(20))
    url = Column(String) 
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        nullable=False)  
