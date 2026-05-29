# TodoList 프로젝트 구조 설계 원칙

**버전:** 1.4  
**작성일:** 2026-05-28  
**작성자:** Naejune Gwon  
**참조 문서:**

- `docs/1-domain-definition.md` (TodoList 도메인 정의서 v3.0)
- `docs/2-PRD.md` (제품 요구사항 정의서 v2.3)
- `docs/3-user-scenario.md` (사용자 시나리오 v1.2)

---

## 변경 이력

| 버전 | 작성일     | 변경자       | 변경 내용 |
| ---- | ---------- | ------------ | --------- |
| 1.0  | 2026-05-27 | Naejune Gwon | 최초 작성 |
| 1.1  | 2026-05-27 | Naejune Gwon | 프론트엔드 파일 확장자 `.jsx/.js` → `.tsx/.ts` 통일, Vite 템플릿 `react-ts` 수정, `types/` 디렉토리 필수 항목으로 변경 |
| 1.2  | 2026-05-27 | Naejune Gwon | bcrypt → bcryptjs 표기 통일 (5.4, 7.1, 8.2절) |
| 1.3  | 2026-05-28 | Naejune Gwon | 백엔드 Phase 2 완료 반영: 실제 구현 기준으로 디렉토리 구조 보정(lib/, middleware/, utils/ 실제 파일 반영), 테스트 파일 목록 업데이트, API 엔드포인트 체크리스트 완료 표시 |
| 1.4  | 2026-05-29 | Naejune Gwon | 일본어(ja) 언어 지원 추가 — i18n 디렉토리(ja.json), DB 컬럼 예시, LanguageSelector 주석, 도메인 엔티티 요약 반영 |
| 1.5  | 2026-05-29 | Naejune Gwon | BUG-01/BUG-02 수정 반영 — db.js DATE 타입 파서 설명 추가, API 클라이언트 401 조건부 처리 설명 수정 |

---

## 1. 공통 최상위 원칙 (FE/BE 공통)

### 1.1 설계 철학

#### 1.1.1 단순함과 명확성 우선

- **원칙:** 오버 엔지니어링을 금지하고, 비즈니스 요구사항에 직접 매핑되는 구조 설계
- **실행:** 디렉토리 구조는 도메인 모델(User, Todo, Category)을 중심으로 정리
- **검증:** 각 파일·모듈이 특정 도메인 엔티티 또는 유스케이스와 명확히 연결되어야 함

#### 1.1.2 기능 응집도 극대화

- **원칙:** 관련된 로직을 한곳에 모아 변경 시 영향 범위 최소화
- **실행:**
  - 프론트엔드: 도메인별 폴더(features) 내에 API 호출, UI 컴포넌트, 상태 관리 함께 배치
  - 백엔드: 라우트, 컨트롤러, 서비스를 도메인별 폴더로 구조화
- **검증:** PR 리뷰 시 특정 도메인의 변경이 해당 폴더 내에 집중되어야 함

#### 1.1.3 확장성과 유지보수성 병행

- **원칙:** 새로운 도메인(예: 공유 기능) 추가 시에도 기존 구조 수정 최소화
- **실행:**
  - 공통 유틸리티는 `utils/` 폴더에 집중
  - API 클라이언트 계층 분리로 백엔드 변경에 독립적
  - 한국어 주석을 활용하여 의도 명확화
- **검증:** 새 기능 추가 시 기존 파일 5개 이상 수정 필요하면 구조 재검토

---

### 1.2 계층 분리 전략

#### 프론트엔드 3계층

```
Presentation Layer (UI 컴포넌트)
         ↓
Business Logic Layer (hooks, Zustand store, utilities)
         ↓
API Integration Layer (queries, mutations)
         ↓
Data/State Management (Zustand, TanStack Query)
```

#### 백엔드 3계층

```
Routing Layer (Express routes, path 정의)
         ↓
Controller Layer (요청 검증, 비즈니스 로직 호출)
         ↓
Service Layer (SQL 실행, 비즈니스 규칙 구현)
         ↓
Data Access Layer (pg client, 쿼리 실행)
```

---

## 2. 의존성/레이어 원칙

### 2.1 의존성 방향 규칙

#### 프론트엔드

- **하향 의존 원칙:** 상위 계층은 하위 계층에만 의존 (역방향 금지)
- **금지 사항:**
  - UI 컴포넌트가 다른 UI 컴포넌트의 상태에 직접 의존 → Zustand 스토어를 통해서만 공유
  - `features/*/api.ts`가 다른 도메인의 API 호출 로직 의존 → 공통 API 클라이언트 활용
- **허용 사항:**
  - 컴포넌트 → hooks (custom hooks)
  - hooks → Zustand store
  - hooks → TanStack Query queries/mutations
  - queries/mutations → `lib/api.ts` (공통 클라이언트)

#### 백엔드

- **하향 의존 원칙:** 라우터 → 컨트롤러 → 서비스 → 데이터 접근
- **금지 사항:**
  - 서비스 계층이 Express 객체(req, res) 직접 사용 → 컨트롤러에서만 처리
  - SQL 쿼리가 여러 서비스에 분산 → `lib/db.js`에 공통 쿼리 함수 제공
  - 데이터 검증이 컨트롤러와 서비스에 중복 → 미들웨어 또는 서비스에서만 수행
