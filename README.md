# Real-Time Collaborative Kanban Board (Multi-Organization + Multi-Tenant)

A production-grade, enterprise collaborative task management platform designed for multi-branch organizations. Featuring strict multi-tenant data isolation, real-time live synchronization via WebSockets, ACID transactional drag-and-drop, optimistic concurrency locking (HTTP 409), and an integrated Python Agentic AI assistant.

---

## 1. Project Overview

Modern software enterprises operate across geographically dispersed branches (e.g., **ABC Technologies** with branches in **Hyderabad**, **Bangalore**, and **Chennai**; and **XYZ Solutions** with branches in **Mumbai** and **Pune**). 

This platform enables team members within the same branch to collaborate on project boards in real time with sub-second live updates, drag-and-drop task progression, presence tracking, and undo/redo capabilities—while guaranteeing with mathematical certainty that private tenant data never leaks across organizational or branch boundaries.

---

## 2. Business Problem & Solution Architecture

### The Core Challenges:
1. **Multi-Tenancy Isolation:** An engineer in Hyderabad working on corporate web platforms must never query, view, or receive socket events for Bangalore's private CRM boards or XYZ Solutions' infrastructure.
2. **Real-Time Consistency:** When User A moves a task in Hyderabad, User B (viewing the same board) must see the card move instantly without manual browser refreshes.
3. **Concurrency & Race Conditions:** When two engineers simultaneously edit the same task description or drag cards into the same slot, the system must prevent silent data overwrites.
4. **Resilient Collaboration:** Network drops, multi-tab usage, and accidental drags must be gracefully handled via automatic reconnection reconciliation and optimistic undo/redo controls.

### How We Solved It:
- **Hierarchical Relational Isolation:** `Organization` -> `Tenant` -> `Board` -> `Column` -> `Task`. Every query strictly enforces `tenant_id`.
- **Tenant-Scoped WebSocket Rooms:** Socket.IO clients join isolated rooms (`tenant:<tenantId>`). Broadcasts never cross room boundaries.
- **Optimistic Concurrency Control:** Every task maintains a monotonic `version` counter. Stale mutations return `HTTP 409 Conflict`.
- **Atomic Reordering Transactions:** Drag-and-drop executes inside PostgreSQL ACID transactions (`prisma.$transaction`), reordering siblings atomically.

---

## 3. System Architecture & 3D Layered Mermaid Diagram

