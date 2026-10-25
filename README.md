# OnyxAI

A multi-agent AI assistant. You chat with it, and a router decides which specialised agent should answer: general chat, web search, coding, image generation, PDF or PowerPoint generation, or questions about an uploaded PDF or image. Usage is metered with credits, and paid plans are handled through Stripe.

## Features

- **Automatic agent routing**: a LangGraph state graph picks an agent for each message. Uploaded PDFs go to the PDF RAG agent and uploaded images go to the image analyzer. Everything else is classified by an LLM. Users can also pick an agent themselves.
- **Agents**
  | Agent | What it does |
  | --- | --- |
  | `chat` | General conversation and explanations |
  | `search` | Live web search via Tavily, then answered by `chat` |
  | `coding` | Code generation and debugging, shown in a Monaco-based artifact editor with preview |
  | `vision` | Image generation |
  | `pdf` | Generates downloadable PDF documents |
  | `ppt` | Generates PowerPoint decks |
  | `pdfRag` | Answers questions about an uploaded PDF (Qdrant + Gemini embeddings) |
  | `imageAnalyzer` | Describes and answers questions about an uploaded image (Gemini) |
- **Conversation memory**: up to the last 20 messages of each conversation are cached in Redis.
- **Rate limiting**: per-user, per-agent limits per minute, enforced in Redis.
- **Credits and billing**: Free, Starter and Pro plans with monthly credits, Stripe Checkout, the Stripe customer portal and webhooks.
- **Auth**: Google sign-in with Firebase. The backend verifies the token and issues a session cookie.

## Architecture

```
                 ┌──────────────┐
  React (Vite) ──►   Gateway    │  :8000   CORS, cookie auth, request proxying
                 └──────┬───────┘
        ┌───────────┬───┴────────┬─────────────┐
        ▼           ▼            ▼             ▼
     Auth :8001  Chat :8002   Agent :8003   Billing :8004
     Firebase    conversations LangGraph     Stripe, plans,
     Admin       and messages  agents        credits
        │           │            │             │
        └───────────┴──── MongoDB ─────────────┘
                     Redis (memory, rate limits)
                     Qdrant (PDF vectors) · S3 (generated files)
```

| Path | Description |
| --- | --- |
| [frontend/](frontend/) | React 19, TypeScript, Vite, Tailwind CSS v4, Redux Toolkit |
| [backend/gateway/](backend/gateway/) | Express API gateway. Routes `/api/auth`, `/api/chat`, `/api/agent` and `/api/billing` to the services |
| [backend/services/auth/](backend/services/auth/) | Login and logout, user model |
| [backend/services/chat/](backend/services/chat/) | Conversations and message storage |
| [backend/services/agent/](backend/services/agent/) | LangGraph router and agents, file uploads, S3 and Qdrant |
| [backend/services/billing/](backend/services/billing/) | Stripe checkout, portal, webhook, subscriptions and credits |
| [backend/shared/](backend/shared/) | Shared Redis client and types |

### Gateway routes

| Route | Auth | Forwards to |
| --- | --- | --- |
| `/api/auth/*` | public | auth service |
| `/api/chat/*` | session | chat service |
| `/api/agent/*` | session | agent service |
| `/api/billing/webhook` | public (Stripe) | billing service |
| `/api/billing/*` | session | billing service |
| `/api/getCurrentUser` | session | gateway |

## Getting started

### Prerequisites

- Node.js 23.6 or later. The services run `.ts` files directly with `node`, which relies on native TypeScript type stripping.
- Docker, to run Redis
- MongoDB and Qdrant instances, local or hosted
- Accounts and API keys for Firebase, Stripe, Groq, Google AI (Gemini), OpenRouter, Tavily and AWS S3

### 1. Install dependencies

```bash
# shared backend deps (envalid, ioredis)
cd backend && npm install

# each service
for dir in gateway services/auth services/chat services/agent services/billing; do
  (cd "$dir" && npm install)
done

# frontend
cd ../frontend && npm install
```

### 2. Start Redis

```bash
cd backend
docker compose up -d
```

### 3. Configure environment variables

