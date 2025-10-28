
<create_mcp_server>
  <user_inputs>
    <mcp_name>YOUR_MCP_NAME_HERE</mcp_name>
    <tools_description>YOUR_TOOLS_DESCRIPTION_HERE</tools_description>
    <user_query>YOUR_QUERY_HERE</user_query>
    <install_dir>.</install_dir>
    <force_new_repo>false</force_new_repo>
  </user_inputs>

  <instructions>
  あなたはMCPサーバーを作成するAIアシスタントです。以下の要件で、**最初に新規リポジトリを作成・初期化**
  し、その中に必要ファイルを「新規作成」または「既存編集（上書き）」してください。

  [目的]
  - 汎用のMCPサーバー雛形を生成し、npx で実行可能・npm公開可能にする
  - ツールは <user_inputs.tools_description> に基づいて設計（I/Oスキーマ明示）
  - **.cursor/mcp.json は作成・編集しない（禁止）**

  [必須ファイル]
  - package.json（npm公開用・エントリ/バイナリ/スクリプト定義）
  - src/index.ts（メインMCPサーバーコード）
  - tsconfig.json（TypeScript設定）
  - README.md（セットアップ手順／英語のみ）

  [リポジトリ命名規則]
  - repo_name は <user_inputs.mcp_name> を元に kebab-case 化したものを推奨
    - 正規化: (1) 小文字化 → (2) 非 [a-z0-9] を "-" に置換 → (3) 連続 "-" を1つに圧縮 → (4) 先頭末尾の "-" を除去
    - 例: "My Awesome MCP" → "my-awesome-mcp"
  - name が未指定/空の場合は "universal-mcp-server" を使用

  [名称一貫性ルール（ゼロ・ドリフト・ポリシー）]
  - <user_inputs.mcp_name> から以下の**3種の正規名**を**必ず**導出し、すべての面で統一する:
    1) **CANONICAL_ID**（kebab-case）例: `deepresearch-mcp`  
       用途: npm package name / bin / repo名 / client設定のキー名 / MCPサーバーの name / 環境変数 MCP_NAME の既定値  
    2) **CANONICAL_DISPLAY**（PascalCase）例: `DeepResearch MCP`  
       用途: READMEタイトル / ドキュメント中の表示名 / UIに見せるラベル  
    3) **CANONICAL_CONST**（大文字スネーク）例: `DEEPRESEARCH_MCP`  
       用途: 環境変数のプレフィックスや例示
  - 原則: **キー/識別子には CANONICAL_ID を使用し、UIラベルのみ CANONICAL_DISPLAY を使用**
  - 旧名や異なるキー（例: `"DeepResearch"`）が残っていた場合は**削除または置換**して統一する
  - 注意: `.cursor/mcp.json` は対象外、生成・編集禁止

  [リポジトリ初期化（厳密手順）]
1) 作業ルートの決定
   - ルート = <user_inputs.install_dir>（既定 "."）
   - `force_new_repo === true` かつ ルートが**空ディレクトリ**（.git / package.json 等が無い）なら
     `mkdir <repo_name> && cd <repo_name>` を実行して新規作成。
   - 上記以外（既存リポがある／非空ディレクトリ／.git が存在）は **mkdir/cd を行わず**、
     現在のルート直下にファイルを生成する。

2) Git 初期化
   - ルート直下に `.git` が**無い場合のみ** `git init -b main`
     （不可なら `git init && git branch -M main`）。

3) `mkdir -p src`

4) [必須ファイル] を **ルート直下** に作成/編集