```mermaid
graph TB
    %% Styling Definitions
    classDef clientLayer fill:#EEF2FF,stroke:#4F46E5,stroke-width:2px,color:#1E1B4B;
    classDef gatewayLayer fill:#F0FDF4,stroke:#16A34A,stroke-width:2px,color:#064E3B;
    classDef realtimeLayer fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F;
    classDef databaseLayer fill:#F5F3FF,stroke:#7C3AED,stroke-width:2px,color:#4C1D95;
    classDef aiLayer fill:#FFF1F2,stroke:#E11D48,stroke-width:2px,color:#881337;

    %% Client Frontend Layer
    subgraph Client_Layer ["1. Frontend Presentation Layer (React.js + Tailwind CSS + dnd-kit)"]
        UI_Login["Login & Org Switcher<br/>(One-Click Test Roles)"]:::clientLayer
        UI_Kanban["Kanban Board Engine<br/>(4 Columns • Optimistic UI)"]:::clientLayer
        UI_Presence["Presence Indicators<br/>(2 online • Avatars R, P)"]:::clientLayer
        UI_Undo["Undo / Redo Stack<br/>(Ctrl+Z / Ctrl+Y Toasts)"]:::clientLayer
        UI_AI["Plane AI Assistant Drawer<br/>(Slide-Over Chat)"]:::clientLayer
    end

    %% API Gateway & Security Layer
    subgraph Gateway_Layer ["2. Application & Security Middleware Layer (Node.js + Express.js)"]
        AUTH_MID["auth.middleware.js<br/>(JWT Verification)"]:::gatewayLayer
        TENANT_MID["tenant.middleware.js<br/>(Strict Tenant Membership Validation)"]:::gatewayLayer
        ROLE_MID["role.middleware.js<br/>(RBAC: Org Admin • Tenant Admin • Member)"]:::gatewayLayer
        ZOD_VAL["Zod Validation Layer<br/>(Payload Schema Enforcement)"]:::gatewayLayer
        CONTROLLERS["CRUD Controllers<br/>(Orgs, Tenants, Boards, Tasks, Activities)"]:::gatewayLayer
    end

    %% Real-Time WebSocket Layer
    subgraph Realtime_Layer ["3. Real-Time Event & Presence Engine (Socket.IO)"]
        SOCKET_AUTH["Socket Auth Handshake<br/>(JWT Token Extraction)"]:::realtimeLayer
        ROOM_HYD["Room: tenant:Hyderabad<br/>(Rahul • Priya • Arjun)"]:::realtimeLayer
        ROOM_BLR["Room: tenant:Bangalore<br/>(Sneha)"]:::realtimeLayer
        ROOM_MUM["Room: tenant:Mumbai<br/>(Kiran)"]:::realtimeLayer
        PRESENCE_TRACK["Presence Tracker<br/>(In-Memory Set of Active Sockets)"]:::realtimeLayer
    end

    %% Database & Persistence Layer
    subgraph Database_Layer ["4. Persistence & Storage Layer (Neon Cloud PostgreSQL + Prisma ORM)"]
        PRISMA_CLIENT["Prisma ORM Client<br/>(Connection Pooling • Auto-Retry)"]:::databaseLayer
        TX_ENGINE["ACID Transaction Engine<br/>(prisma.$transaction for Moves)"]:::databaseLayer
        DB_TABLES["8 Normalized Tables<br/>(organizations, tenants, users, memberships,<br/>boards, columns, tasks, activity_logs)"]:::databaseLayer
        LOCK_CHECK["Optimistic Locking Evaluator<br/>(current.version === expected_version)"]:::databaseLayer
    end

    %% Python Agentic AI Layer
    subgraph AI_Layer ["5. Agentic AI Microservice Layer (Python FastAPI + Uvicorn)"]
        FASTAPI_CORE["FastAPI Service (:8000)<br/>(/health • /api/ai/ask)"]:::aiLayer
        TOOL_ROUTER["Intent & Tool Router<br/>(Summarize • Activities • Tasks)"]:::aiLayer
        ALLOWLIST_TOOLS["4 Allowlisted Read-Only Tools<br/>(get_board_summary, get_tasks, get_activity_logs)"]:::aiLayer
    end

    %% Inter-Layer Connections
    UI_Login -->|POST /api/auth/login| AUTH_MID
    UI_Kanban -->|REST: JWT + x-tenant-id| AUTH_MID
    AUTH_MID --> TENANT_MID
    TENANT_MID --> ROLE_MID
    ROLE_MID --> ZOD_VAL
    ZOD_VAL --> CONTROLLERS

    CONTROLLERS -->|Transactional Queries| TX_ENGINE
    TX_ENGINE --> LOCK_CHECK
    LOCK_CHECK --> DB_TABLES

    UI_Kanban <-->|WebSocket Persistent Connection| SOCKET_AUTH
    SOCKET_AUTH --> PRESENCE_TRACK
    PRESENCE_TRACK --> ROOM_HYD
    PRESENCE_TRACK --> ROOM_BLR
    PRESENCE_TRACK --> ROOM_MUM

    CONTROLLERS -->|Live Broadcast: task:moved, task:created| ROOM_HYD
    ROOM_HYD -->|Instant Real-Time Sync| UI_Kanban
    ROOM_HYD -->|Presence Updates| UI_Presence

    UI_AI -->|POST /api/ai/ask| CONTROLLERS
    CONTROLLERS -->|Forward Verified Tenant Context + JWT| FASTAPI_CORE
    FASTAPI_CORE --> TOOL_ROUTER
    TOOL_ROUTER --> ALLOWLIST_TOOLS
    ALLOWLIST_TOOLS -->|Authorized Internal Fetch| CONTROLLERS
```

## 4. Key Features

- **Multi-Organization & Multi-Tenant Switching:**  
  Coinshift-inspired dynamic workspace switcher allowing seamless navigation between parent enterprises (`ABC Technologies` vs. `XYZ Solutions`) and isolated branch workspaces (`Hyderabad`, `Bangalore`, `Chennai`, `Mumbai`, `Pune`) with zero cross-tenant data leakage.

- **Real-Time Live Collaboration:**  
  Sub-second bidirectional synchronization powered by Socket.IO. Task creation, title/description edits, column transitions, and deletions instantly propagate across all connected browsers in the same branch room without requiring page refreshes.

- **Dynamic Presence Indicators:**  
  Real-time team presence tracking with pulsing connection status, concurrent user counters, and active teammate avatar pills (`2 online (R, P)`). Multi-tab resilient architecture ensures closing an auxiliary tab does not trigger a false offline event.

