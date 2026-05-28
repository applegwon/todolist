# 실행 계획 (Execution Plan)

**버전:** 1.1  
**작성일:** 2026-05-28  
**작성자:** Naejune Gwon  
**참조 문서:**
- `docs/2-PRD.md` (제품 요구사항 정의서 v2.1)
- `docs/4-project-structure.md` (프로젝트 구조 설계 원칙 v1.2)
- `docs/5-arch-diagram.md` (기술 아키텍처 다이어그램 v1.1)
- `docs/6-erd.md` (ERD v1.0)
- `database/schema.sql` (DB DDL)

---

## 실행 순서 개요

```
Phase 1: 데이터베이스 (DB)
    └── DB-01: 데이터베이스 환경 구성
    └── DB-02: 스키마 적용 및 시드 데이터 확인

Phase 2: 백엔드 (Backend)
    └── BE-01: 프로젝트 초기 설정
    └── BE-02: DB 연결 및 공통 모듈
    └── BE-03: 인증 API (회원가입/로그인)
    └── BE-04: JWT 인증 미들웨어
    └── BE-05: 사용자 API
    └── BE-06: 카테고리 API
    └── BE-07: 할일 API

Phase 3: 프론트엔드 (Frontend)
    └── FE-01: 프로젝트 초기 설정
    └── FE-02: 공통 인프라 (API 클라이언트, 라우팅, i18n, 테마)
    └── FE-03: 인증 화면 (회원가입/로그인)
    └── FE-04: 카테고리 관리
    └── FE-05: 할일 CRUD
    └── FE-06: 프로필 수정 (테마/언어 포함)
    └── FE-07: 통합 검증
```

---

## Phase 1: 데이터베이스

### DB-01: 데이터베이스 환경 구성

**목표:** 로컬 PostgreSQL 17 인스턴스에 `todolist` 데이터베이스와 전용 사용자를 생성한다.

**완료 조건:**
- [x] PostgreSQL 17이 로컬에 설치되어 있거나 Docker로 실행 중이다
- [x] `todolist` 데이터베이스가 존재한다 → `postgres` DB 사용 (`.env` 기준)
- [x] `postgres` 사용자가 해당 DB에 접속 권한을 가진다
- [x] postgresql-mcp로 `SELECT version()` 성공 확인 (PostgreSQL 17.10 / Windows x86_64)

**의존성:**
- 없음 (Phase 1 시작점)

---

### DB-02: 스키마 적용 및 시드 데이터 확인

**목표:** `database/schema.sql`을 실행하여 3개 테이블과 인덱스, 기본 카테고리 시드가 정상 생성되었는지 확인한다.

**완료 조건:**
- [x] `database/schema.sql` 내용을 postgresql-mcp로 실행, 오류 없이 완료
- [x] `users`, `categories`, `todos` 테이블 모두 존재 확인
- [x] `categories` 테이블에 `id=1, name='기본', user_id=NULL` 레코드 존재 확인
- [x] `uq_categories_user_name` partial unique index 존재 확인
- [x] `idx_todos_*` 인덱스 4개, `idx_categories_user_id` 인덱스 1개 존재 확인
- [x] `chk_date_order` CHECK 제약 `todos` 테이블에 적용 완료

**의존성:**
- [x] DB-01 완료

---

## Phase 2: 백엔드

### BE-01: 프로젝트 초기 설정

**목표:** `backend/` 디렉토리를 생성하고 Node.js 프로젝트와 필수 패키지를 설치한다.

**완료 조건:**
- [x] `backend/` 디렉토리가 생성되었다
- [x] `npm init -y` 완료 후 `package.json`이 존재한다
- [x] 다음 패키지가 모두 설치되었다: `express`, `pg`, `bcryptjs`, `jsonwebtoken`, `dotenv`, `cors`
- [x] `devDependencies`에 `jest`, `supertest`, `eslint`, `prettier`가 설치되었다
- [x] `.env.example` 파일이 작성되었다 (DB, JWT, PORT, CORS 변수 포함)
- [x] `.env` 파일이 생성되었고 `.gitignore`에 등록되어 있다
- [x] `package.json`에 `dev`, `test`, `lint`, `format` 스크립트가 정의되었다
- [x] `docs/4-project-structure.md` 7절의 디렉토리 구조(`routes/`, `controllers/`, `services/`, `middleware/`, `db/`, `lib/`, `utils/`, `constants/`)가 생성되었다

