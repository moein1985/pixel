from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://pixel:pixel@localhost:5432/pixel"
    redis_url: str = "redis://localhost:6379"
    ai_port: int = 8000
    node_api_url: str = "http://localhost:4000"

    class Config:
        env_file = ".env"


settings = Settings()