- **Drag-and-Drop Task Progression:**  
  Fluid, accessible drag-and-drop workflow built with `@dnd-kit/core` and `@dnd-kit/sortable`. Supports both vertical reordering within status columns and horizontal transitions between workflow stages (`To Do` → `In Progress` → `Testing` → `Done`).

- **Optimistic Concurrency Control:**  
  Monotonic integer version tracking on task entities. When two users simultaneously submit edits or moves on the same card, the server rejects the stale mutation with `HTTP 409 Conflict`, prompting safe client-side state reconciliation without silent data overwrites.

- **Robust Undo / Redo Workflow:**  
  Client-side history stack allowing users to immediately revert (`Ctrl + Z` / `↩`) or reapply (`Ctrl + Y` / `↪`) recent task movements. Paired with instantaneous optimistic UI rollbacks and floating toast notifications.

- **Persisted Activity History & Audit Trail:**  
  Dedicated PostgreSQL `activity_logs` table providing a tamper-evident audit feed of all branch operations (`Created`, `Updated`, `Moved`, `Deleted`) complete with actor identity, target entity, and server-verified timestamps.

- **Plane AI-Style Agentic Assistant:**  
  Integrated Python FastAPI microservice providing a collapsible right-side drawer assistant. Autonomously routes user intents to allowlisted read-only tools (`get_board_summary`, `get_tasks`, `get_activity_logs`) to compute live completion rates, summarize branch backlogs, and inspect recent activity.

## 5. Technology Stack

| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18, Vite 5, Tailwind CSS 3 | Fast responsive component rendering, zero-build latency, modern typography |
| **Drag & Drop** | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | Accessible, touch-compatible, smooth drag-and-drop interactions |
| **Real-Time Client** | `socket.io-client` (v4.8) | Persistent bidirectional WebSocket connection with auto-reconnection loop |
| **HTTP Client** | `axios` (v1.7) | REST API communication with request/response interceptors for JWT & `x-tenant-id` |
| **Iconography** | `lucide-react` | Clean vector iconography matching Plane and Coinshift design patterns |
| **Backend Runtime** | Node.js (v18/v20 LTS), Express.js (v4.21) | Scalable HTTP REST server and middleware pipeline |
| **Real-Time Server** | `socket.io` (v4.8) | Tenant-scoped rooms, connection management, presence tracking |
| **Database & ORM** | PostgreSQL (Neon Cloud), Prisma ORM (v5.22) | Multi-tenant schema, ACID transactions (`prisma.$transaction`), connection pooling |
| **Auth & Security** | `bcryptjs`, `jsonwebtoken` (JWT), `zod` | Salted password hashing, stateless Bearer token auth, strict schema validation |
| **Agentic AI Microservice**| Python 3.10+, FastAPI, Uvicorn, Pydantic v2 | Autonomous read-only agent executing allowlisted workspace tools |

## 6. Multi-Tenant Architecture & Data Isolation Model

The database models a strict three-tier relational hierarchy:

```text
Organization (Parent Enterprise)
    └── Tenants (Branches / Workspaces)
            └── Boards (Project Spaces)
                    └── Columns (Status Swimlanes)
                            └── Tasks (Individual Work Items)
``` 
## Data Isolation Guarantees:

1. **Database Schema Scoping:**  
   Every business record (`boards`, `columns`, `tasks`, `activity_logs`) possesses a mandatory foreign key `tenant_id`.

2. **Membership Binding:**  
   Users can only act within tenants where an active authorization record exists in the `memberships` table.

3. **Tenant Context Verification:**  
   `tenant.middleware.js` extracts the tenant ID from the `x-tenant-id` header and verifies that the authenticated user belongs to that tenant before request execution.

4. **Mandatory Query Filtering:**  
   Every Prisma database query strictly mandates tenant scoping:
   ```javascript
   prisma.task.findFirst({
     where: { 
       id: taskId, 
       tenant_id: req.tenantId 
     }
   })
   ```

## 7. Role-Based Access Control (RBAC)

The application enforces a 3-tier hierarchical permission model across all endpoints:

| Role | Scope | Permissions |
| :--- | :--- | :--- |
| **Org Admin** | Organization Wide | Create branch tenants, assign organization roles, create and view boards across all branches of their organization. |
| **Tenant Admin** | Branch Level | Create boards, customize columns, assign tasks to members, manage tasks within their specific branch. |
| **Member** | Branch Level | View authorized branch boards, create new tasks, update descriptions, drag and drop tasks across columns. |

## 8. Database Design (8 Normalized Tables)

The PostgreSQL database enforces relational integrity, foreign key cascading, and strict tenant-level isolation across 8 normalized tables:

