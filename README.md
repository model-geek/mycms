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

Edit `.env.local` with the values obtained below:
```
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3000"
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### `DATABASE_URL` の取得

**Supabase Cloud の場合:**
1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. **Project Settings → Database → Connection string** を開く
3. **Transaction Pooling** (ポート `6543`) の接続文字列をコピー
4. `[YOUR-PASSWORD]` をプロジェクト作成時に設定した DB パスワードに置き換える

```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**Supabase CLI (ローカル開発) の場合:**
```bash
npx supabase start
```
デフォルトの接続文字列: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

#### `BETTER_AUTH_SECRET` の生成

セッション暗号化用のランダムな秘密鍵です。以下のコマンドで生成してください:

```bash
openssl rand -base64 32
```

32文字以上のランダム文字列であれば何でも使えます。本番環境では必ずユニークな値を設定してください。

#### `BLOB_READ_WRITE_TOKEN` の取得

メディアアップロードに Vercel Blob を使用します。

1. [Vercel](https://vercel.com) にプロジェクトをデプロイ (または Vercel CLI でリンク)
2. **Storage → Create → Blob Store** で Blob ストアを作成
3. Blob ストアをプロジェクトに接続すると `BLOB_READ_WRITE_TOKEN` が自動で環境変数に追加される
4. ローカル開発用には **Settings → Environment Variables** からトークンをコピーして `.env.local` に貼り付ける

> **Note:** メディア機能を使わない場合は空文字のままでも起動できます。

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
   - `DATABASE_URL` — Supabase の接続文字列 (Transaction Pooling モード, ポート `6543`)。取得方法は [上記](#database_url-の取得) を参照
   - `BETTER_AUTH_SECRET` — `openssl rand -base64 32` で生成したランダム文字列
   - `BLOB_READ_WRITE_TOKEN` — Vercel Blob ストアを作成すると自動設定される。デプロイ後に **Storage → Create → Blob Store** で作成・接続
3. Deploy!
4. デプロイ後、Supabase のマイグレーションを実行:
   ```bash
   # ローカルからリモート DB にマイグレーション適用
   npm run db:migrate
   ```

### Supabase Setup

1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. **Project Settings → Database → Connection string** から Transaction Pooling の接続文字列を取得
3. Vercel の環境変数に `DATABASE_URL` として設定
4. マイグレーションを実行: `npm run db:migrate`

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