**의존성:**
- [x] DB-01 완료

---

### BE-02: DB 연결 및 공통 모듈

**목표:** PostgreSQL 연결 풀을 설정하고, 공통 에러 클래스와 상수, 유틸리티 함수를 구현한다.

**완료 조건:**
- [x] `src/db/db.js`: `pg.Pool`로 연결 풀 생성, `query()` 함수 export
- [x] `src/constants/httpStatus.js`: 200, 201, 400, 401, 403, 404, 409, 500 상수 정의
- [x] `src/constants/errorCodes.js`: `AUTH_REQUIRED`, `EMAIL_DUPLICATE`, `INVALID_CREDENTIALS`, `NOT_FOUND`, `FORBIDDEN`, `VALIDATION_ERROR`, `INTERNAL_ERROR` 정의
- [x] `src/constants/dbDefaults.js`: 기본 카테고리 ID(1) 상수 정의
- [x] `src/utils/errors.js`: `AppError` 커스텀 에러 클래스 구현 (status, message, code 포함)
- [x] `src/utils/validators.js`: 이메일 형식, 비밀번호 최소 길이 검증 함수 구현
- [x] `src/lib/passwordUtils.js`: `hashPassword()`, `comparePassword()` 함수 구현 (bcryptjs 사용)
- [x] `src/lib/jwt.js`: `signToken()`, `verifyToken()` 함수 구현 (jsonwebtoken 사용)
- [x] `src/middleware/errorHandler.js`: Express 에러 핸들러 미들웨어 구현 (AppError → JSON 응답)
- [x] `node -e "require('./src/db/db.js').query('SELECT 1')"` 실행이 성공한다

**의존성:**
- [x] BE-01 완료
- [x] DB-02 완료

---

### BE-03: 인증 API (회원가입/로그인)

**목표:** `POST /api/auth/signup`과 `POST /api/auth/login` 엔드포인트를 구현한다.

**완료 조건:**
- [x] `src/app.js`: Express 앱 인스턴스 생성, CORS, JSON 파싱, 라우트 등록, 에러 핸들러 등록
- [x] `src/server.js`: 포트 바인딩 및 서버 시작
- [x] `src/services/authService.js`: `signup()`, `login()` 함수 구현
  - [x] signup: 이메일 중복 확인 → bcryptjs 해싱 → DB 저장 → 사용자 반환
  - [x] login: 이메일 조회 → bcryptjs 비교 → JWT 발급 → `{token, user}` 반환
- [x] `src/controllers/authController.js`: 입력 검증 → 서비스 호출 → JSON 응답
- [x] `src/routes/auth.js`: `POST /signup`, `POST /login` 라우팅 정의
- [x] `src/routes/index.js`: 모든 라우터를 `/api` 접두사로 마운트

**동작 검증:**
- [x] `POST /api/auth/signup` 정상 요청 → 201, `{id, email, name}` 반환
- [x] `POST /api/auth/signup` 이메일 중복 → 409, `{code: "EMAIL_DUPLICATE"}` 반환 (UC-102)
- [x] `POST /api/auth/login` 정상 요청 → 200, `{token, user: {id, email, name, theme, language}}` 반환
- [x] `POST /api/auth/login` 비밀번호 불일치 → 401 반환
- [x] DB에 비밀번호가 해시로 저장되고 원문이 없다 (NFR-201)

**의존성:**
- [x] BE-02 완료

---

### BE-04: JWT 인증 미들웨어

**목표:** `authMiddleware.js`를 구현하고 보호된 라우트에 적용한다.

**완료 조건:**
- [x] `src/middleware/authMiddleware.js`: `Authorization: Bearer <token>` 헤더 파싱 → JWT 검증 → `req.user = {id, email}` 주입
- [x] 토큰 없음 → 401, `{code: "AUTH_REQUIRED"}` 응답 (NFR-203)
- [x] 토큰 만료/위변조 → 401 응답

