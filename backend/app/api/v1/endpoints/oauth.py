from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
from sqlalchemy import select

from app.api.deps import get_db
from app.core.config import settings
from app.core.security import create_access_token
from app.models.user import User, UserRole
import uuid

router = APIRouter()

# --- GITHUB OAUTH ---

@router.get("/github/login")
async def github_login():
    github_auth_url = f"https://github.com/login/oauth/authorize?client_id={settings.GITHUB_CLIENT_ID}&scope=user:email"
    return RedirectResponse(url=github_auth_url)

@router.get("/github/callback")
async def github_callback(code: str, db: AsyncSession = Depends(get_db)) -> Any:
    async with httpx.AsyncClient() as client:
        # 1. Exchange code for access token
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
            }
        )
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to authenticate with GitHub")

        # 2. Get user info
        user_response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_data = user_response.json()
        github_id = str(user_data.get("id"))
        username = user_data.get("login")
        avatar_url = user_data.get("avatar_url")
        
        # 3. Get user email
        email_response = await client.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        emails = email_response.json()
        primary_email = next((email["email"] for email in emails if email.get("primary")), None)
        
        if not primary_email:
            raise HTTPException(status_code=400, detail="No primary email found on GitHub")

    # 4. Find or create user
    stmt = select(User).where((User.github_id == github_id) | (User.email == primary_email))
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user:
        # Create new user
        # Avoid username conflicts
        base_username = username
        counter = 1
        while True:
            check_stmt = select(User).where(User.username == username)
            if not (await db.execute(check_stmt)).scalars().first():
                break
            username = f"{base_username}{counter}"
            counter += 1

        user = User(
            email=primary_email,
            username=username,
            github_id=github_id,
            avatar_url=avatar_url,
            role=UserRole.student,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    elif not user.github_id:
        # Link existing account to GitHub
        user.github_id = github_id
        if not user.avatar_url:
            user.avatar_url = avatar_url
        await db.commit()
        
    # 5. Generate JWT and redirect
    jwt_token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "username": user.username,
        "role": user.role.value
    })
    
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth/callback?token={jwt_token}")


# --- DISCORD OAUTH ---

@router.get("/discord/login")
async def discord_login(request: Request):
    redirect_uri = str(request.url_for('discord_callback'))
    if request.headers.get("x-forwarded-proto") == "https":
        redirect_uri = redirect_uri.replace("http://", "https://")
    discord_auth_url = f"https://discord.com/api/oauth2/authorize?client_id={settings.DISCORD_CLIENT_ID}&redirect_uri={redirect_uri}&response_type=code&scope=identify%20email"
    return RedirectResponse(url=discord_auth_url)

@router.get("/discord/callback")
async def discord_callback(request: Request, code: str, db: AsyncSession = Depends(get_db)) -> Any:
    redirect_uri = str(request.url_for('discord_callback'))
    if request.headers.get("x-forwarded-proto") == "https":
        redirect_uri = redirect_uri.replace("http://", "https://")
    
    async with httpx.AsyncClient() as client:
        # 1. Exchange code for access token
        token_response = await client.post(
            "https://discord.com/api/oauth2/token",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={
                "client_id": settings.DISCORD_CLIENT_ID,
                "client_secret": settings.DISCORD_CLIENT_SECRET,
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
            }
        )
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            print("DISCORD OAUTH ERROR:", token_data)
            raise HTTPException(status_code=400, detail=f"Failed to authenticate with Discord: {token_data.get('error_description', token_data.get('error', 'Unknown error'))}")

        # 2. Get user info
        user_response = await client.get(
            "https://discord.com/api/users/@me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_data = user_response.json()
        discord_id = str(user_data.get("id"))
        username = user_data.get("username")
        email = user_data.get("email")
        
        if user_data.get("avatar"):
            avatar_url = f"https://cdn.discordapp.com/avatars/{discord_id}/{user_data.get('avatar')}.png"
        else:
            avatar_url = None
            
        if not email:
            raise HTTPException(status_code=400, detail="No email found on Discord account")

    # 4. Find or create user
    stmt = select(User).where((User.discord_id == discord_id) | (User.email == email))
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user:
        # Create new user
        base_username = username
        counter = 1
        while True:
            check_stmt = select(User).where(User.username == username)
            if not (await db.execute(check_stmt)).scalars().first():
                break
            username = f"{base_username}{counter}"
            counter += 1

        user = User(
            email=email,
            username=username,
            discord_id=discord_id,
            avatar_url=avatar_url,
            role=UserRole.student,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    elif not user.discord_id:
        # Link existing account to Discord
        user.discord_id = discord_id
        if not user.avatar_url:
            user.avatar_url = avatar_url
        await db.commit()
        
    # 5. Generate JWT and redirect
    jwt_token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "username": user.username,
        "role": user.role.value
    })
    
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth/callback?token={jwt_token}")
