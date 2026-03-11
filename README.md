# ⚔️ HabitQuest

> 習慣化をRPGで楽しく続けるウェブアプリ  
> A web app that makes habit building fun through RPG gamification

🌐 **Demo**: [https://habit-quest-jp.vercel.app](https://habit-quest-jp.vercel.app)

---

## 📖 概要 / Overview

**日本語**

HabitQuestは、日々の習慣をRPGゲームとして楽しめる習慣管理アプリです。習慣を達成するたびにキャラクターがXPを獲得してレベルアップし、サボるとHPが減少します。AIナビゲーターが毎回励ましのメッセージを送ってくれるため、モチベーションを維持しながら習慣を続けられます。

**English**

HabitQuest is a habit tracking app that gamifies your daily routines as an RPG adventure. Each time you complete a habit, your character earns XP and levels up — skip a habit and your HP decreases. An AI navigator sends personalized encouragement messages to keep you motivated.

---

## ✨ 主な機能 / Features

| 機能                   | 説明                                                        |
| ---------------------- | ----------------------------------------------------------- |
| 🎮 RPGキャラクター育成 | 4種類のキャラクターから選択。習慣達成でXP獲得・レベルアップ |
| 🤖 AI励ましメッセージ  | チェックイン時にAIがパーソナライズされたメッセージを送信    |
| 📊 統計・可視化        | 連続日数・達成率・XP履歴をグラフで確認                      |
| ⚔️ 習慣CRUD            | 毎日/週次の頻度・XP報酬をカスタマイズ可能                   |
| 🔐 Google OAuth        | Googleアカウントでワンクリックログイン                      |
| 📱 レスポンシブ対応    | モバイル・デスクトップ両対応                                |

---

## 📋 設計ドキュメント / Design Documents

| ドキュメント                            | 内容                                          |
| --------------------------------------- | --------------------------------------------- |
| [要件定義書](./docs/要件定義書.pdf)     | 機能要件・非機能要件                          |
| [API設計書](./docs/API設計書.pdf)       | エンドポイント一覧・リクエスト/レスポンス仕様 |
| [DB設計・ER図](./docs/ER図.pdf)         | テーブル設計・リレーション                    |
| [プロトタイプ](./docs/プロトタイプ.pdf) | 画面設計・UI/UX                               |

---

## 🛠️ 技術スタック / Tech Stack

### Frontend

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** — アニメーション

### Backend

- **Next.js Route Handlers** — APIエンドポイント
- **Prisma ORM** — DBアクセス
- **Supabase (PostgreSQL)** — データベース
- **NextAuth.js v5** — 認証

### AI

- **OpenRouter API** (google/gemma-3-4b-it) — AI励ましメッセージ生成

### Deployment

- **Vercel** — ホスティング
- **Supabase** — クラウドDB

---

## 🚀 セットアップ / Setup

### 必要環境 / Requirements

- Node.js 18+
- npm
- Supabase アカウント
- Google Cloud Console アカウント
- OpenRouter アカウント

### インストール / Installation

```bash
# リポジトリをクローン
git clone https://github.com/Kohei-Kuramoto/habit_quest.git
cd habit-quest

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local
```

### 環境変数 / Environment Variables

`.env.local`に以下を設定してください。

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_url

# OpenRouter AI
OPENROUTER_API_KEY=your_openrouter_api_key
```

### DBマイグレーション / DB Migration

```bash
npx prisma generate
npx prisma migrate deploy
```

### 開発サーバー起動 / Start Dev Server

```bash
npm run dev
```

`http://localhost:3000` にアクセスしてください。

---

## 📁 プロジェクト構成 / Project Structure

```
habit-quest/
├── prisma/
│   ├── schema.prisma        # DBスキーマ
│   └── migrations/          # マイグレーションファイル
├── src/
│   ├── app/
│   │   ├── api/             # APIルート
│   │   │   ├── auth/        # NextAuth
│   │   │   ├── habits/      # 習慣CRUD・チェックイン
│   │   │   ├── character/   # キャラクター
│   │   │   ├── stats/       # 統計
│   │   │   └── ai/          # AI励ましメッセージ
│   │   ├── dashboard/       # ダッシュボード画面
│   │   ├── login/           # ログイン画面
│   │   └── onboarding/      # オンボーディング画面
│   ├── components/          # 共通コンポーネント
│   └── lib/                 # ユーティリティ
```

---

## 🗄️ DBスキーマ / DB Schema

```
User ──< Habit ──< HabitLog
  └──── Character
```

- **User**: ユーザー情報
- **Character**: RPGキャラクター（HP・XP・レベル）
- **Habit**: 習慣（頻度・XP報酬）
- **HabitLog**: チェックイン履歴

---

## 👤 作者 / Author

**Kohei Kuramoto**

- GitHub: [@Kohei-Kuramoto](https://github.com/Kohei-Kuramoto)
