<div align="center">

<img src="https://avatars.githubusercontent.com/u/275568950?s=400&u=fb26e17e18bb6c9aaa44277cbe910638e3922cf9&v=4" width="120" alt="CHECKMATE logo" />

# ♟️ CHECKMATE — Frontend

### 준비는 쉽게, 여행은 완벽하게
해외여행 준비를 AI 맞춤 체크리스트로 연결하는 서비스의 **프론트엔드(React 19 SPA)**
*Frontend (React 19 SPA) for an AI-powered travel-prep checklist service.*

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-checkmate--v.com-3DB4DD?style=for-the-badge)](https://checkmate-v.com)
[![Backend](https://img.shields.io/badge/Backend-Repo-04384A?style=for-the-badge&logo=github&logoColor=white)](https://github.com/404checkmate/checkmate-backend)

`React 19` · `Vite` · `React Router v7` · `Tailwind CSS v4` · `Three.js`

</div>

---

## 📑 목차 · Contents
- [소개 · About](#-소개--about)
- [기술 스택 · Tech Stack](#-기술-스택--tech-stack)
- [주요 기능 · Features](#-주요-기능--features)
- [시작하기 · Getting Started](#-시작하기--getting-started)
- [환경 변수 · Environment Variables](#-환경-변수--environment-variables)
- [폴더 구조 · Project Structure](#-폴더-구조--project-structure)
- [배포 · Deployment](#-배포--deployment)
- [관련 링크 · Links](#-관련-링크--links)

---

## 🧭 소개 · About

**🇰🇷** 여행 국가·날짜·동행·스타일만 입력하면 AI가 맞춤 체크리스트를 생성하고, 저장·편집·진행도 관리까지 한 흐름으로 제공하는 SPA입니다. 백엔드 API(NestJS)와 통신하며, 게스트 프리뷰·여행 스타일 테스트·친구 공동 편집 기능을 포함합니다.

**🇺🇸** A single-page app that generates an AI-tailored checklist from minimal travel input, then handles saving, editing, and progress tracking in one flow. It talks to the NestJS backend and includes guest preview, a travel-style test, and collaborative editing.

---

## 🛠 기술 스택 · Tech Stack

| 구분 · Category | 기술 · Stack |
|---|---|
| **Framework** | React 19 |
| **Build** | Vite |
| **Routing** | React Router v7 |
| **Styling** | Tailwind CSS v4 |
| **Language** | JavaScript (JSX) |
| **3D** | Three.js · @react-three/fiber |
| **HTTP** | Axios |
| **Analytics** | Google Analytics 4 (GA4) · Vercel Analytics |
| **Lint** | ESLint |
| **Deploy** | Vercel |

> ℹ️ 정확한 버전은 `package.json`을 기준으로 합니다. · *Exact versions follow `package.json`.*

---

## ✨ 주요 기능 · Features
- 🤖 **AI 맞춤 체크리스트** — 조건 입력 → 카테고리별 준비물 자동 생성 (생성은 백엔드 비동기 처리 + 폴링)
- 📝 **저장 & 편집** — 항목 추가·삭제·정렬·메모, 진행도 시각화, 기내/위탁 분류
- 🎭 **54가지 여행 스타일 테스트** — 결과 캐릭터 저장·공유
- 👥 **친구 공동 편집** — 초대 링크로 체크리스트 실시간 공동 작업
- 🔓 **게스트 프리뷰** — 로그인 없이 미리보기, 저장 시점에만 로그인 (Supabase OAuth)

---

## 🚀 시작하기 · Getting Started

### 사전 요구사항 · Prerequisites
- Node.js (LTS 권장) · npm

### 설치 & 실행 · Install & Run
```bash
# 1. 클론 · Clone
git clone https://github.com/404checkmate/Checkmate-Frontend.git
cd Checkmate-Frontend

# 2. 의존성 설치 · Install dependencies
npm install

# 3. 환경 변수 설정 · Set up env (아래 섹션 참고)
cp .env.example .env

# 4. 개발 서버 실행 · Run dev server
npm run dev

# 5. 프로덕션 빌드 · Build for production
npm run build
npm run preview
```

> ⚠️ 실제 스크립트명은 `package.json`의 `scripts`를 확인하세요. (`dev` / `build` / `preview` / `lint`)
> *Verify actual script names in `package.json` `scripts`.*

---

## 🔐 환경 변수 · Environment Variables

`.env.example`을 복사해 `.env`를 만들고 값을 채웁니다. Vite는 `VITE_` 접두사 변수만 클라이언트에 노출합니다.
*Copy `.env.example` to `.env`. Vite only exposes variables prefixed with `VITE_`.*

> 설정은 `src/config/env.js`에서 읽습니다. · *Config is read in `src/config/env.js`.*

```dotenv
# 백엔드 API 베이스 URL · Backend API base URL (로컬: http://localhost:8080/api)
VITE_API_BASE_URL=https://api.checkmate-v.com

# Supabase (OAuth)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Analytics 4
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

> ⚠️ **실제 키는 절대 커밋하지 마세요.** `.env`는 `.gitignore`에 포함되어야 하며, 레포에는 빈 `.env.example`만 둡니다.
> *Never commit real keys. `.env` must be gitignored; keep only an empty `.env.example` in the repo.*
> 위 변수명은 예시입니다 — 실제 코드(`import.meta.env.*`)와 대조해 맞추세요.

---

## 📁 폴더 구조 · Project Structure

```
src/
├── pages/          # 라우트 단위 페이지 · Route pages
├── components/     # 재사용 컴포넌트 · Reusable components
├── features/       # 도메인별 기능 (checklist, test, collab 등)
├── api/            # Axios 인스턴스 · API 호출 · API clients
├── hooks/          # 커스텀 훅 · Custom hooks
├── assets/         # 이미지 · 3D 모델 · Static assets
├── styles/         # Tailwind 설정 · 전역 스타일
└── main.jsx        # 진입점 · Entry point
```
> 실제 구조는 레포에 맞게 수정하세요. · *Adjust to match the actual repo layout.*

---

## ☁️ 배포 · Deployment
- **Vercel** 에 배포 (정적 `dist` 호스팅 + `/api` 프록시 리라이트로 백엔드 연결)
- `main` 브랜치 푸시 시 자동 배포
- SPA 라우팅을 위한 rewrite 설정으로 새로고침 404 방지 (`vercel.json`)

---

## 🔗 관련 링크 · Links
- 🌐 **Live**: [checkmate-v.com](https://checkmate-v.com)
- ⚙️ **Backend**: [404checkmate/checkmate-backend](https://github.com/404checkmate/checkmate-backend)

<div align="center">

**Team 404 · CHECKMATE · 2026**

</div>
