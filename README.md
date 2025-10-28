# Strava MCP Server

Strava APIとMCP（Model Context Protocol）を統合するサーバーです。

このMCPサーバーを使用することで、ClaudeなどのAIアシスタントから直接Stravaのアクティビティデータを取得・分析できます。ランニングやサイクリングの記録を会話形式で確認したり、統計情報を簡単に照会できます。

## 📦 対応クライアント

このMCPサーバーは以下のクライアントで使用できます：

- ✅ **Claude Desktop** - Anthropic公式デスクトップアプリ
- ✅ **Cursor** - AI統合コードエディタ
- ✅ **Manus** - AIアシスタントプラットフォーム
- ✅ **Dify** - ノーコードAIアプリケーションプラットフォーム
- ⚠️ **ChatGPT（開発モード）** - Custom GPT Actions 経由（HTTPラッパーが必要）

## インストール

### npmからインストール

```bash
npm install -g @keitaro_aigc/strava-mcp-server
```

またはプロジェクトローカルに：

```bash
npm install @keitaro_aigc/strava-mcp-server
```

### ソースからビルド

```bash
git clone https://github.com/yourusername/strava-mcp-server.git
cd strava-mcp-server
npm install
npm run build
```

## 主な機能

このMCPサーバーは以下のツールを提供します：

### 1. `get_activities` - アクティビティ一覧の取得
最近のランニング、サイクリング、水泳などのアクティビティ一覧を取得します。
- **パラメータ**:
  - `page` (オプション): ページ番号（デフォルト: 1）
  - `per_page` (オプション): 1ページあたりの件数（デフォルト: 30、最大: 200）
- **取得できる情報**: アクティビティ名、距離、時間、平均速度、獲得標高など

### 2. `get_activity` - 特定アクティビティの詳細取得
指定したアクティビティIDの詳細情報を取得します。
- **パラメータ**:
  - `activity_id` (必須): アクティビティのID
- **取得できる情報**: 詳細な統計、ラップタイム、心拍数、パワーデータなど

### 3. `get_athlete` - アスリートプロフィールの取得
認証されたアスリート（自分自身）のプロフィール情報を取得します。
- **取得できる情報**: 名前、体重、所在地、性別など

### 4. `get_athlete_stats` - 統計情報の取得
アスリートの累計統計や最近の統計を取得します。
- **パラメータ**:
  - `athlete_id` (必須): アスリートのID
- **取得できる情報**: 累計距離、累計時間、最近4週間の統計、今年の統計など

## セットアップ

### 前提条件

- Node.js 18以上がインストールされていること
- Stravaアカウントを持っていること
- Claude DesktopまたはMCP対応クライアントがインストールされていること

### ステップ1: Strava APIの認証情報を取得

Strava APIを使用するには、アプリケーションを作成してAPI認証情報を取得する必要があります。

#### 1.1 Stravaアプリケーションの作成

