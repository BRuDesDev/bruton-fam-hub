from __future__ import annotations

import asyncio
import json
import os
import time
from contextlib import asynccontextmanager, suppress
from typing import Any

import redis.asyncio as redis
from fastapi import BackgroundTasks, Depends, FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from redis.exceptions import RedisError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from .config import get_settings
from .db import get_session, init_db
from .models import Event, EventCreate, EventRead

settings = get_settings()
origins_raw = os.getenv("ORIGINS", "")
origins = [origin for origin in origins_raw.split(",") if origin] or settings.allowed_origins


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    redis_client: redis.Redis | None = None
    try:
        redis_client = redis.from_url(settings.redis_url, decode_responses=True)
        app.state.redis = redis_client
    except Exception:
        app.state.redis = None
    try:
        yield
    finally:
        if redis_client is not None:
            await redis_client.close()


app = FastAPI(title="Bruton Family Hub", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict[str, bool]:
    return {"ok": True}


@app.get("/api/events", response_model=list[EventRead])
async def list_events(session: AsyncSession = Depends(get_session)) -> list[EventRead]:
    result = await session.exec(select(Event).order_by(Event.when))
    return result.all()


@app.post("/api/events", response_model=EventRead, status_code=201)
async def create_event(
    event_in: EventCreate,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
) -> EventRead:
    event = Event(**event_in.model_dump())
    session.add(event)
    await session.commit()
    await session.refresh(event)
    event_read = EventRead.model_validate(event)
    background_tasks.add_task(publish_event, event_read.model_dump(mode="json"))
    return event_read


async def publish_event(payload: dict[str, Any]) -> None:
    redis_client: redis.Redis | None = getattr(app.state, "redis", None)
    if redis_client is None:
        return
    try:
        await redis_client.publish(settings.redis_channel_events, json.dumps(payload))
    except RedisError:
        # Redis is optional in dev; skip fan-out if unavailable.
        return


@app.websocket("/ws/notify")
async def ws_notify(ws: WebSocket):
    await ws.accept()
    redis_client: redis.Redis | None = getattr(app.state, "redis", None)
    if redis_client is None:
        await ws.send_json({"error": "notifications offline"})
        await ws.close()
        return

    pubsub = redis_client.pubsub()
    await pubsub.subscribe(settings.redis_channel_events)
    heartbeat_task = asyncio.create_task(send_heartbeats(ws))

    try:
        async for message in pubsub.listen():
            if message["type"] != "message":
                continue
            try:
                await ws.send_text(message["data"])
            except WebSocketDisconnect:
                break
    except WebSocketDisconnect:
        pass
    finally:
        heartbeat_task.cancel()
        with suppress(asyncio.CancelledError):
            await heartbeat_task
        await pubsub.unsubscribe(settings.redis_channel_events)
        await pubsub.close()
        await ws.close()


async def send_heartbeats(ws: WebSocket, interval: int = 30) -> None:
    while True:
        await asyncio.sleep(interval)
        try:
            await ws.send_json({"type": "heartbeat", "ts": time.time()})
        except (WebSocketDisconnect, RuntimeError):
            break


@app.post("/api/media/upload")
async def media_upload(file: UploadFile = File(...)) -> dict[str, str]:
    return {"filename": file.filename, "status": "queued"}
