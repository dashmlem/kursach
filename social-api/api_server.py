
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncpg
from datetime import datetime
from typing import List

app = FastAPI()

DATABASE_URL = "postgresql://admin:password@db/ads_db"

class SocialPost(BaseModel):
    campaign_id: int
    platform: str
    content: str
    scheduled_time: datetime

@app.on_event("startup")
async def startup():
    app.state.db = await asyncpg.create_pool(DATABASE_URL)

@app.on_event("shutdown")
async def shutdown():
    await app.state.db.close()

@app.post("/api/posts", response_model=dict)
async def create_post(post: SocialPost):
    query = """
        INSERT INTO social_posts (campaign_id, platform, content, scheduled_time)
        VALUES ($1, $2, $3, $4) RETURNING *;
    """
    async with app.state.db.acquire() as conn:
        result = await conn.fetchrow(query, post.campaign_id, post.platform, post.content, post.scheduled_time)
    return dict(result)

@app.get("/api/posts", response_model=List[dict])
async def get_posts():
    query = "SELECT * FROM social_posts ORDER BY created_at DESC;"
    async with app.state.db.acquire() as conn:
        result = await conn.fetch(query)
    return [dict(row) for row in result]