Each service reads its own `.env` file through `dotenv` and validates it with `envalid`, so a missing variable stops the service at startup.

**`backend/gateway/.env`**
```env
PORT=8000
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173
AUTH_SERVICE=http://localhost:8001
CHAT_SERVICE=http://localhost:8002
AGENT_SERVICE=http://localhost:8003
BILLING_SERVICE=http://localhost:8004
```

**`backend/services/auth/.env`**
```env
PORT=8001
MONGODB_URI=
REDIS_URL=redis://localhost:6379
```
The auth service also needs a Firebase Admin service account key at `backend/services/auth/serviceAccountKey.json`. Download it from Firebase Console → Project settings → Service accounts. It is gitignored, so do not commit it.

**`backend/services/chat/.env`**
```env
PORT=8002
MONGODB_URI=
```

**`backend/services/agent/.env`**
```env
PORT=8003
MONGODB_URI=
REDIS_URL=redis://localhost:6379
CHAT_SERVICE=http://localhost:8002
BILLING_SERVICE=http://localhost:8004

GROQ_API_KEY=
GOOGLE_API_KEY=
OPENROUTER_API_KEY=
TAVILY_API_KEY=

QDRANT_URL=http://localhost:6333

AWS_REGION=
AWS_ACCESS_KEY=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET=
```

**`backend/services/billing/.env`**
```env
PORT=8004
MONGODB_URI=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
FRONTEND_URL=http://localhost:5173
```

**`frontend/.env`**
```env
VITE_SERVER_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=
```

### 4. Set up Stripe plans

Create recurring prices in the Stripe Dashboard with these lookup keys (see [Plans.ts](backend/services/billing/config/Plans.ts)):

| Plan | Price | Credits per 30 days | Lookup key |
| --- | --- | --- | --- |
| Free | $0 | 100 | none |
| Starter | $10 | 500 | `onyx_starter_monthly` |
| Pro | $30 | 1000 | `onyx_pro_monthly` |

To receive webhooks locally, forward them through the gateway:

```bash
stripe listen --forward-to localhost:8000/api/billing/webhook
```

### 5. Run everything

Start each backend service in its own terminal:

```bash
cd backend/gateway && npm run dev
cd backend/services/auth && npm run dev
cd backend/services/chat && npm run dev
cd backend/services/agent && npm run dev
cd backend/services/billing && npm run dev
```

Then start the frontend:

```bash
cd frontend && npm run dev
```

Open http://localhost:5173.

## Docker

Every backend service has its own Dockerfile. Build them from the `backend/` directory, because the images copy in `shared/`:

```bash
cd backend
docker build -f gateway/Dockerfile -t gateway .
docker build -f services/agent/Dockerfile -t agent .
# same pattern for auth, chat, billing
```

## Deployment

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) runs on every push to `main`:

1. **Backend**: builds the five service images, pushes them to Amazon ECR and forces a new deployment of each ECS service. The workflow recreates the Firebase `serviceAccountKey.json` from a secret before it builds the auth image.
2. **Frontend**: builds the Vite app, syncs `frontend/dist` to S3 and invalidates the CloudFront distribution.

Required GitHub secrets:

`AWS_REGION`, `AWS_ACCOUNT_ID`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `ECS_CLUSTER`, `GATEWAY_SERVICE`, `AUTH_SERVICE`, `CHAT_SERVICE`, `AGENT_SERVICE`, `BILLING_SERVICE`, `FIREBASE_SERVICE_ACCOUNT`, `VITE_FIREBASE_API_KEY`, `VITE_SERVER_URL`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`

The ECS task definitions supply runtime environment variables for each service. They are not part of the workflow.

## Tech stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Redux Toolkit, React Router, Monaco Editor, react-markdown, Motion, Firebase Auth

**Backend:** Node.js, Express, TypeScript, LangChain and LangGraph, MongoDB (Mongoose), Redis (ioredis), Qdrant, AWS S3, Stripe, Firebase Admin

**LLMs:** Groq (`gpt-oss-120b`), Google Gemini (image analysis and embeddings), OpenRouter (coding, falling back to Groq), Tavily (search)