- **허용 사항:**
  - 라우터 → 미들웨어 (JWT 검증)
  - 미들웨어 → req.user 주입
  - 컨트롤러 → 서비스 호출
  - 서비스 → 데이터 접근 함수 (db.query 등)

### 2.2 순환 참조 금지

#### 프론트엔드

```javascript
// ❌ 금지
// features/todos/hooks.js
import { categoryStore } from '../categories/store.js'
// features/categories/hooks.js
import { todoStore } from '../todos/store.js'

// ✅ 허용
// lib/stores.js
export const todoStore = create(...)
export const categoryStore = create(...)
// 양쪽 모두 lib/stores.js 에서 import
```

#### 백엔드

```javascript
// ❌ 금지
// services/todoService.js
const { createCategory } = require("./categoryService.js");
// services/categoryService.js
const { getTodo } = require("./todoService.js");

// ✅ 허용
// services/todoService.js
const { getCategoryById } = require("./categoryService.js");
// services/categoryService.js는 categoryService만 사용 (단방향)
```

### 2.3 도메인 경계 명확화

#### 프론트엔드 도메인 분리

| 도메인       | 책임                                | 파일 예시                                                |
| ------------ | ----------------------------------- | -------------------------------------------------------- |
| `auth`       | 로그인, 회원가입, JWT 관리          | login.jsx, signup.jsx, authStore.js                      |
| `users`      | 사용자 정보 조회/수정, 테마/언어    | profile.jsx, profileStore.js, useProfile.js              |
| `todos`      | 할일 CRUD, 필터링                   | todoList.jsx, todoForm.jsx, todoStore.js, todoQueries.js |
| `categories` | 카테고리 CRUD                       | categoryModal.jsx, categoryStore.js                      |
| `common`     | 레이아웃, 네비게이션, 공통 컴포넌트 | Layout.jsx, Header.jsx, Button.jsx                       |

#### 백엔드 도메인 분리

| 도메인       | 책임                             | 디렉토리                                          |
| ------------ | -------------------------------- | ------------------------------------------------- |
| `auth`       | 회원가입, 로그인, JWT 발급/검증  | routes/auth.js, services/authService.js           |
| `users`      | 사용자 정보 CRUD, 테마/언어 저장 | routes/users.js, services/userService.js          |
| `todos`      | 할일 CRUD, 필터링 로직           | routes/todos.js, services/todoService.js          |
| `categories` | 카테고리 CRUD, 할일 이동 처리    | routes/categories.js, services/categoryService.js |
| `middleware` | JWT 검증, 사용자 주입            | middleware/authMiddleware.js                      |

---

## 3. 코드/네이밍 원칙

### 3.1 파일명 규칙

#### 프론트엔드

| 용도           | 규칙                                  | 예시                                   |
| -------------- | ------------------------------------- | -------------------------------------- |
| React 컴포넌트 | PascalCase + `.tsx`                   | `TodoList.tsx`, `TodoForm.tsx`         |
| 커스텀 훅      | `use` prefix + camelCase + `.ts`      | `useTodos.ts`, `useProfile.ts`         |
| Zustand 스토어 | camelCase + `Store` suffix + `.ts`    | `todoStore.ts`, `authStore.ts`         |
| TanStack Query | camelCase + `Queries` suffix + `.ts`  | `todoQueries.ts`, `categoryQueries.ts` |
| 유틸리티 함수  | camelCase + `.ts`                     | `formatDate.ts`, `validateEmail.ts`    |
| API 클라이언트 | camelCase + `Api` suffix + `.ts`      | `todoApi.ts`, `categoryApi.ts`         |
| 스타일         | camelCase + `.css` 또는 `.module.css` | `todoList.css`, `todoForm.module.css`  |
| i18n 리소스    | `[lang].json`                         | `ko.json`, `en.json`, `ja.json`        |

#### 백엔드

| 용도        | 규칙                                    | 예시                                      |
| ----------- | --------------------------------------- | ----------------------------------------- |
| 라우트 파일 | camelCase + `.js`                       | `authRoutes.js`, `todoRoutes.js`          |
| 컨트롤러    | camelCase + `Controller` suffix + `.js` | `todoController.js`, `userController.js`  |
| 서비스      | camelCase + `Service` suffix + `.js`    | `todoService.js`, `authService.js`        |
| 미들웨어    | camelCase + `Middleware` suffix + `.js` | `authMiddleware.js`, `errorMiddleware.js` |
| 유틸리티    | camelCase + `.js`                       | `passwordUtils.js`, `dateUtils.js`        |
| DB 관련     | camelCase + `.js`                       | `db.js`, `queries.js`                     |

### 3.2 변수명/함수명 규칙

#### 프론트엔드 & 백엔드 공통

| 범주                       | 규칙                                | 예시                                             |
| -------------------------- | ----------------------------------- | ------------------------------------------------ |
| 불린 변수                  | `is`/`has`/`can` prefix + camelCase | `isLoading`, `hasError`, `canEdit`               |
| 배열 변수                  | 복수형 명사                         | `todos`, `categories`, `users`                   |
| 함수 (동작)                | 동사 + 목적어                       | `getTodos()`, `createCategory()`, `deleteUser()` |
| 함수 (검증)                | `validate` 또는 `is` prefix         | `validateEmail()`, `isValidPassword()`           |
| 함수 (변환)                | 목적어 + `To` + 결과형              | `dateToString()`, `stringToDate()`               |
| 상수                       | UPPER_SNAKE_CASE                    | `MAX_TODO_TITLE_LENGTH`, `DEFAULT_LANGUAGE`      |
| 이벤트 핸들러 (프론트엔드) | `handle` + 이벤트명                 | `handleSubmit()`, `handleDeleteClick()`          |