**동작 검증:**
- [x] 토큰 없이 보호된 라우트 요청 → 401 반환
- [x] 유효한 토큰으로 보호된 라우트 요청 → `req.user`가 올바르게 주입된다

**의존성:**
- [x] BE-02 완료
- [x] BE-03 완료 (서버가 구동 중이어야 테스트 가능)

---

### BE-05: 사용자 API

**목표:** `GET /api/users/me`와 `PATCH /api/users/me` 엔드포인트를 구현한다.

**완료 조건:**
- [x] `src/services/userService.js`: `getUserById()`, `updateUser()` 함수 구현
  - [x] updateUser: 이름, 비밀번호(해시), theme, language 수정 지원
- [x] `src/controllers/userController.js`: 입력 검증 → 서비스 호출 → JSON 응답
- [x] `src/routes/users.js`: `GET /me`, `PATCH /me` 라우팅 정의, authMiddleware 적용

**동작 검증:**
- [x] `GET /api/users/me` → 200, `{id, email, name, theme, language, created_at}` 반환 (UC-204, UC-205)
- [x] `PATCH /api/users/me` 이름 변경 → 200, 변경된 사용자 정보 반환 (UC-201)
- [x] `PATCH /api/users/me` theme/language 변경 → 200, DB에 반영됨 (UC-203, UC-204)
- [x] 타인 계정의 `/me`에 접근 불가 (토큰 기반 본인 인증이므로 자동 보장) (UC-202)

**의존성:**
- [x] BE-04 완료

---

### BE-06: 카테고리 API

**목표:** 카테고리 목록 조회/생성/수정/삭제 4개 엔드포인트를 구현한다.

**완료 조건:**
- [x] `src/services/categoryService.js` 구현:
  - [x] `getCategoriesByUser(userId)`: 기본 카테고리(user_id=NULL) + 본인 카테고리 목록 반환
  - [x] `createCategory(userId, name)`: 이름 중복 확인 → DB 저장
  - [x] `updateCategory(userId, categoryId, name)`: 기본 카테고리 수정 거부 → 소유권 확인 → 이름 중복 확인 → 수정
  - [x] `deleteCategory(userId, categoryId)`: 기본 카테고리 삭제 거부 → 소유권 확인 → 소속 할일을 기본 카테고리로 이동 → 삭제
- [x] `src/controllers/categoryController.js`: 입력 검증 → 서비스 호출 → JSON 응답
- [x] `src/routes/categories.js`: 4개 라우트 정의, authMiddleware 적용

**동작 검증:**
- [x] `GET /api/categories` → 200, 기본 카테고리 포함 목록 반환 (UC-301)
- [x] `POST /api/categories` 정상 → 201 반환 (UC-301)
- [x] `POST /api/categories` 이름 중복 → 409 반환 (UC-302)
- [x] `PATCH /api/categories/1` (기본 카테고리) → 403 반환 (UC-304)
- [x] `DELETE /api/categories/1` (기본 카테고리) → 403 반환 (UC-304)
- [x] `DELETE /api/categories/:id` 실행 후 소속 할일이 기본 카테고리(id=1)로 이동된다 (UC-306)
- [x] 타인 소유 카테고리 수정/삭제 → 403 반환 (UC-303, UC-305)

**의존성:**
- [x] BE-04 완료
- [x] DB-02 완료 (기본 카테고리 시드 필요)

---

### BE-07: 할일 API

**목표:** 할일 목록 조회(필터링 포함)/생성/수정/삭제 4개 엔드포인트를 구현한다.

**완료 조건:**
- [x] `src/services/todoService.js` 구현:
  - [x] `getTodos(userId, filters)`: 카테고리/상태/기한초과 필터링, `is_overdue` 동적 계산 후 응답에 포함
  - [x] `createTodo(userId, data)`: 카테고리 미지정 시 기본 카테고리 자동 적용, 날짜 유효성 검증
  - [x] `updateTodo(userId, todoId, data)`: 소유권 확인, 날짜 유효성 검증 후 수정
  - [x] `deleteTodo(userId, todoId)`: 소유권 확인 후 삭제