```text
1. organizations   : id (UUID PK), name, created_at, updated_at
2. tenants         : id (UUID PK), organization_id (FK), name, created_at
3. users           : id (UUID PK), name, email (UNIQUE), password_hash, created_at
4. memberships     : id (UUID PK), user_id (FK), organization_id (FK), tenant_id (FK null), role (RBAC), created_at
5. boards          : id (UUID PK), organization_id (FK), tenant_id (FK [ISOLATED]), name, description, created_by (FK), created_at
6. columns         : id (UUID PK), board_id (FK), tenant_id (FK [ISOLATED]), name, position (INT)
7. tasks           : id (UUID PK), board_id (FK), column_id (FK), tenant_id (FK [ISOLATED]), title, description, assigned_to (FK), position (INT), version (INT [CONCURRENCY]), created_at, updated_at
8. activity_logs   : id (UUID PK), tenant_id (FK [ISOLATED]), user_id (FK), entity_type, entity_id, action, details (JSONB), created_at
```
### Relational Schema Diagram:

[docs/database-erd.png]

### Key Highlights:
- **Multi-Tenant Isolation:** Every operational table (`boards`, `columns`, `tasks`, `activity_logs`) possesses a direct `tenant_id` foreign key.
- **Optimistic Concurrency:** `tasks.version` increments on every update, preventing race conditions via optimistic locking.
- **Composite Indexes:** Placed on `[tenant_id, board_id]`, `[tenant_id, column_id]`, and `[tenant_id, created_at]` for sub-millisecond query execution.

## 9. Real-Time Communication Specification

### Connection & Room Authorization:
1. Client connects to `http://localhost:5000` sending JWT token in `auth.token`.
2. Server verifies token, extracts user memberships.
3. Client emits `tenant:join` with `{ tenantId }`.
4. Server validates that user belongs to `tenantId`, then adds socket to `tenant:<tenantId>`.

### Socket Events Catalog:

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `tenant:join` | Client → Server | `{ tenantId: string }` | Joins authorized branch room; updates presence |
| `presence:update` | Server → Client | `{ onlineUsers: User[], count: number }` | Broadcast to tenant room on connection / disconnection |
| `task:created` | Server → Client | `Task` | Broadcast when a task is created in the branch |
| `task:updated` | Server → Client | `Task` | Broadcast on title, description, or assignee edits |
| `task:moved` | Server → Client | `Task` | Broadcast on drag-and-drop column or position change |
| `task:deleted` | Server → Client | `{ id: string }` | Broadcast when a task is deleted |

## 10. Concurrency Handling & Optimistic Locking

When multiple users collaborate simultaneously:
1. Every task record maintains an integer `version` field initialized to `1`.
2. When a user updates a task or moves its position, the client transmits `expected_version`.
3. In a PostgreSQL transaction, the backend executes:
   ```javascript
   if (currentTask.version !== expected_version) {
     const error = new Error('Conflict: Task was modified by another user.');
     error.status = 409;
     throw error;
   }
   ```
4. If versions match, the server updates the task, increments version = version + 1, and broadcasts the event.
5. If versions mismatch, the server returns HTTP 409 Conflict. The client displays an amber conflict banner and reconciles with the latest server state without silent data corruption.

## 11. Engineering Challenges Faced & How We Solved Them

### Challenge 1: Cross-Tenant Data Leakage in REST APIs
- *Problem:* A malicious user could tamper with HTTP parameters or headers to query tasks belonging to another branch.
- *Solution:* Implemented a strict 3-tier verification pipeline (`auth.middleware` → `tenant.middleware` → query scoping). The middleware verifies the user's membership against the PostgreSQL `memberships` table for that specific `tenant_id` before the request reaches the controller.

### Challenge 2: Multi-User Race Conditions on Concurrent Task Moves
- *Problem:* Two users dragging cards into the same column slot simultaneously could corrupt the integer `position` order.
- *Solution:* Enclosed all task reordering logic in an atomic `prisma.$transaction`. Sibling task positions are shifted conditionally (`increment` / `decrement`) within the same database transaction before updating the dragged task's version.

### Challenge 3: False Disconnection in Multi-Tab Usage
- *Problem:* If a user opened the Kanban board in two tabs and closed one, a naive socket disconnect handler would mark the user offline.
- *Solution:* Implemented an in-memory `Map<userId, Set<socketId>>` tracker per tenant room. The user is only marked offline when their active socket set becomes empty.