#### 한국어 주석 가이드

```javascript
// 프론트엔드
const [isLoading, setIsLoading] = useState(false); // 로딩 상태 플래그

useEffect(() => {
  // 할일 목록을 카테고리와 상태로 필터링
  const filtered = todos.filter((todo) => todo.categoryId === selectedCategory && todo.status === selectedStatus);
}, [todos, selectedCategory, selectedStatus]);

// 백엔드
// 사용자의 모든 할일 조회 (권한 검증 포함)
async function getTodosByUser(userId) {
  const todos = await db.query("SELECT * FROM todos WHERE user_id = $1", [userId]);
  return todos;
}
```

### 3.3 데이터베이스 명명 규칙

#### 테이블명 (복수형 snake_case)

```sql
-- 사용자 테이블
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- 암호화된 비밀번호 저장
  name VARCHAR(100) NOT NULL,
  theme VARCHAR(10) NOT NULL DEFAULT 'light', -- light 또는 dark
  language VARCHAR(5) NOT NULL DEFAULT 'ko', -- ko, en 또는 ja
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)

-- 카테고리 테이블
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- NULL인 경우 시스템 기본 카테고리
  UNIQUE(user_id, name) -- 사용자별 카테고리명 중복 방지
)

-- 할일 테이블
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT, -- 선택 항목
  start_date DATE, -- 선택 항목
  end_date DATE, -- 선택 항목
  status VARCHAR(20) NOT NULL, -- 미시작, 진행중, 완료
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE SET DEFAULT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

#### 컬럼명 규칙

- **snake_case:** 모든 컬럼은 `snake_case` 사용
- **타임스탬프:** `created_at`, `updated_at` (TIMESTAMPTZ 사용, 시간대 포함)
- **논리값:** `is_overdue` 형태 (가상 속성, 저장하지 않음)
- **외래키:** `[테이블명]_id` (예: `user_id`, `category_id`)

---

## 4. 테스트/품질 원칙

### 4.1 테스트 전략

#### 프론트엔드

| 계층     | 도구                   | 대상                            | 커버리지 |
| -------- | ---------------------- | ------------------------------- | -------- |
| 컴포넌트 | React Testing Library  | UI 렌더링, 사용자 상호작용      | 최소 70% |
| 훅       | @testing-library/react | `useTodos()`, `useProfile()` 등 | 최소 80% |
| 스토어   | 직접 호출              | Zustand store 상태 변경         | 최소 80% |
| 유틸리티 | Jest                   | 포맷팅, 검증 함수               | 최소 90% |

#### 백엔드

| 계층           | 도구             | 대상                     | 커버리지 |
| -------------- | ---------------- | ------------------------ | -------- |
| API 엔드포인트 | Jest + supertest | 요청/응답 검증, 상태코드 | 최소 85% |
| 서비스         | Jest             | 비즈니스 로직, 검증 규칙 | 최소 90% |
| 유틸리티       | Jest             | 헬퍼 함수                | 최소 90% |

#### 테스트 파일 위치

```
프론트엔드:
features/todos/useTodos.test.js (훅 테스트)
features/todos/TodoList.test.jsx (컴포넌트 테스트)
lib/stores.test.js (스토어 테스트)
lib/utils.test.js (유틸리티 테스트)

백엔드:
tests/integration/todoRoutes.test.js
tests/unit/todoService.test.js
tests/unit/utils.test.js
```

### 4.2 린트/포맷 기준

#### 프론트엔드

| 도구       | 설정                             | 목적           |
| ---------- | -------------------------------- | -------------- |
| ESLint     | `.eslintrc.json` (React 19 지원) | 코드 품질 검사 |
| Prettier   | `.prettierrc` (80 컬럼)          | 일관된 포맷    |
| TypeScript | `tsconfig.json` (strict mode)    | 타입 안전성    |

#### 백엔드

| 도구     | 설정                            | 목적           |
| -------- | ------------------------------- | -------------- |
| ESLint   | `.eslintrc.json` (Node.js 설정) | 코드 품질 검사 |
| Prettier | `.prettierrc` (80 컬럼)         | 일관된 포맷    |

#### 커밋 전 검사 항목

```
1. npm run lint 또는 npx eslint . 통과 (경고 포함 0건)
2. npm run format 실행 (Prettier 자동 포맷)
3. npm run test 모든 테스트 통과
4. 커미션 메시지: [이슈 번호] 기능명 - 한국어 설명
   예: [US-01] 회원가입 기능 - 이메일 중복 검사 로직 추가
```

---

## 5. 설정/보안/운영 원칙

### 5.1 환경변수 관리

#### 프론트엔드 (`.env`)

```
# API 서버 주소
REACT_APP_API_BASE_URL=http://localhost:3000/api

# 앱 이름 (다국어)
REACT_APP_NAME=TodoList