1. [Strava API設定ページ](https://www.strava.com/settings/api)にアクセス
2. 「Create App」または「My API Application」をクリック
3. 以下の情報を入力：
   - **Application Name**: 任意の名前（例：「My MCP Server」）
   - **Category**: 適切なカテゴリを選択
   - **Club**: 空欄でOK
   - **Website**: 任意のURL（例：`http://localhost`）
   - **Authorization Callback Domain**: `localhost`
   - **Application Description**: 任意の説明
4. 利用規約に同意して「Create」をクリック

#### 1.2 Client IDとClient Secretの確認

アプリケーションを作成すると、以下の情報が表示されます：
- **Client ID**: 数字の羅列（例：123456）
- **Client Secret**: 英数字の文字列（例：abc123def456）

これらをメモしておいてください。

#### 1.3 Refresh Tokenの取得

1. 以下のURLをブラウザで開いてください（`YOUR_CLIENT_ID`を実際のClient IDに置き換える）：

```
https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=activity:read_all
```

2. Stravaにログインして「Authorize」をクリック
3. リダイレクト後のURL（`http://localhost/?...`）のアドレスバーから`code`パラメータの値をコピー
   - 例：`http://localhost/?code=abc123xyz789`の場合、`abc123xyz789`をコピー

4. ターミナルで以下のコマンドを実行（各値を実際の値に置き換える）：

```bash
curl -X POST https://www.strava.com/oauth/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d code=YOUR_CODE \
  -d grant_type=authorization_code
```

5. レスポンスに含まれる`refresh_token`の値をメモ：

```json
{
  "access_token": "...",
  "refresh_token": "abc123...",  ← この値をメモ
  "expires_at": 1234567890
}
```

### ステップ2: Claude Desktopでの設定

Claude Desktopの設定ファイル（`claude_desktop_config.json`）に以下を追加：

#### macOS

1. Claude Desktopの設定ファイルを開く：

```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

2. 以下の内容を追加（既存の設定がある場合は`mcpServers`セクションに追加）：

```json
{
  "mcpServers": {
    "strava": {
      "command": "npx",
      "args": ["-y", "@keitaro_aigc/strava-mcp-server"],
      "env": {
        "STRAVA_CLIENT_ID": "your_client_id",
        "STRAVA_CLIENT_SECRET": "your_client_secret",
        "STRAVA_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

4. Claude Desktopを再起動

5. Claude Desktopの右下に🔨マークが表示され、「strava」が利用可能になっていることを確認

##### Windows

1. Claude Desktopの設定ファイルを開く：

```bash
notepad %APPDATA%\Claude\claude_desktop_config.json
```

2. macOSと同じJSON設定を追加

3. 各値を実際の値に置き換え

4. Claude Desktopを再起動

5. 🔨マークで「strava」が利用可能になっていることを確認

### ステップ2-B: Cursor での設定

Cursor エディタで使用する場合：

#### 設定ファイルの場所

- **macOS/Linux**: `~/.cursor/mcp.json`
- **Windows**: `%APPDATA%\Cursor\User\mcp.json`

#### 設定手順

1. 設定ファイルを作成または編集：

```bash
# macOS/Linux
mkdir -p ~/.cursor
nano ~/.cursor/mcp.json

# Windows
mkdir %APPDATA%\Cursor\User
notepad %APPDATA%\Cursor\User\mcp.json
```

2. 以下の内容を追加：

```json
{
  "mcpServers": {
    "strava": {
      "command": "npx",
      "args": ["-y", "@keitaro_aigc/strava-mcp-server"],
      "env": {
        "STRAVA_CLIENT_ID": "your_client_id",
        "STRAVA_CLIENT_SECRET": "your_client_secret",
        "STRAVA_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

3. 各値を実際の認証情報に置き換え

4. Cursor を再起動

5. Cursor の AI チャットで MCP ツールが利用可能になっていることを確認

### ステップ2-C: Manus での設定

Manus で使用する場合：

#### 設定手順

1. Manus の設定画面を開く

2. MCP サーバー設定セクションに移動

3. 新しいサーバーを追加：

```json
{
  "name": "strava",
  "command": "npx",
  "args": ["-y", "@keitaro_aigc/strava-mcp-server"],
  "env": {
    "STRAVA_CLIENT_ID": "your_client_id",
    "STRAVA_CLIENT_SECRET": "your_client_secret",
    "STRAVA_REFRESH_TOKEN": "your_refresh_token"
  }
}
```

4. 設定を保存

5. Manus を再起動してツールを有効化

### ステップ2-D: Dify での設定

Dify プラットフォームで使用する場合：

#### セルフホスト版の場合

1. Dify の `docker-compose.yml` に環境変数を追加：

```yaml
services:
  api:
    environment:
      # 既存の環境変数...
      STRAVA_CLIENT_ID: "your_client_id"
      STRAVA_CLIENT_SECRET: "your_client_secret"
      STRAVA_REFRESH_TOKEN: "your_refresh_token"
```

2. MCP サーバーをカスタムツールとして登録：

```json
{
  "tool_name": "strava_mcp",
  "command": "npx -y @keitaro_aigc/strava-mcp-server",
  "type": "mcp"
}
```

3. Docker コンテナを再起動：

```bash
docker-compose down
docker-compose up -d
```

#### クラウド版の場合

1. Dify のワークスペース設定を開く

2. 「カスタムツール」セクションに移動

3. 新しい MCP ツールを追加し、エンドポイント情報を設定

**注意**: クラウド版では MCP サーバーを別途ホスティングする必要がある場合があります。

### ステップ2-E: ChatGPT（開発モード）での設定

ChatGPT の開発モード（Actions/Functions）で使用する場合：

#### 前提条件

- ChatGPT Plus または Enterprise アカウント
- カスタム GPT の作成権限

#### 設定手順

1. ChatGPT で「GPTs」→「Create a GPT」を選択

2. 「Configure」タブで Actions を追加

3. MCP サーバーを API エンドポイントとしてホスティング（例：Vercel、AWS Lambda など）

4. OpenAPI スキーマを定義：

```yaml
openapi: 3.0.0
info:
  title: Strava MCP Server
  version: 1.0.0
servers:
  - url: https://your-deployment-url.com
paths:
  /get_activities:
    post:
      summary: Get athlete activities
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                page:
                  type: integer
                per_page:
                  type: integer
      responses:
        '200':
          description: Success
  /get_activity:
    post:
      summary: Get specific activity
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                activity_id:
                  type: integer
              required:
                - activity_id
      responses:
        '200':
          description: Success
```

5. 環境変数を Actions の設定で追加

**注意**: ChatGPT での使用には MCP サーバーの HTTP ラッパーが必要です。直接的な STDIO 接続はサポートされていません。

### ステップ3: 動作確認

各クライアントで以下のように質問してみてください：

#### Claude Desktop / Cursor / Manus

```
最近のアクティビティを5件教えて
```

#### Dify

ワークフロー内で Strava MCP ツールを呼び出し、パラメータを指定して実行。

#### ChatGPT

カスタム GPT 内でアクションが利用可能になっていることを確認。

Stravaのデータが表示されれば、セットアップ完了です！🎉

### トラブルシューティング

#### エラー: "Failed to refresh access token"
- Client ID、Client Secret、Refresh Tokenが正しいか確認
- Stravaアプリケーションのステータスが「Active」になっているか確認

#### ツールが表示されない
- Claude Desktopを完全に再起動（メニューから終了して再度起動）
- 設定ファイルのJSON形式が正しいか確認（カンマの位置、閉じ括弧など）

#### "command not found" エラー
- Node.js 18以上がインストールされているか確認：`node -v`
- npmが正しくインストールされているか確認：`npm -v`

---

## ローカル開発・ビルドからの使用

npm経由ではなく、ソースコードからビルドして使用する場合：

### 1. リポジトリのクローンとビルド

```bash
git clone https://github.com/groundcobra009/strava-mcp-server.git
cd strava-mcp-server
npm install
npm run build
```

### 2. Claude Desktop設定（ローカルビルド版）

#### macOS

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

#### Windows（ローカルビルド版）

```json
{
  "mcpServers": {
    "strava": {
      "command": "node",
      "args": ["C:\\path\\to\\strava-mcp-server\\dist\\index.js"],
      "env": {
        "STRAVA_CLIENT_ID": "your_client_id",
        "STRAVA_CLIENT_SECRET": "your_client_secret",
        "STRAVA_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

**注意**: `C:\\path\\to\\strava-mcp-server\\`の部分は実際のクローンしたディレクトリパスに置き換えてください。

### 3. 環境変数の設定（ローカル開発用）

ローカル開発では`.env`ファイルを使用することもできます：

```bash
cp .env.example .env
# .envファイルを編集して認証情報を設定
```

---

## npm公開手順（開発者向け）

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

### 基本的な使い方

Claude Desktopや他のMCP対応クライアントで、以下のような自然な会話でStravaデータにアクセスできます：

#### 例1: 最近のアクティビティを確認
```
あなた: 「最近のランニング記録を10件見せて」

Claude: get_activitiesツールを使用して、最近のアクティビティ10件を取得します...
        
        1. 朝ラン - 5.2km, 26分15秒, 平均ペース 5:03/km
        2. 夜ラン - 10.5km, 52分30秒, 平均ペース 5:00/km
        ...
```

#### 例2: 特定のアクティビティを詳しく分析
```
あなた: 「昨日のランニング（ID: 12345678）の詳細を教えて」

Claude: get_activityツールで詳細を取得します...
        
        アクティビティ: モーニングラン
        距離: 10.5km
        タイム: 52分30秒
        平均ペース: 5:00/km
        獲得標高: 85m
        平均心拍数: 152bpm
        最大心拍数: 172bpm
```

#### 例3: 統計情報の確認
```
あなた: 「今月の走行距離の合計は？」

Claude: get_athlete_statsツールで統計情報を取得します...
        
        今年の累計:
        - 総距離: 245.8km
        - 総時間: 20時間35分
        - アクティビティ数: 28回
        
        最近4週間:
        - 総距離: 82.3km
        - 総時間: 6時間52分
```

#### 例4: プロフィール情報の確認
```
あなた: 「私のStravaプロフィールを見せて」

Claude: get_athleteツールでプロフィール情報を取得します...
        
        名前: Taro Yamada
        所在地: Tokyo, Japan
        体重: 65kg
        登録日: 2020年1月15日
```

### 応用的な使い方

#### データ分析
```
あなた: 「先月と今月のランニング距離を比較して、改善点を教えて」

Claude: 統計データを取得して分析します...
```

#### トレーニング計画
```
あなた: 「最近のペースの傾向から、来週のトレーニングメニューを提案して」

Claude: アクティビティデータを分析してトレーニングプランを提案します...
```

#### モチベーション管理
```
あなた: 「今年の目標1000kmに対して、現在の進捗率と達成見込みは？」

Claude: 累計統計から進捗を計算します...
```

## 開発者向け情報

### ローカル開発

開発モード（ウォッチモード）でコードを編集する場合：

```bash
# ウォッチモードで自動ビルド
npm run dev

# 別ターミナルでテスト実行
node dist/index.js
```

### プロジェクト構造

```
.
├── src/
│   └── index.ts          # メインのMCPサーバー実装
├── dist/                  # TypeScriptビルド出力（自動生成）
├── package.json          # npmパッケージ設定
├── tsconfig.json         # TypeScript設定
├── .env.example          # 環境変数テンプレート
├── .gitignore           # Git除外ファイル
├── .npmignore           # npm公開除外ファイル
├── LICENSE              # MITライセンス
└── README.md            # ドキュメント
```

### 使用技術

- **TypeScript 5.3+**: 型安全なコード
- **MCP SDK 0.5+**: Model Context Protocolの公式 SDK
- **Axios**: HTTPリクエストライブラリ
- **dotenv**: 環境変数管理
- **Node.js 18+**: 実行環境

### 貪献

プルリクエストやイシューの報告を歓迎します！

1. このリポジトリをFork
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをPush (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

### リンク

- **npmパッケージ**: https://www.npmjs.com/package/@keitaro_aigc/strava-mcp-server
- **GitHubリポジトリ**: https://github.com/groundcobra009/strava-mcp-server
- **Strava APIドキュメント**: https://developers.strava.com/
- **MCP公式ドキュメント**: https://modelcontextprotocol.io/

## ライセンス

MIT
