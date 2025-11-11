from datetime import datetime

from sqlmodel import Field, SQLModel


class EventBase(SQLModel):
    title: str
    when: datetime
    notes: str | None = None


class Event(EventBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class EventCreate(EventBase):
    pass


class EventRead(EventBase):
    id: int
    created_at: datetime
