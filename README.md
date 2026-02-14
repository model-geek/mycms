# mycms

Open source headless CMS inspired by [microCMS](https://microcms.io). Deploy to Vercel + Supabase in minutes.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmodel-geek%2Fmycms&env=DATABASE_URL,BETTER_AUTH_SECRET,BLOB_READ_WRITE_TOKEN&envDescription=Required%20environment%20variables&project-name=mycms&repository-name=mycms)

## Features

- **microCMS 互換 REST API** - 既存の microCMS クライアントがそのまま使える
- **柔軟なスキーマ定義** - 13種のフィールド型 (テキスト, リッチエディタ, 画像, リレーション, 繰り返し等)
- **Draft/Publish ワークフロー** - 下書き → 公開 → バージョン管理
- **メディア管理** - Vercel Blob を使ったメディアライブラリ
- **Webhook** - HMAC-SHA256 署名付きイベント通知
- **マルチテナント** - 複数サービス (ワークスペース) を管理
- **RBAC** - owner / admin / editor / viewer の4段階権限
- **ダークモード対応** - shadcn/ui ベースの美しいUI

## Tech Stack

| 領域 | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) |
| UI | shadcn/ui + Tailwind CSS v4 |
| DB | Supabase PostgreSQL + Drizzle ORM |
| 認証 | BetterAuth |
| メディア | Vercel Blob |
| エディタ | Tiptap v3 |

## Quick Start

### Prerequisites

- Node.js 24+
- Supabase project (or local Supabase CLI)
- Vercel Blob store (for media)

### 1. Clone & Install

```bash
git clone https://github.com/model-geek/mycms.git
cd mycms
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3000"
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
npm run db:generate
npm run db:migrate
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Content API

microCMS 互換の REST API を提供します。

### Authentication

```
X-MYCMS-API-KEY: your-api-key
```

### Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/{serviceId}/{endpoint}` | コンテンツ一覧 |
| GET | `/api/v1/{serviceId}/{endpoint}/{id}` | コンテンツ取得 |
| POST | `/api/v1/{serviceId}/{endpoint}` | コンテンツ作成 |
| PUT | `/api/v1/{serviceId}/{endpoint}/{id}` | コンテンツ更新 |
| DELETE | `/api/v1/{serviceId}/{endpoint}/{id}` | コンテンツ削除 |

### Query Parameters

| Param | Description | Example |
|---|---|---|
| `limit` | 取得件数 (max 100) | `?limit=20` |
| `offset` | オフセット | `?offset=10` |
| `orders` | ソート順 | `?orders=-publishedAt` |
| `fields` | 取得フィールド | `?fields=title,body` |
| `filters` | フィルタ | `?filters=title[contains]Hello` |
| `q` | 全文検索 | `?q=検索ワード` |
| `draftKey` | 下書きプレビュー | `?draftKey=xxx` |

### Filter Syntax

```
title[equals]Hello
title[contains]検索[and]status[equals]active
category[equals]news[or]category[equals]blog
```

**Operators:** `equals`, `not_equals`, `contains`, `not_contains`, `less_than`, `greater_than`, `exists`, `not_exists`, `begins_with`

### Response Format

```json
{
  "contents": [
    {
      "id": "xxx",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "title": "Hello World",
      "body": "..."
    }
  ],
  "totalCount": 42,
  "limit": 10,
  "offset": 0
}
```

## Deploy to Vercel

1. Click the "Deploy with Vercel" button above
2. Set environment variables:
   - `DATABASE_URL` - Supabase connection string (Transaction Pooling mode)
   - `BETTER_AUTH_SECRET` - Random secret for auth
   - `BLOB_READ_WRITE_TOKEN` - Vercel Blob store token
3. Deploy!

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get the connection string from Settings → Database → Connection string (Transaction pooling)
3. Run migrations: `npm run db:migrate`

## Architecture

Vertical Slice Architecture (VSA) with PostgreSQL schema separation per feature.

```
src/
├── app/           # Routing (thin layer)
├── features/      # Feature slices
│   ├── content-hub/  # Schema + Content management
│   ├── media/        # Media library
│   ├── api-keys/     # API key management
│   ├── webhooks/     # Webhook management
│   └── members/      # Member management
├── infrastructure/   # Auth + Services
├── shared/           # Shared UI + utilities
└── db/               # Database client + migrations
```

## License

MIT