- [x] `src/controllers/todoController.js`: 입력 검증 → 서비스 호출 → JSON 응답
- [x] `src/routes/todos.js`: 4개 라우트 정의, authMiddleware 적용

**동작 검증:**
- [x] `GET /api/todos` → 200, `is_overdue` 필드가 포함된 목록 반환 (UC-404, UC-406)
- [x] `GET /api/todos?status=진행중` → 상태 필터 적용 (UC-405)
- [x] `GET /api/todos?category=2` → 카테고리 필터 적용 (UC-405)
- [x] `GET /api/todos?overdue=true` → 기한초과 항목만 반환 (UC-405, UC-406)
- [x] `POST /api/todos` 카테고리 미지정 → category_id가 기본 카테고리(1)로 저장 (UC-402)
- [x] `POST /api/todos` end_date < start_date → 400 반환 (UC-403)
- [x] `PATCH /api/todos/:id` 타인 소유 → 403 반환 (UC-408)
- [x] `DELETE /api/todos/:id` 본인 소유 → 204 반환 (UC-409)

**의존성:**
- [x] BE-04 완료
- [x] BE-06 완료 (기본 카테고리 ID 상수 사용)

---

## Phase 3: 프론트엔드

### FE-01: 프로젝트 초기 설정

**목표:** Vite + React 19 + TypeScript 기반 프론트엔드 프로젝트를 생성하고 필수 패키지를 설치한다.

**완료 조건:**
- [ ] `npm create vite@latest frontend -- --template react-ts` 실행 완료
- [ ] `zustand`, `@tanstack/react-query`, `react-router-dom` 설치 완료
- [ ] `tsconfig.json`에 `strict: true`가 설정되어 있다
- [ ] `.env.example`이 작성되었다 (`VITE_API_BASE_URL` 포함)
- [ ] `.env.local`이 생성되었고 `.gitignore`에 등록되어 있다
- [ ] `docs/4-project-structure.md` 6절의 디렉토리 구조(`features/`, `lib/`, `utils/`, `i18n/`, `hooks/`, `styles/`, `types/`)가 생성되었다
- [ ] `npm run dev` 실행 시 `localhost:5173`에서 기본 페이지가 정상 로드된다

**의존성:**
- [x] BE-03 완료 (API 연동을 위해 백엔드 서버가 구동 가능해야 함)

---

### FE-02: 공통 인프라 (API 클라이언트, 라우팅, i18n, 테마)

**목표:** 모든 도메인에서 공유하는 공통 인프라를 구현한다. 이후 모든 FE 태스크의 기반이 된다.

**완료 조건:**

**API 클라이언트 (`src/lib/api.ts`)**
- [ ] `fetch` 기반 공통 API 클라이언트 구현
- [ ] `localStorage`에서 JWT 토큰을 읽어 `Authorization: Bearer` 헤더에 자동 주입
- [ ] 응답 401 시 로그아웃 처리(토큰 삭제 + 로그인 페이지 리다이렉트) 구현
- [ ] `get()`, `post()`, `patch()`, `del()` 함수 export

**TanStack Query 클라이언트 (`src/lib/queryClient.ts`)**
- [ ] `QueryClient` 인스턴스 생성 및 export

**다국어 i18n (`src/i18n/`)**
- [ ] `ko.json`: 앱 전체 UI 텍스트 한국어 번역 완성
- [ ] `en.json`: 앱 전체 UI 텍스트 영어 번역 완성
- [ ] `src/hooks/useLanguage.ts`: 언어 전환 훅 구현 (`useSettingsStore`에서 language 읽기)

**테마 (`src/styles/`)**
- [ ] `variables.css`: 라이트/다크 CSS 변수 정의
- [ ] `theme.css`: `[data-theme="dark"]` 셀렉터로 다크 테마 스타일 적용
- [ ] `src/hooks/useTheme.ts`: 테마 전환 훅 구현, `document.documentElement`에 `data-theme` 속성 적용

