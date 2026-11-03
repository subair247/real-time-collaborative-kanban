from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import AskRequest, AskResponse
from .tools import get_tasks, get_board_summary, get_activity_logs

app = FastAPI(title="JulleyOnline Agentic AI Kanban Assistant", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "service": "Python Agentic AI Assistant"}

@app.post("/api/ai/ask", response_model=AskResponse)
def ask_assistant(req: AskRequest):
    if not req.tenant_id:
        raise HTTPException(status_code=400, detail="tenant_id context is strictly required.")

    query = req.question.lower()
    tools_used = []

    # Intent routing to allowlisted tools
    if any(k in query for k in ["summar", "progress", "status", "rate", "completion"]):
        summary = get_board_summary(req.tenant_id, req.board_id, req.auth_token)
        tools_used.append("get_board_summary")
        answer = (
            f"Workspace Summary for your branch:\n"
            f"• Total Tasks: {summary['total_tasks']}\n"
            f"• Completed: {summary['completed']}\n"
            f"• Testing: {summary.get('testing', 0)}\n"
            f"• In Progress: {summary['in_progress']}\n"
            f"• To Do: {summary['todo']}\n"
            f"• Completion Rate: {summary['completion_rate']}"
        )
        return AskResponse(answer=answer, tools_executed=tools_used, data=summary)

    elif any(k in query for k in ["activit", "history", "recent", "log"]):
        logs = get_activity_logs(req.tenant_id, req.auth_token)
        tools_used.append("get_activity_logs")
        count = len(logs)
        latest_action = f" Latest: {logs[0].get('action')} - {logs[0].get('details', {}).get('title', '')}." if logs else ""
        answer = f"Found {count} recent audit actions recorded in this branch workspace.{latest_action}"
        return AskResponse(answer=answer, tools_executed=tools_used, data={"logs_count": count})

    else:
        tasks = get_tasks(req.tenant_id, req.board_id, req.auth_token)
        tools_used.append("get_tasks")
        pending = [t['title'] for t in tasks if t.get('column', {}).get('name') != 'Done'][:5]
        pending_str = ", ".join(f'"{p}"' for p in pending) if pending else "No pending tasks"
        answer = f"You have {len(tasks)} tasks in this branch. Key pending items include: {pending_str}."
        return AskResponse(answer=answer, tools_executed=tools_used, data={"tasks_count": len(tasks)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)