from fastapi import FastAPI
import asyncpg

app = FastAPI()

DATABASE_URL = "postgresql://admin:password@db/ads_db"

@app.on_event("startup")
async def startup():
    app.state.db = await asyncpg.create_pool(DATABASE_URL)

@app.on_event("shutdown")
async def shutdown():
    await app.state.db.close()

@app.get("/analytics/summary")
async def analytics_summary():
    query = """
        SELECT campaigns.id, campaigns.name, COUNT(social_posts.id) AS post_count
        FROM campaigns
        LEFT JOIN social_posts ON campaigns.id = social_posts.campaign_id
        GROUP BY campaigns.id;
    """
    async with app.state.db.acquire() as conn:
        result = await conn.fetch(query)
    return {"campaigns": [dict(row) for row in result]}