**전역 상태 (`src/features/auth/authStore.ts`)**
- [ ] `token`, `user(id, email, name, theme, language)` 상태 정의
- [ ] `setAuth()`, `clearAuth()` 액션 정의

**라우팅 (`src/App.tsx`)**
- [ ] React Router 설정: `/login`, `/signup`, `/` (할일 목록), `/todos/new`, `/todos/:id/edit`, `/categories`, `/profile` 라우트 정의
- [ ] `src/features/common/components/ProtectedRoute.tsx`: 미인증 시 `/login`으로 리다이렉트

**타입 정의 (`src/types/index.d.ts`)**
- [ ] `User`, `Category`, `Todo`, `ApiResponse<T>` 공통 타입 정의

**의존성:**
- [x] FE-01 완료

---

### FE-03: 인증 화면 (회원가입/로그인)

**목표:** 회원가입 화면(S-01)과 로그인 화면(S-02)을 구현한다.

**완료 조건:**
- [ ] `src/features/auth/api.ts`: `signup()`, `login()` API 호출 함수 구현
- [ ] `src/features/auth/hooks/useSignup.ts`: TanStack Query `useMutation` 기반, 성공 시 로그인 페이지로 이동
- [ ] `src/features/auth/hooks/useLogin.ts`: TanStack Query `useMutation` 기반, 성공 시 `authStore`에 토큰/사용자 저장 후 `/`로 이동, theme/language 즉시 적용 (UC-205)
- [ ] `src/features/auth/components/SignupForm.tsx`: 이메일, 비밀번호, 이름 폼, 클라이언트 검증 포함
- [ ] `src/features/auth/components/LoginForm.tsx`: 이메일, 비밀번호 폼
- [ ] `src/features/auth/pages/SignupPage.tsx`: SignupForm 렌더링
- [ ] `src/features/auth/pages/LoginPage.tsx`: LoginForm 렌더링

**동작 검증:**
- [ ] 회원가입 성공 → 로그인 페이지로 이동 (UC-101)
- [ ] 이메일 중복 회원가입 → 에러 메시지 표시 (UC-102)
- [ ] 로그인 성공 → 할일 목록 페이지로 이동 (UC-103)
- [ ] 로그인 후 저장된 theme/language가 즉시 적용된다 (UC-205)
- [ ] 인증되지 않은 상태에서 `/` 접근 → `/login`으로 리다이렉트 (UC-104)

**의존성:**
- [x] FE-02 완료
- [x] BE-03 완료

---

### FE-04: 카테고리 관리

**목표:** 카테고리 관리 화면(S-06)을 구현한다. 할일 CRUD(FE-05)에서 카테고리 선택에 사용되므로 먼저 완료한다.

**완료 조건:**
- [ ] `src/features/categories/api.ts`: `getCategories()`, `createCategory()`, `updateCategory()`, `deleteCategory()` 구현
- [ ] `src/features/categories/hooks/useCategories.ts`: TanStack Query `useQuery` 기반 목록 조회
- [ ] `src/features/categories/hooks/useCategoryCreate.ts`: `useMutation` 기반, 성공 시 목록 캐시 무효화
- [ ] `src/features/categories/hooks/useCategoryUpdate.ts`: `useMutation` 기반
- [ ] `src/features/categories/hooks/useCategoryDelete.ts`: `useMutation` 기반, 삭제 전 확인 다이얼로그
- [ ] `src/features/categories/components/CategoryList.tsx`: 카테고리 목록, 수정/삭제 버튼 (기본 카테고리는 버튼 비활성화)
- [ ] `src/features/categories/components/CategoryModal.tsx`: 생성/수정 모달 폼
- [ ] `src/features/categories/components/CategorySelector.tsx`: 할일 폼용 드롭다운 컴포넌트

