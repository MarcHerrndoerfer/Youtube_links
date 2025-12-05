from pydantic_settings import BaseSettings
from pydantic_settings import SettingsConfigDict 



class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    database_url: str
    debug: bool = True
    secret_key: str
    host: str = "127.0.0.1"
    port: int = 8000
    
    youtube_api_key: str | None = None
    
settings = Settings()
