from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class AskRequest(BaseModel):
    question: str = Field(..., description="User question about the board")
    tenant_id: str = Field(..., description="Verified tenant ID supplied by Node.js backend")
    board_id: Optional[str] = None
    user_role: Optional[str] = "Member"
    auth_token: Optional[str] = None

class AskResponse(BaseModel):
    answer: str
    tools_executed: List[str]
    data: Optional[Dict[str, Any]] = None