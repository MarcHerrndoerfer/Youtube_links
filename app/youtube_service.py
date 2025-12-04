import re
import requests
from .config import settings
from .schemas import VideoBase


YOUTUBE_VIDEO_ID_REGEX = r"(?:v=|be/)([A-Za-z0-9_-]{11})"


def extract_video_id(url: str) -> str | None:
    match = re.search(YOUTUBE_VIDEO_ID_REGEX, url)
    return match.group(1) if match else None


def fetch_video_details(video_id: str) -> VideoBase | None:
    params = {
        "part": "snippet,contentDetails",
        "id": video_id,
        "key": settings.youtube_api_key,
    }
    resp = requests.get("https://www.googleapis.com/youtube/v3/videos", params=params)
    if resp.status_code != 200:
        return None

    data = resp.json()
    items = data.get("items", [])
    if not items:
        return None

    item = items[0]
    snippet = item["snippet"]
    content = item["contentDetails"]

    return VideoBase(
        youtube_id=video_id,
        title=snippet.get("title", ""),
        description=snippet.get("description", ""),
        thumbnail_url=snippet.get("thumbnails", {}).get("default", {}).get("url"),
        channel_title=snippet.get("channelTitle"),
        duration=content.get("duration"),
    )
