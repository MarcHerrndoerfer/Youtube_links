Youtube Links API  
A small FastAPI-based REST API for storing and managing YouTube videos.
The API automatically extracts the YouTube ID from a URL and retrieves relevant metadata such as title, description, thumbnails, channel name, and duration via the YouTube Data API v3.

Features

- REST API with FastAPI - Automatically analyze YouTube URL
- Retrieve video metadata via YouTube Data API - Store in SQLite (`videos.db`)
- Endpoints for creating, reading, deleting
- Automatic Swagger documentation (`/docs`)
- Clean project structure
