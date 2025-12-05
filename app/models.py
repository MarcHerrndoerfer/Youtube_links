from sqlalchemy import Column, Integer, String, Text
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
