import os
import requests

NODE_BACKEND_URL = os.getenv("NODE_BACKEND_URL", "http://localhost:5000/api")

def get_tasks(tenant_id: str, board_id: str = None, auth_token: str = None) -> list:
    """Retrieve tasks strictly scoped to the authorized tenant."""
    try:
        url = f"{NODE_BACKEND_URL}/tasks"
        headers = {"x-tenant-id": tenant_id}
        if auth_token:
            headers["Authorization"] = auth_token
        params = {"board_id": board_id} if board_id else {}
        res = requests.get(url, headers=headers, params=params, timeout=5)
        if res.status_code == 200:
            return res.json()
    except Exception as e:
        print("get_tasks error:", e)
    return []

def get_board_summary(tenant_id: str, board_id: str = None, auth_token: str = None) -> dict:
    """Calculate task completion rates and column distribution."""
    tasks = get_tasks(tenant_id, board_id, auth_token)
    total = len(tasks)
    completed = len([t for t in tasks if t.get("column", {}).get("name") == "Done" or t.get("column_id") == "Done"])
    in_progress = len([t for t in tasks if t.get("column", {}).get("name") == "In Progress"])
    testing = len([t for t in tasks if t.get("column", {}).get("name") == "Testing"])
    todo = len([t for t in tasks if t.get("column", {}).get("name") == "To Do"])
    rate = f"{(completed / total * 100):.1f}%" if total > 0 else "0.0%"

    return {
        "total_tasks": total,
        "completed": completed,
        "in_progress": in_progress,
        "testing": testing,
        "todo": todo,
        "completion_rate": rate,
    }

def get_activity_logs(tenant_id: str, auth_token: str = None) -> list:
    """Retrieve recent tenant audit events."""
    try:
        url = f"{NODE_BACKEND_URL}/tenants/{tenant_id}/activities"
        headers = {"x-tenant-id": tenant_id}
        if auth_token:
            headers["Authorization"] = auth_token
        res = requests.get(url, headers=headers, timeout=5)
        if res.status_code == 200:
            return res.json()
    except Exception as e:
        print("get_activity_logs error:", e)
    return []