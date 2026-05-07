import asyncio
from app.db.session import AsyncSessionLocal
from app.crud.user import get_user_by_email
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.core.config import settings

async def create_superuser():
    async with AsyncSessionLocal() as db:
        user = await get_user_by_email(db, settings.ADMIN_EMAIL)
        if user:
            print(f"Админ с email {settings.ADMIN_EMAIL} уже существует!")
            return
            
        hashed_password = get_password_hash(settings.ADMIN_PASSWORD)
        db_user = User(
            username=settings.ADMIN_USERNAME,
            email=settings.ADMIN_EMAIL,
            hashed_password=hashed_password,
            role=UserRole.admin
        )
        db.add(db_user)
        await db.commit()
        print(f"Суперпользователь {settings.ADMIN_USERNAME} успешно создан!")

if __name__ == "__main__":
    asyncio.run(create_superuser())