**동작 검증:**
- [ ] 카테고리 목록에 '기본' 카테고리가 표시된다 (UC-304)
- [ ] '기본' 카테고리의 수정/삭제 버튼이 비활성화된다 (UC-304)
- [ ] 카테고리 생성 성공 → 목록에 즉시 반영 (UC-301)
- [ ] 동일 이름 카테고리 생성 → 에러 메시지 표시 (UC-302)
- [ ] 카테고리 삭제 후 해당 할일이 '기본' 카테고리로 이동됨 (UC-306, 백엔드에서 처리)

**의존성:**
- [x] FE-02 완료
- [x] FE-03 완료 (인증 후 접근 가능)
- [x] BE-06 완료

---

### FE-05: 할일 CRUD

**목표:** 할일 목록 화면(S-03), 등록 화면(S-04), 수정 화면(S-05)을 구현한다.

**완료 조건:**

**API 및 훅**
- [ ] `src/features/todos/api.ts`: `getTodos()`, `createTodo()`, `updateTodo()`, `deleteTodo()` 구현
- [ ] `src/features/todos/hooks/useTodos.ts`: `useQuery` 기반, 필터 파라미터 지원
- [ ] `src/features/todos/hooks/useTodoCreate.ts`: `useMutation` 기반
- [ ] `src/features/todos/hooks/useTodoUpdate.ts`: `useMutation` 기반
- [ ] `src/features/todos/hooks/useTodoDelete.ts`: `useMutation` 기반
- [ ] `src/features/todos/todoStore.ts`: 필터 상태 (`selectedCategory`, `selectedStatus`, `showOverdueOnly`) 관리

**컴포넌트**
- [ ] `src/features/todos/components/TodoFilters.tsx`: 카테고리/상태/기한초과 필터 UI
- [ ] `src/features/todos/components/TodoCard.tsx`: 할일 카드 (제목, 상태, 기한초과 배지, 수정/삭제 버튼)
- [ ] `src/features/todos/components/TodoList.tsx`: TodoCard 목록 렌더링
- [ ] `src/features/todos/components/TodoForm.tsx`: 제목(필수), 설명, 카테고리 선택, 시작일/종료일, 상태 입력 폼

**페이지**
- [ ] `src/features/todos/pages/TodoListPage.tsx`: TodoFilters + TodoList 조합
- [ ] `src/features/todos/pages/TodoCreatePage.tsx`: TodoForm (생성 모드)
- [ ] `src/features/todos/pages/TodoEditPage.tsx`: TodoForm (수정 모드, 기존 데이터 로드)

**동작 검증:**
- [ ] 할일 목록이 본인 것만 표시된다 (UC-404)
- [ ] 카테고리/상태/기한초과 필터가 동작한다 (UC-405)
- [ ] 기한초과 할일에 시각적 구분이 표시된다 (UC-406, `is_overdue` 활용)
- [ ] 할일 등록 시 카테고리 미선택 → 기본 카테고리 적용 (UC-402)
- [ ] 종료일 < 시작일 입력 시 클라이언트 에러 메시지 표시 (UC-403)
- [ ] 타인의 할일 수정/삭제 시도 시 서버 403 에러를 사용자에게 표시 (UC-408)

**의존성:**
- [x] FE-02 완료
- [x] FE-03 완료
- [x] FE-04 완료 (CategorySelector 사용)
- [x] BE-07 완료

---

### FE-06: 프로필 수정 (테마/언어 포함)

**목표:** 내 정보 수정 화면(S-07)을 구현한다. 이름, 비밀번호, 테마, 언어 변경을 지원한다.

**완료 조건:**
- [ ] `src/features/users/api.ts`: `getMe()`, `updateMe()` 구현
- [ ] `src/features/users/hooks/useProfile.ts`: `useQuery`로 내 정보 조회, `useMutation`으로 수정
- [ ] `src/features/users/components/ProfileForm.tsx`: 이름, 비밀번호(변경 시만 입력) 폼
- [ ] `src/features/users/components/ThemeSelector.tsx`: light/dark 선택 UI, 선택 즉시 테마 전환
- [ ] `src/features/users/components/LanguageSelector.tsx`: ko/en 선택 UI, 선택 즉시 언어 전환
- [ ] `src/features/users/pages/ProfilePage.tsx`: ProfileForm + ThemeSelector + LanguageSelector 조합