# 빌드 환경
NODE_ENV=development
```

#### 백엔드 (`.env`)

```
# 서버 설정
PORT=3000
NODE_ENV=development

# 데이터베이스 연결
DATABASE_URL=postgresql://user:password@localhost:5432/todolist
DB_HOST=localhost
DB_PORT=5432
DB_USER=todolist_user
DB_PASSWORD=secure_password_here
DB_NAME=todolist

# JWT 설정
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=7d

# CORS 설정
CORS_ORIGIN=http://localhost:3000

# 로깅
LOG_LEVEL=debug
```

#### 실행 규칙

- 프로덕션: `npm run build` 후 `.env.production` 사용
- 개발: `.env.local` 또는 `.env.development` 사용
- `.env*` 파일은 `.gitignore`에 추가 (프로덕션 키 노출 금지)

### 5.2 JWT 관리

#### 발급 및 검증

```javascript
// 백엔드: 로그인 시 발급
const payload = { userId: user.id, email: user.email };
const token = jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRATION, // 기본값: 7d
});

// 프론트엔드: localStorage 저장
localStorage.setItem("token", token);

// 백엔드: API 요청 시 검증
// authMiddleware.js에서 req.headers.authorization 확인
// 토큰 없음 → 401, 토큰 만료 → 401, 유효함 → req.user 주입
```

#### 보안 규칙

- 토큰은 HTTP-only 쿠키 또는 localStorage에 저장 (이 프로젝트는 localStorage)
- 모든 인증 필요 API는 `authMiddleware` 통과 필수
- 토큰 갱신 로직은 구현하지 않음 (1차 구현 범위)

### 5.3 CORS 설정

#### 백엔드 (Express)

```javascript
// app.js 또는 server.js
const cors = require("cors");

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true, // 쿠키 포함
    optionsSuccessStatus: 200,
  }),
);
```

#### 프론트엔드 (API 요청)

```javascript
// lib/api.js 또는 lib/apiClient.js
// fetch 요청에 credentials 포함
fetch(`${API_BASE_URL}/endpoint`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  credentials: "include", // CORS 쿠키 포함 (필요 시)
});
```

### 5.4 민감 정보 보호

| 정보            | 저장 방식                        | 접근 제어                                           |
| --------------- | -------------------------------- | --------------------------------------------------- |
| 사용자 비밀번호 | bcryptjs 단방향 암호화 (salt 포함) | 관리자 조회 불가 (저장된 해시와 입력값 비교만 가능) |
| JWT 토큰        | localStorage (프론트엔드)        | HTTPS 필수 (프로덕션)                               |
| DB 연결문자열   | 환경변수 `.env`                  | `.gitignore` 추가, 프로덕션별 분리                  |
| API 키 (미사용) | —                                | —                                                   |

### 5.5 에러 처리 및 로깅

#### 백엔드 에러 응답

```javascript
// 예시: 400 (Bad Request)
{
  "status": 400,
  "message": "제목이 비어있습니다", // 사용자 친화적 메시지
  "code": "MISSING_FIELD" // 프로그래매틱 에러 코드
}

// 예시: 401 (Unauthorized)
{
  "status": 401,
  "message": "인증이 필요합니다",
  "code": "AUTH_REQUIRED"
}

