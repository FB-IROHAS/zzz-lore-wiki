# ZZZ Lore Wiki

VitePress で通常の Wiki を生成し、Cloudflare Workers Static Assets で静的配信します。管理画面は `/admin/` に配置し、同一 origin の Worker API `/api/admin/*` から GitHub と R2 を更新します。

## 構成

```text
VitePress build: docs/.vitepress/dist
        |
        +-- 通常 Wiki ページ
        +-- /admin/ 管理 UI
                |
                +-- /api/admin/* Cloudflare Worker
```

このリポジトリでは Pages Functions は使いません。`functions/` 配下にあった Pages Functions 形式の API は、`src/worker.ts` と `src/admin.ts` に統合しました。

## なぜ本番で管理 API が動いていなかったか

以前の管理 API は `functions/api/admin/...` の `PagesFunction` として実装されていました。一方で現在の公開 URL は `*.workers.dev` で、リポジトリには Workers Static Assets 用の `wrangler.toml` と Worker entrypoint がありませんでした。そのため Workers としてデプロイされた環境では Pages Functions の API が存在せず、管理画面が `/api/admin/*` へアクセスしても静的 404 HTML が返り、固定文言の「Cloudflare Pages Functions が動かないため...」が表示されていました。

## Cloudflare 側で設定する項目

Cloudflare Access で以下を保護してください。独自ログインフォームやフロントエンドだけの管理者判定は使いません。

- `/admin/*`
- `/api/admin/*`

Worker の variables / secrets:

- `ADMIN_EMAIL`: 管理者として許可する Cloudflare Access のメールアドレス
- `GITHUB_TOKEN`: 記事を更新する GitHub token
- `GITHUB_OWNER`: 既定値 `irohas3074`
- `GITHUB_REPO`: 既定値 `zzz-lore-wiki`
- `GITHUB_BRANCH`: 既定値 `main`
- `CLOUDFLARE_DEPLOY_HOOK_URL`: 保存後に別デプロイを起動したい場合のみ
- `PUBLIC_IMAGE_BASE_URL`: R2 画像の公開 base URL
- `MAINTENANCE_MODE`: `true` にすると通常 Wiki 閲覧を 503 にし、管理画面のみ管理者確認後に表示
- `MAINTENANCE_MESSAGE`: メンテナンス画面に表示する任意メッセージ

画像アップロードを使う場合は R2 binding を追加してください。

```toml
[[r2_buckets]]
binding = "ADMIN_IMAGES_BUCKET"
bucket_name = "your-r2-bucket"
```

`ADMIN_DEV_BYPASS` はローカル `wrangler dev` 用です。本番に設定しないでください。ローカルでは `.dev.vars.example` を参考に `.dev.vars` を作成します。

## ローカル開発

通常の Wiki 表示だけ確認する場合:

```bash
npm run docs:dev
```

Worker API と Static Assets を合わせて確認する場合:

```bash
copy .dev.vars.example .dev.vars
npm run dev:cloudflare
```

`dev:cloudflare` は先に VitePress をビルドし、`wrangler dev` で `docs/.vitepress/dist` と Worker API を同時に起動します。

## 本番デプロイ

```bash
npm run deploy
```

このコマンドは VitePress をビルドしてから `wrangler deploy` を実行します。

Cloudflare の Git 連携でデプロイする場合は、`wrangler deploy` を直接 deploy command にしないでください。`docs/.vitepress/dist` は git に含めないため、先に VitePress build が必要です。

推奨設定:

```text
Build command: npm run docs:build
Deploy command: npx wrangler deploy
```

または deploy command だけ指定できる画面では、以下を指定してください。

```text
Deploy command: npm run deploy:cloudflare
```

## 管理APIが見つかりません と表示される場合

管理画面は同一 origin の `/api/admin/*` を呼びます。この表示は、認証失敗ではなく「その URL に Worker API が存在しない」時に出ることが多いです。

確認項目:

- Cloudflare の Deploy command が `npm run deploy:cloudflare`、または `npm run docs:build` の後に `npx wrangler deploy` になっている
- `wrangler.toml` の `[assets]` が `docs/.vitepress/dist` を指している
- `wrangler.toml` の `main = "src/worker.ts"` が反映された状態で deploy されている
- Cloudflare Access で `/admin/*` だけでなく `/api/admin/*` も保護している
- `vitepress dev` ではなく、API も確認するときは `npm run dev:cloudflare` を使っている

Cloudflare 側で `wrangler deploy` だけを直接実行すると、VitePress の build output が作られず、また Worker API ではなく静的ファイルだけの状態になることがあります。
