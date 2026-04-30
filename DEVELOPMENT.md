# Checkmate Frontend — 로컬 개발 가이드

## 사전 요구사항

- **Node.js**: `package.json`에 버전 명시 없음. `vite@8`을 사용하므로 Node.js 20 LTS 이상 권장.
- **패키지 매니저**: npm (lock 파일 기준)

---

## 초기 설정

```bash
# 1. 저장소 클론
git clone <repository-url>
cd Checkmate-Frontend

# 2. 의존성 설치
npm install
```

---

## 환경변수 설정

`.env`, `.env.local`, `.env.development`, `.env.production`은 모두 `.gitignore` 처리되어 있습니다.
팀원 각자가 직접 파일을 생성해야 합니다.

### `.env.local` 파일 생성

```bash
cp .env.example .env.local
```

그 다음 `.env.local`을 열어 아래 값을 채웁니다.

### 환경변수 목록

| 변수명 | 필수 여부 | 설명 |
|---|---|---|
| `VITE_API_BASE_URL` | **필수** | API 요청 base URL. 미설정 시 앱 자체가 실행되지 않음 |
| `VITE_SUPABASE_URL` | 선택 | Supabase 프로젝트 루트 URL. 미설정 시 소셜 로그인 비활성화 |
| `VITE_SUPABASE_ANON_KEY` | 선택 | Supabase anon(public) key. 미설정 시 소셜 로그인 비활성화 |
| `VITE_APP_NAME` | 선택 | 앱 이름 표시용 (기본값 없음) |
| `VITE_APP_ENV` | 선택 | `development` / `staging` / `production` |
| `VITE_DEV_PROXY_TARGET` | 선택 | Vite proxy가 포워딩할 백엔드 주소 (기본값: `http://localhost:8080`) |
| `VITE_ANALYTICS_KEY` | 선택 | 분석 도구 키 (현재 미사용) |

> `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 가 없어도 앱은 로드됩니다.
> 단, Google/Kakao 로그인 버튼이 비활성 상태로 동작합니다 (`src/lib/supabase.js` 참고).

### Supabase 값 확인 방법

1. [Supabase 대시보드](https://supabase.com/dashboard) → 해당 프로젝트 선택
2. **Project Settings → API** 탭
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

---

## 실행 시나리오별 설정

### A. 로컬 백엔드(`localhost:8080`)와 함께 개발 (기본)

```dotenv
# .env.local
VITE_API_BASE_URL=/api
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

`VITE_API_BASE_URL=/api`로 설정하면 `vite.config.js`의 proxy가 `/api` 경로를
`http://localhost:8080`으로 자동 포워딩합니다. 브라우저 관점에서 같은 오리진이므로
CORS 문제가 발생하지 않습니다.

백엔드 실행이 필요합니다 (`checkmate-backend/` 참고).

### B. 로컬 백엔드 없이 프로덕션 API 사용

```dotenv
# .env.local
VITE_API_BASE_URL=/api
VITE_DEV_PROXY_TARGET=https://checkvmate.cloud
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

`VITE_DEV_PROXY_TARGET`을 프로덕션 서버로 지정하면, Vite dev server가
`/api` 요청을 프로덕션 API로 프록시합니다. 브라우저가 직접 외부 서버를 호출하지 않으므로
CORS 없이 동작합니다.

> ⚠️ 프로덕션 DB에 쓰기가 발생합니다. 테스트 데이터 오염 주의.

---

## 로컬 실행

```bash
npm run dev
```

- 접속 URL: **http://localhost:5173**
- 브라우저가 자동으로 열립니다 (`vite.config.js: open: true`)

### 기타 스크립트

| 명령어 | 설명 |
|---|---|
| `npm run dev` | Vite 개발 서버 실행 (HMR 포함) |
| `npm run build` | 프로덕션 번들 생성 (`dist/`) |
| `npm run preview` | 빌드 결과물 로컬 미리보기 (port 4173) |
| `npm run lint` | ESLint 검사 |

---

## 자주 겪는 문제

### 로그인이 안 될 때 (소셜 로그인 리다이렉트 오류)

Supabase는 OAuth 콜백 URL이 허용 목록에 없으면 로그인을 거부합니다.

1. Supabase 대시보드 → **Authentication → URL Configuration**
2. **Redirect URLs**에 추가:
   ```
   http://localhost:5173/auth/callback
   http://localhost:4173/auth/callback
   ```

### API 호출이 안 될 때 (Network Error / 404)

**시나리오 A (로컬 백엔드):**
- 백엔드(`localhost:8080`)가 실행 중인지 확인
- 백엔드 `.env`의 `CORS_ORIGIN`에 `http://localhost:5173`이 포함되어 있는지 확인
  ```dotenv
  CORS_ORIGIN=http://localhost:5173,http://localhost:4173
  ```

**시나리오 B (프로덕션 프록시):**
- `VITE_DEV_PROXY_TARGET` 값이 정확한지 확인 (`https://` 포함)
- `VITE_API_BASE_URL`이 `/api` (상대경로)인지 확인. 절대 URL로 설정하면 프록시를 타지 않음

### 앱 자체가 로드되지 않을 때 (빈 화면 또는 에러)

`src/api/client.js`는 `VITE_API_BASE_URL`이 없으면 즉시 예외를 던집니다:

```js
if (!baseURL) throw new Error('VITE_API_BASE_URL is required at build time')
```

`.env.local`에 `VITE_API_BASE_URL`이 설정되어 있는지 반드시 확인하세요.

### 환경변수 수정 후 반영이 안 될 때

Vite는 `import.meta.env` 값을 빌드 시점에 치환합니다. `.env.local`을 수정한 뒤에는
**개발 서버를 재시작**해야 합니다 (`Ctrl+C` → `npm run dev`).

---

## Vercel 배포 vs 로컬 개발 차이점

| 항목 | 로컬 (`npm run dev`) | Vercel (배포) |
|---|---|---|
| 접속 URL | `http://localhost:5173` | `https://checkmate-frontend-eight.vercel.app` 등 |
| 환경변수 | `.env.local` 파일 | Vercel 대시보드 **Environment Variables** |
| API 라우팅 | Vite proxy (`/api` → `localhost:8080`) | `vercel.json` rewrites (`/*` → `index.html`, API는 직접 호출) |
| Supabase 콜백 | `http://localhost:5173/auth/callback` | `https://<vercel-domain>/auth/callback` |
| HMR | 지원 (파일 저장 시 즉시 반영) | 미지원 (매 배포마다 빌드) |

Vercel에서 사용하는 환경변수는 로컬 `.env.local`과 **별도로** 관리됩니다.
Vercel 대시보드 → 프로젝트 → **Settings → Environment Variables**에서 설정해야 합니다.