// 예시: 500 (Server Error)
{
  "status": 500,
  "message": "서버 오류가 발생했습니다",
  "code": "INTERNAL_ERROR"
}
```

#### 프론트엔드 에러 처리

```javascript
// hooks/useTodos.js 예시
const { data, isError, error } = useQuery({
  queryKey: ["todos"],
  queryFn: async () => {
    const response = await fetch("/api/todos");
    if (!response.ok) {
      // 에러 상태 → Zustand store에 저장
      const errorData = await response.json();
      errorStore.setError(errorData.message);
      throw new Error(errorData.message);
    }
    return response.json();
  },
});
```

---

## 6. 프론트엔드 디렉토리 구조

### 6.1 전체 구조

```
frontend/
│
├── public/                    # 정적 자산
│   ├── favicon.ico
│   └── index.html
│
├── src/                       # 소스 코드
│   │
│   ├── index.tsx              # 애플리케이션 진입점
│   ├── App.tsx                # 최상위 컴포넌트 (라우팅 정의)
│   │
│   ├── features/              # 도메인별 기능 모듈 (핵심 폴더)
│   │   ├── auth/              # 인증 도메인
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx        # 로그인 화면
│   │   │   │   └── SignupPage.tsx       # 회원가입 화면
│   │   │   ├── hooks/
│   │   │   │   ├── useLogin.ts          # 로그인 로직 (TanStack Query 사용)
│   │   │   │   └── useSignup.ts         # 회원가입 로직
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx        # 로그인 폼 컴포넌트
│   │   │   │   └── SignupForm.tsx       # 회원가입 폼 컴포넌트
│   │   │   ├── api.ts                   # 인증 API 호출 함수
│   │   │   └── authStore.ts             # Zustand 상태 (token, user 정보)
│   │   │
│   │   ├── users/             # 사용자 프로필 도메인
│   │   │   ├── pages/
│   │   │   │   └── ProfilePage.tsx      # 프로필 수정 화면
│   │   │   ├── components/
│   │   │   │   ├── ProfileForm.tsx      # 프로필 폼 (이름, 비밀번호)
│   │   │   │   ├── ThemeSelector.tsx    # 테마 선택 컴포넌트 (light/dark)
│   │   │   │   └── LanguageSelector.tsx # 언어 선택 컴포넌트 (ko/en/ja)
│   │   │   ├── hooks/
│   │   │   │   └── useProfile.ts        # 프로필 조회/수정 로직
│   │   │   ├── api.ts                   # 사용자 API 호출 함수
│   │   │   └── profileStore.ts          # Zustand 상태 (사용자 정보)
│   │   │
│   │   ├── todos/             # 할일 도메인
│   │   │   ├── pages/
│   │   │   │   ├── TodoListPage.tsx     # 할일 목록 화면
│   │   │   │   ├── TodoCreatePage.tsx   # 할일 등록 화면
│   │   │   │   └── TodoEditPage.tsx     # 할일 수정 화면
│   │   │   ├── components/
│   │   │   │   ├── TodoList.tsx         # 할일 목록 컴포넌트
│   │   │   │   ├── TodoCard.tsx         # 할일 카드 컴포넌트
│   │   │   │   ├── TodoForm.tsx         # 할일 입력 폼 컴포넌트
│   │   │   │   └── TodoFilters.tsx      # 필터 UI (카테고리, 상태, 기한초과)
│   │   │   ├── hooks/
│   │   │   │   ├── useTodos.ts          # 할일 목록 조회 로직
│   │   │   │   ├── useTodoCreate.ts     # 할일 생성 로직
│   │   │   │   ├── useTodoUpdate.ts     # 할일 수정 로직
│   │   │   │   └── useTodoDelete.ts     # 할일 삭제 로직
│   │   │   ├── api.ts                   # 할일 API 호출 함수
│   │   │   └── todoStore.ts             # Zustand 상태 (필터 조건, 선택 할일)
│   │   │
│   │   ├── categories/        # 카테고리 도메인
│   │   │   ├── components/
│   │   │   │   ├── CategoryList.tsx     # 카테고리 목록 컴포넌트
│   │   │   │   ├── CategoryModal.tsx    # 카테고리 생성/수정 모달
│   │   │   │   └── CategorySelector.tsx # 할일 등록 시 카테고리 선택 드롭다운
│   │   │   ├── hooks/
│   │   │   │   ├── useCategories.ts     # 카테고리 목록 조회 로직
│   │   │   │   ├── useCategoryCreate.ts # 카테고리 생성 로직
│   │   │   │   ├── useCategoryUpdate.ts # 카테고리 수정 로직
│   │   │   │   └── useCategoryDelete.ts # 카테고리 삭제 로직
│   │   │   ├── api.ts                   # 카테고리 API 호출 함수
│   │   │   └── categoryStore.ts         # Zustand 상태 (카테고리 목록)
│   │   │
│   │   └── common/            # 공통 기능 (모든 도메인에 공유)
│   │       ├── components/
│   │       │   ├── Layout.tsx           # 레이아웃 컴포넌트 (헤더, 네비, 푸터)
│   │       │   ├── Header.tsx           # 헤더 컴포넌트 (로그아웃 버튼)
│   │       │   ├── Button.tsx           # 공통 버튼 컴포넌트
│   │       │   ├── Modal.tsx            # 공통 모달 컴포넌트
│   │       │   ├── Loading.tsx          # 로딩 스피너
│   │       │   └── ErrorAlert.tsx       # 에러 메시지 표시
│   │       ├── hooks/
│   │       │   └── useError.ts          # 에러 상태 관리 훅
│   │       ├── components/
│   │       │   └── ProtectedRoute.tsx   # 인증 필요한 라우트 보호
│   │       └── errorStore.ts            # Zustand 전역 에러 상태
│   │
│   ├── lib/                   # 공유 라이브러리 및 유틸리티
│   │   ├── api.ts             # 공통 API 클라이언트 (fetch 래핑, 토큰 추가)
│   │   ├── stores.ts          # 모든 Zustand 스토어 통합 (또는 개별 import)
│   │   ├── queryClient.ts     # TanStack Query 클라이언트 설정
│   │   └── utils.ts           # 공통 유틸리티 함수
│   │
│   ├── utils/                 # 유틸리티 함수 (비즈니스 로직 불포함)
│   │   ├── formatDate.ts      # 날짜 포맷팅 함수
│   │   ├── validateEmail.ts   # 이메일 검증 함수
│   │   ├── validatePassword.ts # 비밀번호 검증 함수
│   │   └── dateUtils.ts       # 날짜 관련 헬퍼 (기한초과 판정 등)
│   │
│   ├── i18n/                  # 다국어 리소스 (정적 파일)
│   │   ├── ko.json            # 한국어 번역
│   │   ├── en.json            # 영어 번역
│   │   └── ja.json            # 일본어 번역
│   │
│   ├── hooks/                 # 전역 커스텀 훅 (여러 도메인에 공유)
│   │   ├── useLanguage.ts     # 언어 전환 로직 (i18n 연동)
│   │   ├── useTheme.ts        # 테마 전환 로직 (light/dark)
│   │   └── useAuth.ts         # 인증 상태 조회 훅
│   │
│   ├── styles/                # 전역 스타일
│   │   ├── App.css            # 애플리케이션 기본 스타일
│   │   ├── variables.css      # CSS 변수 (컬러, 폰트 크기)
│   │   └── theme.css          # 테마 스타일 (light/dark 정의)
│   │
│   └── types/                 # TypeScript 타입 정의
│       └── index.d.ts         # 공통 타입 정의 (엔티티, API 응답 등)
│
├── .env.example               # 환경변수 예시 파일
├── .eslintrc.json             # ESLint 설정
├── .prettierrc                # Prettier 설정
├── tsconfig.json              # TypeScript 컴파일러 설정
├── package.json               # 프로젝트 메타데이터
├── vite.config.ts             # Vite 빌드 설정
└── README.md                  # 프로젝트 문서
```

### 6.2 주요 디렉토리 설명

| 디렉토리                | 용도                          | 작명 규칙               | 수정 빈도                  |
| ----------------------- | ----------------------------- | ----------------------- | -------------------------- |
| `features/*/pages`      | 라우팅되는 페이지             | PascalCase + `Page.tsx` | 낮음 (화면 추가 시만)      |
| `features/*/components` | UI 컴포넌트 (재사용 가능)     | PascalCase + `.tsx`     | 중간 (UI 수정)             |
| `features/*/hooks`      | 비즈니스 로직, TanStack Query | camelCase + `.ts`       | 높음 (API 로직 수정)       |
| `features/*/api.ts`     | REST API 호출 함수            | camelCase + `.ts`       | 높음 (API 엔드포인트 변경) |
| `features/*/store.ts`   | 전역 상태 (Zustand)           | camelCase + `Store.ts`  | 중간 (상태 스키마 변경)    |
| `lib/`                  | 공유 라이브러리               | —                       | 낮음 (초기 설정 후 안정화) |
| `utils/`                | 순수 함수                     | camelCase + `.ts`       | 낮음 (유틸 로직 확장)      |
| `i18n/`                 | 다국어 리소스                 | `[lang].json`           | 높음 (번역 추가/수정)      |
| `styles/`               | CSS 전역 스타일               | —                       | 낮음 (테마 정의 후 안정화) |

---

## 7. 백엔드 디렉토리 구조

### 7.1 전체 구조

```
backend/
│
├── src/                       # 소스 코드
│   │
│   ├── server.js              # Express 애플리케이션 초기화 및 시작
│   │                           # (포트 리스너, 미들웨어 등록)
│   │
│   ├── app.js                 # Express 앱 인스턴스 및 라우팅 설정
│   │                           # (모든 라우트 등록, CORS 설정)
│   │
│   ├── routes/                # 라우팅 계층 (Express 라우터)
│   │   ├── auth.js            # 인증 관련 라우트 (POST /auth/signup, POST /auth/login)
│   │   ├── users.js           # 사용자 관련 라우트 (GET /users/me, PATCH /users/me)
│   │   ├── todos.js           # 할일 관련 라우트 (GET/POST/PATCH/DELETE /todos)
│   │   ├── categories.js       # 카테고리 관련 라우트 (GET/POST/PATCH/DELETE /categories)
│   │   └── index.js           # 라우트 통합 (모든 라우터를 app에 마운트)
│   │
│   ├── controllers/           # 컨트롤러 계층 (요청 처리)
│   │   ├── authController.js  # 회원가입, 로그인 로직
│   │   │                       # - 입력 검증 → 서비스 호출 → 응답 반환
│   │   ├── userController.js  # 사용자 정보 조회/수정 로직
│   │   ├── todoController.js  # 할일 CRUD, 필터링 로직
│   │   └── categoryController.js # 카테고리 CRUD 로직
│   │
│   ├── services/              # 서비스 계층 (비즈니스 로직)
│   │   ├── authService.js     # 인증 규칙 (BR-101, BR-102)
│   │   │                       # - 비밀번호 해싱, 이메일 중복 확인, JWT 생성
│   │   ├── userService.js     # 사용자 규칙 (BR-201~BR-205)
│   │   │                       # - 사용자 정보 수정, 테마/언어 저장
│   │   ├── todoService.js     # 할일 규칙 (BR-401~BR-403)
│   │   │                       # - 할일 상태 검증, 기한초과 계산, 필터링
│   │   └── categoryService.js # 카테고리 규칙 (BR-301~BR-305)
│   │                           # - 기본 카테고리 보호, 카테고리 삭제 시 할일 이동
│   │
│   ├── middleware/            # 미들웨어 (요청 전처리)
│   │   ├── authMiddleware.js  # JWT 토큰 검증 및 req.user 주입
│   │   └── errorHandler.js    # 에러 처리 미들웨어
│   │
│   ├── db/                    # 데이터베이스 계층
│   │   ├── db.js              # PostgreSQL 연결 관리 (pg 클라이언트, DATE OID 커스텀 파서)
│   │   ├── migrations/        # DB 마이그레이션 스크립트 (선택사항)
│   │   │   └── 001-init.sql   # 테이블 생성 스크립트
│   │   └── seeds/             # 초기 데이터 (선택사항)
│   │       └── seed.js        # 기본 카테고리 생성
│   │
│   ├── lib/                   # 공유 라이브러리 및 유틸리티
│   │   ├── jwt.js             # JWT 서명/검증 함수
│   │   └── passwordUtils.js   # 비밀번호 해싱/검증 함수 (bcryptjs)
│   │
│   ├── utils/                 # 유틸리티 함수 (비즈니스 로직 불포함)
│   │   ├── validators.js      # 입력 검증 함수
│   │   ├── logger.js          # 콘솔 로깅 유틸리티 (log 함수)
│   │   └── errors.js          # 사용자 정의 에러 클래스
│   │
│   └── constants/             # 상수 정의
│       ├── httpStatus.js      # HTTP 상태 코드
│       ├── errorCodes.js      # 에러 코드 (MISSING_FIELD, EMAIL_DUPLICATE 등)
│       └── dbDefaults.js      # DB 기본값 상수 (기본 카테고리 ID, 기본 언어 등)
│
├── tests/                     # 테스트 코드
│   ├── integration/           # 통합 테스트 (API 엔드포인트, 실제 DB 사용)
│   │   ├── auth.test.js       # 인증 API 테스트 (13개)
│   │   ├── users.test.js      # 사용자 API 테스트 (12개)
│   │   ├── categories.test.js # 카테고리 API 테스트 (17개)
│   │   └── todos.test.js      # 할일 API 테스트 (20개)
│   │
│   └── unit/                  # 단위 테스트 (함수/로직)
│       ├── setup.test.js      # DB 연결 확인
│       ├── errors.test.js     # AppError 클래스 테스트
│       ├── validators.test.js # 입력 검증 함수 테스트
│       ├── passwordUtils.test.js # bcryptjs 해싱 테스트
│       ├── jwt.test.js        # JWT 서명/검증 테스트
│       └── authMiddleware.test.js # JWT 미들웨어 테스트 (8개)
│
├── .env.example               # 환경변수 예시 파일
├── .eslintrc.json             # ESLint 설정
├── .prettierrc                # Prettier 설정
├── package.json               # 프로젝트 메타데이터
├── jest.config.js             # Jest 테스트 설정
└── README.md                  # 프로젝트 문서
```

### 7.2 주요 디렉토리 설명

| 디렉토리       | 용도                        | 작명 규칙                   | 책임                                          |
| -------------- | --------------------------- | --------------------------- | --------------------------------------------- |
| `routes/`      | Express 라우터 정의         | camelCase + `Service.js`    | URL 매핑, HTTP 메서드 정의, 미들웨어 연결     |
| `controllers/` | 요청 처리 (Express req/res) | camelCase + `Controller.js` | 입력 검증, 서비스 호출, 응답 반환             |
| `services/`    | 비즈니스 로직 (도메인 규칙) | camelCase + `Service.js`    | 비즈니스 규칙 구현, DB 쿼리 호출, 데이터 변환 |
| `db/`          | DB 연결 및 쿼리             | —                           | PostgreSQL 연결 관리, SQL 실행                |
| `middleware/`  | 요청 전처리                 | camelCase + `Middleware.js` | JWT 검증, 에러 처리, 요청 로깅                |
| `lib/`         | 공유 라이브러리             | camelCase + `.js`           | JWT, 비밀번호 해싱, 유틸 함수                 |
| `utils/`       | 유틸리티 함수               | camelCase + `.js`           | 검증, 포맷팅, 에러 처리                       |
| `constants/`   | 상수 정의                   | camelCase + `.js`           | HTTP 상태, 에러 코드 등                       |

### 7.3 계층 간 데이터 흐름

```
HTTP 요청
   ↓
라우터 (routes/todos.js)
   ↓ GET /api/todos
컨트롤러 (controllers/todoController.js)
   ├─ 입력 검증: 쿼리 파라미터 (category, status, overdue)
   ├─ req.user 확인 (authMiddleware에서 주입된 사용자 ID)
   └─ todoService.getTodos() 호출
       ↓
서비스 (services/todoService.js)
   ├─ 필터 조건 검증 (예: status는 "미시작", "진행중", "완료" 중 하나)
   ├─ 기한초과 여부 계산 (Derived Attribute)
   └─ db.query() 호출 (SQL 쿼리 실행)
       ↓
DB (db/db.js)
   └─ PostgreSQL에서 todos 테이블 조회
       ↓
응답 데이터
   ↓
컨트롤러에서 응답 포맷팅 및 반환
   ↓
HTTP 응답 (200 JSON)
```

---

## 8. 기술 스택 및 라이브러리

### 8.1 프론트엔드 스택

| 영역       | 도구                          | 용도                                       |
| ---------- | ----------------------------- | ------------------------------------------ |
| 프레임워크 | React 19                      | UI 렌더링                                  |
| 언어       | TypeScript                    | 타입 안전성                                |
| 상태 관리  | Zustand                       | 전역 상태 (auth, theme, language, filters) |
| 서버 상태  | TanStack Query (React Query)  | API 캐싱, 동기화, 재요청                   |
| 라우팅     | React Router v6               | 페이지 네비게이션                          |
| 스타일     | CSS Modules 또는 Tailwind CSS | 스타일링                                   |
| 빌드 도구  | Vite                          | 빠른 개발 및 번들링                        |
| 테스트     | Jest + React Testing Library  | 단위/컴포넌트 테스트                       |
| 린트/포맷  | ESLint + Prettier             | 코드 품질                                  |
| 다국어     | i18n (json 리소스 파일)       | 정적 번역                                  |

### 8.2 백엔드 스택

| 영역          | 도구              | 용도                            |
| ------------- | ----------------- | ------------------------------- |
| 런타임        | Node.js           | JavaScript 실행 환경            |
| 언어          | JavaScript (ES6+) | Prisma 금지, 순수 JavaScript    |
| 프레임워크    | Express.js        | HTTP 서버 및 라우팅             |
| DB 클라이언트 | pg                | PostgreSQL 연결 (SQL 직접 작성) |
| 암호화        | bcryptjs          | 비밀번호 해싱                   |
| JWT           | jsonwebtoken      | 토큰 서명/검증                  |
| 테스트        | Jest              | 단위/통합 테스트                |
| 린트/포맷     | ESLint + Prettier | 코드 품질                       |
| 환경변수      | dotenv            | .env 파일 관리                  |

### 8.3 공통 도구

| 도구          | 용도                               |
| ------------- | ---------------------------------- |
| Git           | 버전 관리                          |
| npm 또는 yarn | 패키지 관리                        |
| Docker        | 로컬 개발 DB 컨테이너 (PostgreSQL) |

---

## 9. 개발 시작 가이드

### 9.1 백엔드 초기화 순서

```bash
# 1. 프로젝트 초기화
cd backend
npm init -y
npm install express pg bcryptjs jsonwebtoken dotenv cors

# 2. 환경변수 설정
cp .env.example .env
# .env 파일에 DB_PASSWORD, JWT_SECRET 입력

# 3. DB 마이그레이션 (테이블 생성)
psql -U todolist_user -d todolist -f src/db/migrations/001-init.sql

# 4. DB 시드 (기본 카테고리 생성)
node src/db/seeds/seed.js

# 5. 서버 시작
npm run dev
```

### 9.2 프론트엔드 초기화 순서

```bash
# 1. 프로젝트 생성
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# 2. 필수 라이브러리 설치
npm install zustand @tanstack/react-query react-router-dom

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local에 REACT_APP_API_BASE_URL 입력

# 4. i18n 리소스 파일 생성
# src/i18n/ko.json, en.json 작성

# 5. 개발 서버 시작
npm run dev
```

### 9.3 주요 npm 스크립트

#### 백엔드

```json
{
  "scripts": {
    "dev": "node src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src",
    "format": "prettier --write src"
  }
}
```

#### 프론트엔드

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src",
    "format": "prettier --write src"
  }
}
```

---

## 부록: 참조 자료

### A. 도메인 엔티티 요약

| 엔티티   | 주요 속성                                                                                          | 관련 BR    |
| -------- | -------------------------------------------------------------------------------------------------- | ---------- |
| User     | id, email, password, name, theme(light/dark), language(ko/en/ja), created_at                       | BR-101~205 |
| Category | id, name, user_id (NULL = 기본 카테고리)                                                           | BR-301~305 |
| Todo     | id, title, description, start_date, end_date, status, category_id, user_id, created_at, updated_at | BR-401~403 |

### B. 할일 상태 매트릭스

| 상태   | 조건                                             | 기한초과 여부                  |
| ------ | ------------------------------------------------ | ------------------------------ |
| 미시작 | start_date > today 또는 start_date NULL & 미완료 | false                          |
| 진행중 | start_date ≤ today & end_date ≥ today & 미완료   | false (현재 진행 중이므로)     |
| 완료   | 사용자 명시적 완료                               | false (완료 상태는 항상 false) |
| —      | end_date < today & 상태 ≠ 완료                   | true (기한초과)                |

### C. API 엔드포인트 체크리스트

- [x] POST /api/auth/signup (회원가입)
- [x] POST /api/auth/login (로그인, JWT 발급)
- [x] GET /api/users/me (내 정보 조회)
- [x] PATCH /api/users/me (내 정보 수정, theme/language 포함)
- [x] GET /api/categories (내 카테고리 목록)
- [x] POST /api/categories (카테고리 생성)
- [x] PATCH /api/categories/:id (카테고리 수정)
- [x] DELETE /api/categories/:id (카테고리 삭제)
- [x] GET /api/todos (내 할일 목록, 필터링 포함)
- [x] POST /api/todos (할일 생성)
- [x] PATCH /api/todos/:id (할일 수정)
- [x] DELETE /api/todos/:id (할일 삭제)

### D. 테스트 시나리오 체크리스트

#### 프론트엔드

- [ ] 회원가입 → 로그인 → 할일 등록 흐름
- [ ] 테마 변경 → 즉시 UI 반영 → 로그아웃 → 재로그인 후 테마 유지
- [ ] 언어 변경 → 즉시 UI 반영 → 로그아웃 → 재로그인 후 언어 유지
- [ ] 할일 필터링 (카테고리, 상태, 기한초과)
- [ ] 카테고리 삭제 후 할일이 '기본' 카테고리로 이동

#### 백엔드

- [ ] 이메일 중복 시 회원가입 실패
- [ ] 로그인 토큰이 올바르지 않으면 인증 실패
- [ ] 타인의 할일은 조회/수정/삭제 불가
- [ ] 기본 카테고리는 수정/삭제 불가
- [ ] 종료일자 < 시작일자 입력 시 검증 오류 발생

---

**문서 작성 완료**  
이 문서는 TodoList 프로젝트의 프론트엔드와 백엔드 구조를 통일되게 설계하며, 모든 개발자가 일관된 원칙 하에 코드를 작성할 수 있도록 가이드합니다.
