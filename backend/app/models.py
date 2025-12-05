from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Integer, String, Text,ForeignKey
from .database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    
    videos = relationship("Video", back_populates="owner")

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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    owner = relationship("User", back_populates="videos")
