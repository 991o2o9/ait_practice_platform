from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AIT Practice Platform API"
    DB_USER: str = "user"
    DB_PASSWORD: str = "password"
    DB_NAME: str = "backend"
    DB_HOST: str = "db"
    DB_PORT: int = 5432
    
    SECRET_KEY: str = "fallback_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    
    ADMIN_USERNAME: str = "admin"
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "admin"
    
    GROQ_API_KEY: str = "default_key_to_be_replaced_in_env"
    GROQ_VALIDATOR_API_KEY: str = ""
    
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    
    DISCORD_CLIENT_ID: str = ""
    DISCORD_CLIENT_SECRET: str = ""
    
    FRONTEND_URL: str = "http://localhost:5173"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
