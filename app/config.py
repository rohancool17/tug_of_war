from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    DIRECTUS_URL: str = "https://cms.benzenedigital.com"
    DIRECTUS_TOKEN: str = ""
    SECRET_KEY: str = "tug-of-war-secret-key-123"
    NODE_ENV: str = "development"
    PORT: int = 3250

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

@lru_cache()
def get_settings():
    return Settings()
