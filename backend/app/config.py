from functools import lru_cache
from pydantic import AnyUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_nested_delimiter="__")

    app_name: str = "Bruton Family Hub"
    environment: str = "local"
    debug: bool = True

    database_url: AnyUrl | str = "sqlite+aiosqlite:///./family_hub.db"
    redis_url: AnyUrl = AnyUrl.build(scheme="redis", host="redis", port=6379)
    minio_endpoint: str = "http://minio:9000"
    minio_access_key: str = "minio"
    minio_secret_key: str = "minio123"

    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    google_calendar_credentials_path: str | None = None
    google_calendar_token_path: str | None = None

    allowed_origins: list[str] = Field(default_factory=lambda: ["*"])
    redis_channel_events: str = "familyhub:events"


@lru_cache
def get_settings() -> Settings:
    return Settings()
