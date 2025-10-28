# Strava MCP Server

Strava APIとMCP（Model Context Protocol）を統合するサーバーです。

## インストール

### npmからインストール（公開後）

```bash
npm install -g @keitaro/strava-mcp-server
```

またはプロジェクトローカルに：

```bash
npm install @keitaro/strava-mcp-server
```

### ソースからビルド

```bash
git clone https://github.com/yourusername/strava-mcp-server.git
cd strava-mcp-server
npm install
npm run build
```

## 機能

このMCPサーバーは以下のツールを提供します：

- `get_activities` - アスリートのアクティビティ一覧を取得
- `get_activity` - 特定のアクティビティの詳細情報を取得
- `get_athlete` - 認証されたアスリートのプロフィール情報を取得
- `get_athlete_stats` - アスリートの統計情報を取得

## セットアップ

### 1. Strava APIの認証情報を取得

1. [Strava API設定ページ](https://www.strava.com/settings/api)にアクセス
2. アプリケーションを作成
3. Client IDとClient Secretを取得
4. 以下のURLでOAuth認証を実行してRefresh Tokenを取得：

```
https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=activity:read_all
```

5. リダイレクト後のURLから`code`パラメータを取得
6. 以下のコマンドでRefresh Tokenを取得：

```bash
curl -X POST https://www.strava.com/oauth/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d code=YOUR_CODE \
  -d grant_type=authorization_code
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`を作成：

```bash
cp .env.example .env
```

`.env`ファイルに認証情報を設定：

```
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REFRESH_TOKEN=your_refresh_token
```

### 3. Claude Desktop での設定

Claude Desktopの設定ファイル（`claude_desktop_config.json`）に以下を追加：

#### グローバルインストールの場合

##### macOS

`~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "strava": {
      "command": "npx",
      "args": ["-y", "@keitaro/strava-mcp-server"],
      "env": {
        "STRAVA_CLIENT_ID": "your_client_id",
        "STRAVA_CLIENT_SECRET": "your_client_secret",
        "STRAVA_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

##### Windows

`%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "strava": {
      "command": "npx",
      "args": ["-y", "@keitaro/strava-mcp-server"],
      "env": {
        "STRAVA_CLIENT_ID": "your_client_id",
        "STRAVA_CLIENT_SECRET": "your_client_secret",
        "STRAVA_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

#### ローカルビルドの場合

##### macOS

`~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "strava": {
      "command": "node",
      "args": ["/Users/keitaro/🏀｜TRAE/20251028strava-mcp/dist/index.js"],
      "env": {
        "STRAVA_CLIENT_ID": "your_client_id",
        "STRAVA_CLIENT_SECRET": "your_client_secret",
        "STRAVA_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

##### Windows

`%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "strava": {
      "command": "node",
      "args": ["C:\\path\\to\\20251028strava-mcp\\dist\\index.js"],
      "env": {
        "STRAVA_CLIENT_ID": "your_client_id",
        "STRAVA_CLIENT_SECRET": "your_client_secret",
        "STRAVA_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

## npm公開手順

## npm公開手順

このパッケージをnpmに公開するには以下の手順を実行します：

### 1. npmアカウントの作成とログイン

```bash
# npmアカウントがない場合は作成
npm adduser

# すでにアカウントがある場合はログイン
npm login
```

### 2. package.jsonの設定を確認

- `name`: パッケージ名（スコープ付きの場合は `@username/package-name`）
- `version`: バージョン番号（セマンティックバージョニング）
- `repository`: GitHubリポジトリURL
- `author`: 作者情報

### 3. ビルドとテスト

```bash
# ビルド
npm run build

# パッケージ内容を確認
npm pack --dry-run
```

### 4. npm公開

```bash
# スコープ付きパッケージの場合は公開アクセスを設定
npm publish --access public

# 通常のパッケージの場合
npm publish
```

### 5. バージョン更新（次回以降）

```bash
# パッチバージョンアップ（1.0.0 -> 1.0.1）
npm version patch

# マイナーバージョンアップ（1.0.0 -> 1.1.0）
npm version minor

# メジャーバージョンアップ（1.0.0 -> 2.0.0）
npm version major

# 再公開
npm publish --access public
```

### 注意事項

- `package.json`の`name`を自分のnpmユーザー名でスコープ化してください（例：`@yourusername/strava-mcp-server`）
- `repository`のURLを実際のGitHubリポジトリURLに変更してください
- 一度公開したバージョンは削除できません（24時間以内のみ可能）
- `.npmignore`でソースコードや不要なファイルを除外済みです

## 使用例

Claude Desktopでの使用例：

```
「最近のアクティビティを10件取得して」
→ get_activitiesツールを使用

「アクティビティID 12345678の詳細を教えて」
→ get_activityツールを使用

「私のプロフィール情報を教えて」
→ get_athleteツールを使用

「私の統計情報を見せて」
→ get_athlete_statsツールを使用
```

## 開発

開発モード（ウォッチモード）：

```bash
npm run dev
```

## ライセンス

MIT