### Challenge 4: Undo/Redo Stale Version Collisions
- *Problem:* When a user moved a task and immediately hit Undo, the client-side closure sent the old version, triggering an accidental `HTTP 409 Conflict`.
- *Solution:* Made `expected_version` optional in `moveTaskSchema` for self-initiated undo operations, while pairing it with instantaneous optimistic UI state rollback, keyboard shortcuts (`Ctrl+Z` / `Ctrl+Y`), and visual feedback toasts.

### Challenge 5: Autonomous AI Agent Data Authorization
- *Problem:* Enabling an AI assistant to query project data risked exposing private cross-tenant metrics to unauthorized users.
- *Solution:* Applied the Proxy Architecture (Section 9 Step 4). The frontend requests pass through Node.js, which injects the verified `req.tenantId` and the user's authenticated JWT token before proxying to FastAPI. The Python tools are strictly constrained to allowlisted read-only functions.

## 12. Installation and Setup

### Prerequisites
- Node.js (v18 or v20 LTS)
- Python (v3.10 or newer)
- PostgreSQL (Neon Cloud or local instance)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/your-username/collaborative-kanban.git
cd collaborative-kanban
```
### 2. Environment Configuration
**Backend (backend/.env)**
```bash
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
JWT_SECRET="supersecretjwtkey_replace_in_production_min32chars"
JWT_EXPIRES_IN="24h"
CLIENT_URL="http://localhost:5173"
```

**Frontend (frontend/.env)**
```bash
VITE_API_URL="http://localhost:5000/api"
VITE_SOCKET_URL="http://localhost:5000"
```

**AI Microservice (ai-service/.env)**
```bash
PORT=8000
NODE_BACKEND_URL="http://localhost:5000/api"
```

## 13. Running the Application

Open 3 terminal windows:

### Terminal 1 — Node.js Backend Server
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
npm run dev
# Server running on http://localhost:5000
```

### Terminal 2 — React Frontend Client
```bash
cd frontend
npm install
npm run dev
# Vite client running on http://localhost:5173
```

### Terminal 3 — Python Agentic AI Service
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
# AI Microservice running on http://localhost:8000
```

## 14. Testing & Evaluation Walkthrough

Pre-seeded evaluation credentials (password for all: `password123`):
- `rahul@abc.com` — Org Admin (ABC Technologies / Hyderabad & XYZ Solutions)
- `priya@abc.com` — Tenant Admin (ABC Technologies / Hyderabad)
- `arjun@abc.com` — Member (ABC Technologies / Hyderabad)
- `sneha@abc.com` — Tenant Admin (ABC Technologies / Bangalore)
- `kiran@xyz.com` — Member (XYZ Solutions / Mumbai)

### Verification Steps:
1. **Live Synchronization:** Open Chrome (Rahul) and Incognito (Priya). Drag a task in Chrome; observe the card move in Incognito instantly without page refresh.
2. **Presence Tracking:** Observe the top-right pill display `2 online (R, P)` with live pulsing green dots.
3. **Tenant Isolation:** Switch Priya's branch to Bangalore. Move a task in Hyderabad; verify Bangalore receives zero socket broadcasts.
4. **Optimistic Locking:** Open the same task in both windows. Save in Window 1 (v1 → v2). Attempt save in Window 2; verify `HTTP 409 Conflict` banner is returned.
5. **Undo / Redo:** Move a task and press `Ctrl + Z`. Observe instant rollback with toast feedback. Press `Ctrl + Y` to redo.
6. **Agentic AI:** Click `✨ AI Assistant` in the top right. Click `📊 Summarize Progress`; observe real-time completion rates calculated directly from PostgreSQL.

## 15. Known Limitations & Trade-offs

- **Single-Node Socket.IO:** Presence tracking currently relies on in-memory server state. Horizontal scaling across multi-server Kubernetes clusters would require the `@socket.io/redis-adapter` Pub/Sub layer.
- **Optimistic Locking vs. CRDTs:** We chose optimistic locking (rejection + state refresh) to guarantee strict relational consistency. Collaborative text editing (like Google Docs) within task descriptions would benefit from Conflict-Free Replicated Data Types (CRDTs).

## 16. Future Enhancements

- **Redis Adapter Integration:** Enable multi-cluster horizontal scaling for Socket.IO.
- **Granular Webhook Subscriptions:** Webhook notifications for enterprise Slack, Discord, and Microsoft Teams.
- **Autonomous Backlog AI Agent:** Allow the AI service to suggest priority re-ordering based on historical branch velocity and sprint deadlines.

## 17. License

This project was developed for the **JulleyOnline Forward Deployed Engineer (FDE) Intern Assignment**.  
Licensed under the MIT License.