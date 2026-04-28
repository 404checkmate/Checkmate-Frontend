# Frontend CLAUDE.md

> 이 문서의 존재 이유:
> AI를 통제하기 위한 **아키텍처 계약서(Architectural Contract)**다.
> AI가 코드를 생성해도 아키텍처 엔트로피가 증가하지 않도록 강제하는 구조적 가드레일.

---

## Build & Development Commands

```bash
npm run dev      # Start Next.js development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Key Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5 (strict mode)
- Tailwind CSS 4
- ESLint 9 with eslint-config-next

## Path Alias

`@/*` maps to project root (`./`). Use `@/app/...`, `@/features/...`, etc.

---

# Project Overview

이 프로젝트는 **Next.js 기반 Frontend DDD 아키텍처**를 사용한다.  
코드는 **Feature 기반 Layered Architecture** 구조로 구성되어 있으며, 인증 기능을 중심으로 설계되어 있다.

아키텍처 목표

- 비즈니스 로직과 UI 분리
- Feature 단위 모듈화
- Domain 중심 설계
- 유지보수성과 확장성 확보

이 구조는 다음 패턴을 기반으로 한다.

- Clean Architecture
- Domain Driven Design
- Feature Module Architecture

---

# Architecture Overview

프로젝트는 **Feature 기반 Layered Architecture**를 따른다.

```
features/
   auth/
      domain/
      application/
      infrastructure/
      ui/

infrastructure/ (global)
ui/ (design system)
app/ (next router)
```

레이어 의미

```
Domain         → 순수 비즈니스 모델
Application    → 상태 관리 + usecase orchestration
Infrastructure → 외부 시스템 (API, storage)
UI             → React 컴포넌트
```

---

# Dependency Rules

레이어 간 의존성 규칙

```
UI -> Application -> Domain
Infrastructure -> Domain
```

절대 금지

```
Domain -> Application
Domain -> UI
Application -> UI
```

Domain은 **항상 가장 안쪽 레이어**이며 외부 시스템에 의존하지 않는다.

> **왜 이 규칙이 중요한가**
> 단순 규칙이 아니라 그래프 방향성 고정(Directed Acyclic Constraint)이다.
> - 순환 의존 방지
> - 레이어 침범 방지
> - 리팩토링 비용 감소
> - AI 입장에서 "이 방향 아니면 틀린 코드"라는 명확한 판정 기준 제공

---

# Project Directory Structure

```
src/

features/
   auth/
      domain/
      application/
      infrastructure/
      ui/

ui/
   components/
   layout/

infrastructure/
   http/
   config/

app/
   routing
```

---

# Feature Module Structure

각 Feature는 다음 레이어 구조를 가진다.

```
features/auth/

domain/
application/
infrastructure/
ui/
```

---

# Domain Layer

Domain Layer는 **순수 비즈니스 모델**을 정의한다.

이 레이어는 다음 요소를 포함한다.

```
model
state
intent
```

## Model

```
domain/model/authUser.ts
```

Auth User 도메인 모델

Domain Model 특징

- UI와 독립
- API와 독립
- 순수 타입 정의

예시

```
AuthUser
```

DDD 관점

```
Entity / Value Object
```

---

## State

```
domain/state/authState.ts
```

Auth 상태를 정의한다.

이 구조는 **Discriminated Union 기반 상태 머신**이다.

상태 공간

```
LOADING
UNAUTHENTICATED
AUTHENTICATED
```

> **왜 이 구조가 강력한가**
> 단순 타입이 아니라 상태 공간을 폐쇄(closed world)로 만든 것이다.
> - AI가 이상한 상태를 추가하지 못함
> - 런타임 버그 → 컴파일 단계로 이동
> - TypeScript가 상태 안전성 보장
> - 런타임 방어 코드 감소

---

## Intent

```
domain/intent/authIntent.ts
```

사용자의 **의도(Intent)** 를 정의한다.

예시

```
LOGIN_GOOGLE
LOGIN_KAKAO
LOGOUT
```

UI 이벤트와 실제 실행을 분리하는 역할을 한다.

구조

```
UI Event
   ↓
Intent
   ↓
Command
   ↓
Execution
```

> **Intent 구조 = 디버깅 인터페이스**
> 이 구조의 진짜 목적은 행위의 의미를 코드 레벨에서 명시적으로 드러내는 것이다.
> - 로그 추적 가능
> - 테스트 가능
> - AI 수정 안정성 증가

이 패턴은 다음 아키텍처에서 사용된다.

- Elm Architecture
- Redux Command Pattern
- CQRS

---

# Application Layer

Application Layer는 **시스템의 핵심 로직**을 담당한다.

구성 요소

```
atoms
selectors
commands
hooks
```

---

## Atoms

```
application/atoms/authAtom.ts
```

전역 인증 상태를 관리한다.

기술

```
Jotai
```

Jotai 선택 이유

- Recoil보다 단순
- Redux보다 가벼움
- Context보다 성능 우수

역할

```
Global Auth State
```

---

## Selectors

```
application/selectors/authSelectors.ts
```

Derived State를 제공한다.

예시

```
AuthState -> isLoggedIn
```

장점

UI에서 상태 조건문을 제거할 수 있다.

예

```
state.status === "AUTHENTICATED"
```

---

## Commands

```
application/commands/authCommand.ts
```

Command Pattern을 사용한다.

구조

```
Intent -> Command -> Infrastructure
```

예시

```
LOGIN_GOOGLE -> redirectOAuthLogin("google")
```

장점

- switch 제거
- OCP(Open Closed Principle) 적용

나쁜 코드

```
switch(intent.type)
```

좋은 코드

```
command[intent]
```

> **AI가 만드는 최악의 코드 패턴 (절대 금지)**
>
> ```
> onClick → fetch → setState
> ```
>
> **반드시 이 구조를 따를 것**
>
> ```
> UI → Intent → Command → API → State
> ```
>
> Side Effect를 반드시 한 경로로만 흐르게 만든다.

---

## Hooks

```
application/hooks/useAuth.ts
```

Auth Application Service 역할을 한다.

책임

```
상태 관리
API orchestration
상태 업데이트
```

구조

```
UI -> useAuth -> API
```

---

# Infrastructure Layer

Infrastructure Layer는 **외부 시스템과 통신**한다.

예

```
Backend API
Browser Storage
External Service
```

---

## API Adapter

```
features/auth/infrastructure/api/authApi.ts
```

외부 Backend API와 통신한다.

기능

```
OAuth redirect
fetchCurrentUser
logoutUser
```

이 파일은 **외부 세계 adapter**이다.

---

# Global Infrastructure

## HTTP Client

```
infrastructure/http/httpClient.ts
```

fetch wrapper 역할을 한다.

기능

```
BASE_URL 중앙 관리
Cookie 포함 요청
공통 에러 처리
```

---

## Environment Config

```
infrastructure/config/env.ts
```

환경 변수 관리

사용 파일

```
.env
.env.local
```

목적

환경 변수 누락 시 오류 발생

---

# UI Layer

UI Layer는 **React 컴포넌트**를 담당한다.

원칙

- 비즈니스 로직 없음
- 상태 없음
- Side effect 없음

이를 **Dumb Component**라고 한다.

---

## Feature UI

```
features/auth/ui/components
```

예

```
LoginButton
```

역할

```
렌더링
이벤트 전달
```

---

## Design System

```
ui/components
```

공통 UI 컴포넌트

예

```
Button
Modal
Navbar
```

특징

```
Stateless
Reusable
Pure UI
```

---

# Layout System

```
ui/layout/AppLayout.tsx
```

구조

```
RootLayout (Server)
   ↓
AppLayout (Client)
   ↓
Navbar
   ↓
Page
```

Next.js 권장 구조이다.

---

# Next App Router Layer

Next.js App Router는 다음 역할을 한다.

```
Routing
SSR
Entry Point
```

예

```
app/login/page.tsx
```

여기서는 **Application Hook만 호출한다.**

예

```
useAuth()
```

---

# State Driven UI

UI는 상태 기반으로 동작한다.

예

```
AUTHENTICATED → Logout 버튼
UNAUTHENTICATED → Login 버튼
```

이 패턴을

```
State Driven UI
```

라고 한다.

---

# Design Principles

이 프로젝트는 다음 원칙을 따른다.

Single Responsibility Principle  
Open Closed Principle  
Feature Based Architecture  
Domain Isolation

---

# Claude Code Working Guidelines

Claude가 이 프로젝트에서 작업할 때 반드시 지켜야 할 규칙

1. Domain Layer 수정 시 외부 의존성 추가 금지
2. UI 컴포넌트에 비즈니스 로직 추가 금지
3. 상태 로직은 Application Layer에만 작성
4. API 호출은 Infrastructure Layer에서만 수행
5. Feature 구조를 깨지 말 것
6. Domain 타입을 중심으로 코드 작성

---

# 이 문서가 존재하는 이유

## AI 통제 구조로서의 아키텍처 계약

일반적인 문제:

- AI는 국소 최적화(local optimization)를 한다
- 아키텍처는 전역 일관성(global consistency)이 필요하다
- 이 둘이 충돌하면 → 코드베이스 붕괴

이 문서는 그걸 막기 위한 3단 구조를 갖는다.

### 1. 구조 정의 (Structure Encoding)

```
Domain / Application / Infrastructure / UI
```

설명이 아니라 AI가 선택할 수 있는 **설계 공간을 제한**하는 것이다.
자유도를 줄이고 잘못된 설계 경로를 차단한다.

### 2. 의존성 제약 (Dependency Constraints)

```
UI -> Application -> Domain
Infrastructure -> Domain
```

그래프 방향성 고정(Directed Acyclic Constraint).
AI 입장에서 이 방향 아니면 틀린 코드라는 명확한 판정 기준을 제공한다.

### 3. 실행 패턴 강제 (Execution Pattern Lock)

```
UI → Intent → Command → Infrastructure
```

Side Effect를 반드시 한 경로로만 흐르게 만든다.

---

## 인간 개입 가능성 확보 구조

| 레이어 | 인간 개입 지점 |
|--------|----------------|
| Domain | 비즈니스 규칙 수정 |
| Application | 흐름 수정 / 정책 변경 / 상태 전이 조정 |
| Infrastructure | API 변경 대응 / 성능 최적화 |

어디를 고치면 되는지 AI 코드에서도 항상 명확하다.

---

## 일반 DDD 문서와의 차이

| 항목 | 일반 DDD | 이 문서 |
|------|----------|---------|
| 목적 | 인간 이해 | AI + 인간 통제 |
| 규칙 강도 | 느슨함 | 강제 |
| 실행 패턴 | 선택적 | 고정 |
| 상태 모델 | 자유 | 폐쇄 |
| Layer 규칙 | 권장 | 절대 |

---

## 결론

AI + 인간 협업을 전제로 설계된 **통제 가능한 아키텍처 시스템**.

- 선택지 제거 → AI가 잘못된 선택 못함
- 흐름 고정 → Side Effect 폭발 방지
- 의미 명시 → Intent
- 상태 폐쇄 → 타입으로 제어
