from typing import Literal, Optional
from pydantic import BaseModel

class Command(BaseModel):
    action: Literal["navigate", "form", "tour_all", "answer", "clarify"]
    targetNodeId: Optional[str] = None
    formId: Optional[str] = None
    text: Optional[str] = None
    startMessage: Optional[str] = None
    completionMessage: Optional[str] = None

class IntentResponse(BaseModel):
    commands: list[Command]

class IntentRequest(BaseModel):
    userMessage: str
    currentNodeId: str
    chatHistory: str = ""