**동작 검증:**
- [ ] 이름 변경 저장 → 헤더 등에 반영된다 (UC-201)
- [ ] 테마 변경 → 즉시 UI 전체에 다크/라이트 테마 적용 (UC-503, UC-505)
- [ ] 언어 변경 → 즉시 UI 전체 텍스트가 ko/en으로 전환 (UC-503)
- [ ] 변경 후 로그아웃 → 재로그인 시 저장된 테마/언어가 자동 적용된다 (UC-205)

**의존성:**
- [x] FE-02 완료 (useTheme, useLanguage 훅 사용)
- [x] FE-03 완료
- [x] BE-05 완료

---

### FE-07: 통합 검증

**목표:** 전체 플로우를 브라우저에서 수동 검증하고, 반응형 UI를 점검한다.

**완료 조건:**

**핵심 시나리오 검증**
- [ ] 회원가입 → 로그인 → 할일 등록 → 목록 조회 → 수정 → 삭제 전 플로우 동작
- [ ] 카테고리 생성 → 할일에 카테고리 지정 → 카테고리 삭제 → 할일이 기본 카테고리로 이동됨
- [ ] 테마 변경 → 로그아웃 → 재로그인 후 테마 유지
- [ ] 언어 변경 → 로그아웃 → 재로그인 후 언어 유지

**엣지 케이스 검증**
- [ ] 인증 토큰 없이 보호된 페이지 접근 → 로그인 페이지로 이동
- [ ] 기한초과 할일(종료일 < 오늘, 상태 ≠ 완료)이 목록에서 시각적으로 구분된다
- [ ] 기본 카테고리 수정/삭제 시도 시 UI에서 불가 처리된다

**반응형 검증**
- [ ] 데스크톱(1280px 이상) 레이아웃 정상
- [ ] 모바일(375px) 레이아웃 정상, 스크롤·버튼 터치 영역 적절 (NFR-302)
- [ ] Chrome, Firefox, Edge에서 주요 플로우 동작 확인 (NFR-301)

**의존성:**
- [x] FE-01 ~ FE-06 모두 완료
- [x] BE-01 ~ BE-07 모두 완료

---

## 태스크 의존성 요약

```
DB-01
  └─ DB-02
       └─ BE-02 ─── BE-03 ─── BE-04 ─── BE-05 ─── FE-06
  └─ BE-01              │           └─── BE-06 ─── FE-04 ─┐
                         │           └─── BE-07 ─── FE-05 ─┤
                         └─── FE-01 ─── FE-02 ─── FE-03 ──┤
                                                            └─ FE-07
```

---

## 진행 상황 체크리스트

| 태스크 | 상태 | 완료일 |
|--------|------|--------|
| DB-01: DB 환경 구성 | ✅ 완료 | 2026-05-28 |
| DB-02: 스키마 적용 확인 | ✅ 완료 | 2026-05-28 |
| BE-01: 백엔드 초기 설정 | ✅ 완료 | 2026-05-28 |
| BE-02: DB 연결 및 공통 모듈 | ✅ 완료 | 2026-05-28 |
| BE-03: 인증 API | ✅ 완료 | 2026-05-28 |
| BE-04: JWT 미들웨어 | ✅ 완료 | 2026-05-28 |
| BE-05: 사용자 API | ✅ 완료 | 2026-05-28 |
| BE-06: 카테고리 API | ✅ 완료 | 2026-05-28 |
| BE-07: 할일 API | ✅ 완료 | 2026-05-28 |
| FE-01: 프론트엔드 초기 설정 | ⬜ 미시작 | — |
| FE-02: 공통 인프라 | ⬜ 미시작 | — |
| FE-03: 인증 화면 | ⬜ 미시작 | — |
| FE-04: 카테고리 관리 | ⬜ 미시작 | — |
| FE-05: 할일 CRUD | ⬜ 미시작 | — |
| FE-06: 프로필 수정 | ⬜ 미시작 | — |
| FE-07: 통합 검증 | ⬜ 미시작 | — |
