# Contributing to mycms

mycms への貢献を歓迎します！

## Development Setup

1. Fork & clone this repository
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in values
4. `npm run db:generate && npm run db:migrate`
5. `npm run dev`

## Architecture

このプロジェクトは **Vertical Slice Architecture (VSA)** を採用しています。

### ディレクトリ構造

- `src/features/{feature}/{slice}/` - 各機能のスライス
- `src/shared/` - 2つ以上の feature で共有されるコード
- `src/infrastructure/` - 認証・サービス管理
- `src/app/` - ルーティングのみ (ビジネスロジック禁止)

### コーディング規約

- TypeScript strict mode
- Server Components 優先
- TSDoc は日本語
- shadcn/ui コンポーネントは `@/shared/ui/` からインポート
- Zod でバリデーション
- Server Actions に "use server" ディレクティブ

## Pull Requests

1. Feature ブランチを作成: `git checkout -b feat/my-feature`
2. 変更をコミット
3. PR を作成
4. CI が通ることを確認

## License

MIT