5) （任意）GitHub 連携:
   - リモート未設定時のみ `gh repo create …` または `git remote add origin …` を実行
  [ファイル操作ポリシー]
  - 既存は **編集**、なければ **新規作成**
  - 出力末尾で「FileOps Summary（JSON）」を提示（create|update を明示）
  - 出力は**最終版**のファイル全内容をコードブロックで示す
  - `.cursor/mcp.json` には触れない- 生成先は常に <user_inputs.install_dir>（既定 "."）。**親フォルダ（<repo_name>）は作成しない**。
  新規フォルダ作成は `force_new_repo=true` 且つ空ディレクトリの場合のみ許可。

  [技術仕様]
  - Node.js 18+
  - TypeScript
  - @modelcontextprotocol/sdk
  - dotenv（任意）
  - Provider-agnostic

  [手順]
  1) user_inputs から name/tools/query を確定  
  2) 名称正規化（CANONICAL_ID / DISPLAY / CONST）を導出  
  3) リポジトリを初期化（上記手順）  
  4) ファイル作成:
     - **package.json**  
       - `"name": "@your-scope/<CANONICAL_ID>"` または `<CANONICAL_ID>`  
       - `"bin": { "<CANONICAL_ID>": "./build/index.js" }`  
       - `"files": ["build"]`  
       - scripts: build, prepare  
       - engines.node >=18  
       - dependencies: @modelcontextprotocol/sdk, dotenv（任意）  
       - devDependencies: typescript, @types/node
     - **src/index.ts**  
       - `process.env.MCP_NAME ?? "<CANONICAL_ID>"` を利用  
       - Server生成＋tools登録＋STDIO接続  
       - ログは stderr  
     - **tsconfig.json**  
       - target ES2022, module ESNext, outDir=build, rootDir=src  
     - **README.md（英語必須）**  
       - Features / Requirements / Install & Run / Client Examples / Build / Publish / Tools / References  
       - **必須: Name Consistency & Troubleshooting セクション**を追加  
         - CANONICAL_ID をキー、CANONICAL_DISPLAY をラベルに使う表の掲載  
         - 古い名前が残った場合の cleanup 手順を記載  
         - 例: deepresearch-mcp / DeepResearch MCP の worked example を載せる  

  [README: Name Consistency & Troubleshooting (必須英語セクション例)]

  Name Consistency & Troubleshooting
  	•	Always use CANONICAL_ID (deepresearch-mcp) for identifiers and keys.
  	•	Use CANONICAL_DISPLAY (DeepResearch MCP) only for UI labels.
  	•	Do not mix different names across clients.

  Consistency Matrix:
  	•	npm package name → deepresearch-mcp
  	•	Binary name → deepresearch-mcp
  	•	MCP server name (SDK metadata) → deepresearch-mcp
  	•	Env default MCP_NAME → deepresearch-mcp
  	•	Client registry key → deepresearch-mcp
  	•	UI label → DeepResearch MCP

  Conflict Cleanup:
  	•	Remove any old entries like "DeepResearch" and re-add with "deepresearch-mcp".
  	•	Ensure global .mcp.json or client registries only use "deepresearch-mcp" for keys.
  	•	Cursor: configure in the UI only. This project does not include .cursor/mcp.json.

  Example:
  	•	Correct: "mcpServers": { "deepresearch-mcp": { "command": "npx", "args": ["@scope/deepresearch-mcp"] } }
  	•	Incorrect: "DeepResearch" as key (will conflict with "deepresearch-mcp").

  [検証コマンド例]
  - `node -v` (>=18)  
  - `npm install`  
  - `npm run build`  
  - `npx .` で実行テスト  
  - `npm pack --dry-run` で公開物確認

  [参考文献]
  - MCP SDK: https://modelcontextprotocol.io/docs/sdks
  - アーキテクチャ: https://modelcontextprotocol.io/docs/learn/architecture
  - サーバー概念: https://modelcontextprotocol.io/docs/learn/server-concepts
  - サーバー仕様: https://modelcontextprotocol.io/specification/2025-06-18/server/index

  [出力形式]
  - ファイル名ごとに最終版コードを提示
  - 最後に FileOps Summary を JSON で提示
  - `.cursor/mcp.json` には触れない

  [補足]
  - README は英語必須
  - Cursor は UI設定のみ
  - リポジトリ内に全ファイルを配置する


  --- ここから README 出力仕様の追記（Codex/TOML 対応込み） ---

  [README 出力仕様（絶対遵守）]

  目的:
  - README.md を英語で生成し、以下の固定セクション順・見出し・内容を満たすこと
  - ①の構造を踏襲しつつ、"Codex (TOML)" セクションを追加（②の形）
  - **.cursor/mcp.json はリポジトリに作らない**（README にサンプルとしての記載は可）

  必須プレースホルダ:
  - {CANONICAL_ID}        … kebab-case 例: deepresearch-mcp
  - {CANONICAL_DISPLAY}   … PascalCase + “ MCP” 例: DeepResearch MCP
  - {CANONICAL_CONST}     … UPPER_SNAKE 例: DEEPRESEARCH_MCP
  - {BIN_CMD}             … 実行コマンド（通常 {CANONICAL_ID} ）
  - {ENV_PREFIX}          … {CANONICAL_CONST} と同じ（環境変数の接頭辞）
  - {API_ENV_HINTS}       … 必要なら API Key など環境変数の列挙
  - {TOOLS_TABLE}         … 登録 tools の I/O スキーマ一覧
  - {EXAMPLE_TOOL_CALL}   … 代表ツールの JSON 実行例
  - {EXTRA_REFS}          … 参照リンク（MCP SDK/Architecture など）

  README セクション順（固定）:
  1) Title & Intro
     見出し: "# {CANONICAL_DISPLAY}"
     本文: “The Universal MCP Server …” の1–2文。tools_description を短く要約。

  2) Installation
     2.1 Prerequisites
         - "Node.js 18+"
         - "Set `{ENV_PREFIX}_...` in your environment"（必要変数を1–2個例示）
     2.2 Get an API key（必要なときのみ）
         - 箇条書きで「Where to request / Docs / Getting started」リンク（存在しない場合は省略可能と注記）
     2.3 Build locally
         ```bash
         cd /path/to/{CANONICAL_ID}
         npm i
         npm run build
         ```

  3) Setup: Claude Code (CLI)
     - ①と同じ “claude mcp add …” の1行例。ENV は `{ENV_PREFIX}_...` で表記。
     - remove コマンド例も記載。

  4) Setup: Cursor  ※**注意: リポジトリには .cursor/mcp.json を置かない**
     - README にはサンプル JSON のみ記載（①同様）。キー名・args は {CANONICAL_ID} に統一。

  5) Other Clients and Agents
     - ①にある各クライアント（VS Code / VS Code Insiders / Claude Desktop / LM Studio / Goose / opencode / Qodo Gen / Windsurf）を <details> 折り畳みで列挙し、標準の “command: npx / args: [\"{BIN_CMD}\"] / env: …” を提示。
     - 可能な箇所はワンライナー or サンプル JSON を併記。

  6) Setup: Codex (TOML)  ← **新規必須／②の形**
     - 説明: “Add the following to your Codex TOML configuration.”
     - まず **②そのままの例** を掲載（互換用・参考例）:
       ```toml
       [mcp_servers.serena]
       command = "uvx"
       args = ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server", "--context", "codex"]
       ```
     - 続けて **あなたのサーバー用の最小 TOML 例** も掲載:
       ```toml
       [mcp_servers.{CANONICAL_ID}]
       command = "npx"
       args = ["{BIN_CMD}"]
       # Optional environment variables:
       # {ENV_PREFIX}_API_KEY = "sk-your-real-key"
       # MCP_NAME = "{CANONICAL_ID}"
       ```

  7) Configuration (Env)
     - 箇条書きで {ENV_PREFIX}_API_KEY 等を列挙（存在しない場合は “If your tools are purely local, no API keys are required.” と明記）
     - `MCP_NAME` の既定（{CANONICAL_ID}）にも触れる。

  8) Available Tools
     - {TOOLS_TABLE} を Markdown 箇条書き/小見出しで生成:
       - 各ツール名
         - inputs: <JSON Schema 型 (required/optional を明示)>
         - outputs: <概要>
     - I/O が複雑な場合は “See `src/index.ts` schemas” の注記。

  9) Example invocation (MCP tool call)
     - {EXAMPLE_TOOL_CALL}（JSON）を 1 例。①に準拠し、locale 等は適宜。

  10) Troubleshooting
      - ①に近い内容（401, Node 18+, build 手順）
      - `npm pack --dry-run` で publish 内容を確認できることも記載。

  11) References
      - {EXTRA_REFS}（MCP SDK / Architecture / Server Concepts / Spec 等の主要リンク）

  12) Name Consistency & Troubleshooting（必須）
      - 箇条書き: “Always use CANONICAL_ID ({CANONICAL_ID}) for identifiers …”
      - Consistency Matrix（表形式または箇条書き）
      - Conflict Cleanup（①相当の記述）
      - **Cursor は UI 設定のみ。本リポジトリは `.cursor/mcp.json` を含まない** と明記。

  出力テンプレート（スケルトン — 自動置換して全文生成）:

  # {CANONICAL_DISPLAY}

  The Universal MCP Server exposes tools for your workflows and is designed for prompt-first usage in MCP-compatible clients.

  ## Installation

  ### Prerequisites
  - Node.js 18+
  - Set `{ENV_PREFIX}_...` in your environment

  ### Get an API key
  - If your tools require an external API, obtain a key from the provider’s docs/console.
  - Otherwise, you can skip this step.

  ### Build locally
  ```bash
  cd /path/to/{CANONICAL_ID}
  npm i
  npm run build

Setup: Claude Code (CLI)

Use this one-liner (replace with your real values):

claude mcp add {CANONICAL_DISPLAY} -s user -e {ENV_PREFIX}_API_KEY="sk-your-real-key" -- npx {BIN_CMD}

To remove:

claude mcp remove {CANONICAL_DISPLAY}

Setup: Cursor

Create .cursor/mcp.json in your client (do not commit it here):

{
  "mcpServers": {
    "{CANONICAL_ID}": {
      "command": "npx",
      "args": ["{BIN_CMD}"],
      "env": { "{ENV_PREFIX}_API_KEY": "sk-your-real-key" },
      "autoStart": true
    }
  }
}

Other Clients and Agents

  <details>
  <summary>VS Code</summary>


Install via URI or CLI:

code --add-mcp '{"name":"{CANONICAL_ID}","command":"npx","args":["{BIN_CMD}"],"env":{"{ENV_PREFIX}_API_KEY":"sk-your-real-key"}}'

  </details>


  <details>
  <summary>Claude Desktop</summary>


Follow the MCP install guide and reuse the standard config above.

  </details>


  <details>
  <summary>LM Studio</summary>


	•	Command: npx
	•	Args: [”{BIN_CMD}”]
	•	Env: {ENV_PREFIX}_API_KEY=sk-your-real-key

  </details>


  <details>
  <summary>Goose</summary>


	•	Type: STDIO
	•	Command: npx
	•	Args: {BIN_CMD}
	•	Enabled: true

  </details>


  <details>
  <summary>opencode</summary>


Example ~/.config/opencode/opencode.json:

{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "{CANONICAL_ID}": {
      "type": "local",
      "command": ["npx", "{BIN_CMD}"],
      "enabled": true
    }
  }
}

  </details>


  <details>
  <summary>Qodo Gen</summary>


Add a new MCP and paste the standard JSON config.

  </details>


  <details>
  <summary>Windsurf</summary>


See docs and reuse the standard config above.

  </details>


Setup: Codex (TOML)

Example (Serena):

[mcp_servers.serena]
command = "uvx"
args = ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server", "--context", "codex"]

This server (minimal):

[mcp_servers.{CANONICAL_ID}]
command = "npx"
args = ["{BIN_CMD}"]
# Optional:
# {ENV_PREFIX}_API_KEY = "sk-your-real-key"
# MCP_NAME = "{CANONICAL_ID}"

Configuration (Env)
	•	{ENV_PREFIX}_API_KEY: Your API key (if applicable)
	•	MCP_NAME: Server name override (default: {CANONICAL_ID})

Available Tools

{TOOLS_TABLE}

Example invocation (MCP tool call)

{EXAMPLE_TOOL_CALL}

Troubleshooting
	•	401 auth errors: check {ENV_PREFIX}_API_KEY
	•	Ensure Node 18+
	•	Local runs: npx {BIN_CMD} after npm run build
	•	Inspect publish artifacts: npm pack --dry-run

References

{EXTRA_REFS}

Name Consistency & Troubleshooting
	•	Always use CANONICAL_ID ({CANONICAL_ID}) for identifiers and keys.
	•	Use CANONICAL_DISPLAY ({CANONICAL_DISPLAY}) only for UI labels.
	•	Do not mix legacy keys after registration.

Consistency Matrix:
	•	npm package name → {CANONICAL_ID}
	•	Binary name → {BIN_CMD}
	•	MCP server name (SDK metadata) → {CANONICAL_ID}
	•	Env default MCP_NAME → {CANONICAL_ID}
	•	Client registry key → {CANONICAL_ID}
	•	UI label → {CANONICAL_DISPLAY}

Conflict Cleanup:
	•	Remove any stale keys (e.g., old display names) and re-add with {CANONICAL_ID} only.
	•	Cursor: configure in the UI; this project intentionally omits .cursor/mcp.json.

