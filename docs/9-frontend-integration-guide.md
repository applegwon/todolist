# 프론트엔드 통합 가이드

**버전:** 1.1  
**작성일:** 2026-05-28  
**작성자:** Naejune Gwon  
**참조 문서:**
- `docs/2-PRD.md` (제품 요구사항 정의서 v2.3)
- `docs/4-project-structure.md` (프로젝트 구조 설계 원칙 v1.4)
- `docs/6-erd.md` (ERD v1.2)
- `docs/7-execution-plan.md` (실행 계획 v1.1)
- `docs/8-wireframes.md` (와이어프레임 v1.1)
- `swagger/swagger.json` (OpenAPI 3.0.3 명세)

---

## 변경 이력

| 버전 | 작성일 | 변경자 | 변경 내용 |
|------|--------|--------|----------|
| 1.0 | 2026-05-28 | Naejune Gwon | 최초 작성 |
| 1.1 | 2026-05-29 | Naejune Gwon | 일본어(ja) 언어 지원 추가 — TypeScript 타입, settingsStore, useLanguage 훅, PATCH 요청 바디 반영 |
| 1.2 | 2026-05-29 | Naejune Gwon | BUG-01/BUG-02 수정 반영 — 401 조건부 처리(로그인 시도 401은 리다이렉트 금지), DATE 필드 반환 형식 수정("YYYY-MM-DD" 문자열), isoToDateInputValue 로직 수정 |

---

## 1. 개요

이 문서는 TodoList 프론트엔드 개발자가 백엔드 API와 연동할 때 필요한 모든 정보를 담은 통합 가이드이다.  
백엔드 API(포트 3000)는 완성 상태이며, 이 문서는 프론트엔드에서 해당 API를 올바르게 사용하기 위한 실용적 레퍼런스이다.

---

## 2. 기술 스택

| 영역 | 도구 | 버전 | 비고 |
|------|------|------|------|
| 프레임워크 | React | 19 | Vite + `react-ts` 템플릿 |
| 언어 | TypeScript | 5.x | `strict: true` 필수 |
| 전역 상태 | Zustand | 5.x | auth, theme, language, 필터 상태 |
| 서버 상태 | TanStack Query | 5.x | API 캐싱, 비동기 처리 |
| 라우팅 | React Router | v6 | |
| 빌드 | Vite | 6.x | |
| 다국어 | JSON 리소스 파일 | — | 별도 i18n 라이브러리 없이 직접 구현 |

---

## 3. 환경 설정

### 3.1 `.env.local` 설정

```
VITE_API_BASE_URL=http://localhost:3000/api
```

> **주의:** 백엔드 `.env`의 `CORS_ORIGIN`을 프론트엔드 실행 주소로 설정해야 한다.  
> Vite 개발 서버는 기본적으로 `http://localhost:5173`에서 실행되므로  
> 백엔드 `.env`의 `CORS_ORIGIN=http://localhost:5173`으로 변경 후 서버를 재시작한다.

### 3.2 백엔드 서버 연결 확인

백엔드 서버가 실행 중일 때 `http://localhost:3000/api-docs/` 에서 Swagger UI를 확인할 수 있다.

---

## 4. TypeScript 타입 정의

`src/types/index.d.ts`에 정의할 공통 타입이다.

```typescript
// 사용자
export interface User {
  id: number;
  email: string;
  name: string;
  theme: 'light' | 'dark';
  language: 'ko' | 'en' | 'ja';
  created_at?: string; // ISO 8601 datetime (GET /api/users/me 응답에만 포함)
}

// 카테고리
export interface Category {
  id: number;
  name: string;
  user_id: number | null; // null이면 시스템 공통 '기본' 카테고리
}

// 할일
export interface Todo {
  id: number;
  title: string;
  description: string | null;
  start_date: string | null; // "YYYY-MM-DD" 문자열 (예: "2026-05-27")
  end_date: string | null;   // "YYYY-MM-DD" 문자열
  status: '미시작' | '진행중' | '완료';
  category_id: number;
  user_id: number;
  created_at: string;        // ISO 8601 datetime
  updated_at: string;        // ISO 8601 datetime
  is_overdue: boolean;       // 동적 계산 필드 (DB에 저장되지 않음)
}

// API 에러 응답
export interface ApiError {
  status: number;
  message: string;
  code: ErrorCode;
}

// 에러 코드 유니온 타입
export type ErrorCode =
  | 'MISSING_FIELD'
  | 'INVALID_FORMAT'
  | 'EMAIL_DUPLICATE'
  | 'INVALID_CREDENTIALS'
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'CATEGORY_NAME_DUPLICATE'
  | 'TODO_FORBIDDEN'
  | 'INVALID_DATE_RANGE';

// API 응답 래퍼 (필요 시)
export interface ApiResponse<T> {
  data: T;
}

// 할일 생성/수정 요청 바디
export interface CreateTodoRequest {
  title: string;
  description?: string;
  category_id?: number;
  start_date?: string; // "YYYY-MM-DD" 형식으로 전송
  end_date?: string;   // "YYYY-MM-DD" 형식으로 전송
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  category_id?: number;
  start_date?: string;
  end_date?: string;
  status?: '미시작' | '진행중' | '완료';
}

// 할일 목록 필터
export interface TodoFilters {
  category?: number;
  status?: '미시작' | '진행중' | '완료';
  overdue?: 'true';
}

// 사용자 수정 요청 바디
export interface UpdateUserRequest {
  name?: string;
  password?: string;
  theme?: 'light' | 'dark';
  language?: 'ko' | 'en' | 'ja';
}
```

---

## 5. API 클라이언트 (`src/lib/api.ts`)

```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const data = await res.json();

  if (!res.ok) {
    // 401: 기존 토큰이 있을 때만 세션 만료로 간주 → 로그아웃 처리
    // 토큰 없이 발생한 401(예: 로그인 실패)은 리다이렉트하지 않고 에러만 throw
    if (res.status === 401 && token) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    // 에러를 throw하여 TanStack Query가 처리
    throw data; // { status, message, code } 형태
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};
```

---

## 6. 전역 상태 (Zustand)

### 6.1 인증 스토어 (`src/features/auth/authStore.ts`)

```typescript
import { create } from 'zustand';
import type { User } from '../../types';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
}));
```

### 6.2 설정 스토어 (`src/features/users/settingsStore.ts`)

테마·언어는 로그인 직후 `authStore`의 user 값을 기반으로 초기화한다.

```typescript
import { create } from 'zustand';

interface SettingsState {
  theme: 'light' | 'dark';
  language: 'ko' | 'en' | 'ja';
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'ko' | 'en' | 'ja') => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'light',
  language: 'ko',
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  setLanguage: (language) => {
    set({ language });
  },
}));

// 지원 언어: 'ko' (한국어), 'en' (영어), 'ja' (일본어)
```

### 6.3 할일 필터 스토어 (`src/features/todos/todoStore.ts`)

```typescript
import { create } from 'zustand';
import type { TodoFilters } from '../../types';

interface TodoFilterState {
  filters: TodoFilters;
  setFilters: (filters: Partial<TodoFilters>) => void;
  resetFilters: () => void;
}

export const useTodoFilterStore = create<TodoFilterState>((set) => ({
  filters: {},
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: {} }),
}));
```

---

## 7. API별 연동 명세

### 7.1 인증 (`src/features/auth/api.ts`)

#### POST /api/auth/signup — 회원가입

**요청**
```typescript
interface SignupRequest {
  email: string;    // 이메일 형식 필수
  password: string; // 8자 이상, 영문 1자+숫자 1자 포함, 공백 불허
  name: string;     // 필수
}
```

**성공 응답 (201)**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "홍길동"
}
```

**에러 응답**

| 상태 코드 | code | 메시지 | 처리 |
|-----------|------|--------|------|
| 400 | `MISSING_FIELD` | "이메일, 비밀번호, 이름은 필수입니다" | 폼 오류 표시 |
| 400 | `INVALID_FORMAT` | "유효하지 않은 이메일 형식입니다" / "비밀번호는 ..." | 폼 오류 표시 |
| 409 | `EMAIL_DUPLICATE` | "이미 사용 중인 이메일입니다" | "이미 사용 중인 이메일입니다" 표시 |

---

#### POST /api/auth/login — 로그인

**요청**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**성공 응답 (200)**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "theme": "light",
    "language": "ko"
  }
}
```

**로그인 후 처리 순서:**
1. `token`을 `localStorage`에 저장 + `authStore.setAuth()` 호출
2. `user.theme`, `user.language` 로 `settingsStore` 초기화
3. `document.documentElement.setAttribute('data-theme', user.theme)` 적용
4. `/` (할일 목록)으로 이동

**에러 응답**

| 상태 코드 | code | 처리 |
|-----------|------|------|
| 400 | `MISSING_FIELD` | 폼 오류 표시 |
| 401 | `INVALID_CREDENTIALS` | "이메일 또는 비밀번호가 올바르지 않습니다" 표시 |

---

### 7.2 사용자 (`src/features/users/api.ts`)

#### GET /api/users/me — 내 정보 조회

**헤더:** `Authorization: Bearer {token}` 필수

**성공 응답 (200)**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "홍길동",
  "theme": "light",
  "language": "ko",
  "created_at": "2026-05-28T10:00:00.000Z"
}
```

---

#### PATCH /api/users/me — 내 정보 수정

**헤더:** `Authorization: Bearer {token}` 필수

**요청 (변경할 필드만 포함)**
```typescript
{
  name?: string;
  password?: string; // 변경 시에만 포함, 빈 문자열 전송 금지
  theme?: 'light' | 'dark';
  language?: 'ko' | 'en' | 'ja';
}
```

**성공 응답 (200)**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "홍길동",
  "theme": "dark",
  "language": "en",
  "created_at": "2026-05-28T10:00:00.000Z"
}
```

**에러 응답**

| 상태 코드 | code | 처리 |
|-----------|------|------|
| 400 | `MISSING_FIELD` | "수정할 항목이 없습니다" (빈 바디 전송 시) |
| 400 | `INVALID_FORMAT` | 비밀번호 정책 위반 |
| 401 | `AUTH_REQUIRED` | 로그인 페이지로 이동 |

---

### 7.3 카테고리 (`src/features/categories/api.ts`)

#### GET /api/categories — 카테고리 목록 조회

**헤더:** `Authorization: Bearer {token}` 필수

**성공 응답 (200)**
```json
[
  { "id": 1, "name": "기본", "user_id": null },
  { "id": 2, "name": "업무", "user_id": 1 },
  { "id": 3, "name": "개인", "user_id": 1 }
]
```

> **중요:** `user_id === null`인 항목이 시스템 공통 '기본' 카테고리이다.  
> 이 카테고리는 수정/삭제 버튼을 비활성화해야 한다 (UC-304).

---

#### POST /api/categories — 카테고리 생성

**요청**
```json
{ "name": "스터디" }
```

**성공 응답 (201)**
```json
{ "id": 4, "name": "스터디", "user_id": 1 }
```

**에러 응답**

| 상태 코드 | code | 처리 |
|-----------|------|------|
| 400 | `MISSING_FIELD` | "이름을 입력해주세요" 표시 |
| 409 | `CATEGORY_NAME_DUPLICATE` | "이미 사용 중인 카테고리 이름입니다" 표시 |

---

#### PATCH /api/categories/:id — 카테고리 수정

**요청**
```json
{ "name": "스터디(수정)" }
```

**성공 응답 (200)**
```json
{ "id": 4, "name": "스터디(수정)", "user_id": 1 }
```

**에러 응답**

| 상태 코드 | code | 처리 |
|-----------|------|------|
| 400 | `MISSING_FIELD` | 폼 오류 표시 |
| 403 | `FORBIDDEN` | "수정 권한이 없습니다" (기본 카테고리 또는 타인 소유) |
| 404 | `NOT_FOUND` | "카테고리를 찾을 수 없습니다" |
| 409 | `CATEGORY_NAME_DUPLICATE` | "이미 사용 중인 카테고리 이름입니다" |

---

#### DELETE /api/categories/:id — 카테고리 삭제

**성공 응답:** `204 No Content`

**에러 응답**

| 상태 코드 | code | 처리 |
|-----------|------|------|
| 403 | `FORBIDDEN` | "삭제 권한이 없습니다" (기본 카테고리 또는 타인 소유) |
| 404 | `NOT_FOUND` | "카테고리를 찾을 수 없습니다" |

> **주의:** 카테고리 삭제 시 소속 할일들이 백엔드에서 자동으로 '기본' 카테고리(id=1)로 이동된다.  
> 삭제 성공 후 할일 목록 캐시도 무효화해야 한다.

---

### 7.4 할일 (`src/features/todos/api.ts`)

#### GET /api/todos — 할일 목록 조회

**헤더:** `Authorization: Bearer {token}` 필수

**쿼리 파라미터**

| 파라미터 | 타입 | 설명 | 예시 |
|----------|------|------|------|
| `category` | number | 카테고리 ID | `?category=2` |
| `status` | string | 상태 값 | `?status=진행중` |
| `overdue` | string | 기한초과 필터 | `?overdue=true` |

> **주의:** `overdue` 파라미터는 boolean이 아닌 **문자열** `"true"`로 전송해야 한다.  
> 백엔드에서 `=== 'true'` 비교를 사용한다.

**성공 응답 (200)**
```json
[
  {
    "id": 1,
    "title": "중간고사 공부",
    "description": null,
    "start_date": null,
    "end_date": null,
    "status": "미시작",
    "category_id": 1,
    "user_id": 1,
    "created_at": "2026-05-28T10:00:00.000Z",
    "updated_at": "2026-05-28T10:00:00.000Z",
    "is_overdue": false
  },
  {
    "id": 2,
    "title": "거래처 계약서 검토",
    "description": "3건 검토 필요",
    "start_date": "2026-05-20",
    "end_date": "2026-05-22",
    "status": "미시작",
    "category_id": 1,
    "user_id": 1,
    "created_at": "2026-05-28T10:05:00.000Z",
    "updated_at": "2026-05-28T10:05:00.000Z",
    "is_overdue": true
  }
]
```

> **날짜 형식:** `start_date`, `end_date`는 DB `DATE` 타입이며, API 응답도 `"YYYY-MM-DD"` 문자열로 반환된다.  
> (`backend/src/db/db.js`에서 `pg` DATE OID 커스텀 파서로 처리)  
> 화면 표시 시 `formatDateDisplay(todo.end_date)` 유틸 함수를 사용한다.

---

#### POST /api/todos — 할일 생성

**요청**
```json
{
  "title": "새 할일",
  "description": "상세 설명 (선택)",
  "category_id": 2,
  "start_date": "2026-05-28",
  "end_date": "2026-05-30"
}
```

> 날짜 전송 형식은 `"YYYY-MM-DD"` 문자열이다.  
> `category_id` 생략 시 백엔드에서 자동으로 기본 카테고리(id=1)가 적용된다.

**성공 응답 (201):** 생성된 할일 객체 (위 Todo 타입과 동일, `is_overdue` 포함)

**에러 응답**

| 상태 코드 | code | 처리 |
|-----------|------|------|
| 400 | `MISSING_FIELD` | "제목을 입력해주세요" |
| 400 | `INVALID_DATE_RANGE` | "종료일자는 시작일자보다 이전일 수 없습니다" |

---

#### PATCH /api/todos/:id — 할일 수정

**요청 (변경할 필드만 포함)**
```json
{
  "title": "수정된 제목",
  "status": "완료",
  "end_date": "2026-06-01"
}
```

**성공 응답 (200):** 수정된 할일 객체

**에러 응답**

| 상태 코드 | code | 처리 |
|-----------|------|------|
| 400 | `MISSING_FIELD` | "수정할 항목이 없습니다" |
| 400 | `INVALID_DATE_RANGE` | 날짜 범위 오류 |
| 403 | `TODO_FORBIDDEN` | "수정 권한이 없습니다" |
| 404 | `NOT_FOUND` | "할일을 찾을 수 없습니다" |

---

#### DELETE /api/todos/:id — 할일 삭제

**성공 응답:** `204 No Content`

**에러 응답**

| 상태 코드 | code | 처리 |
|-----------|------|------|
| 403 | `TODO_FORBIDDEN` | "삭제 권한이 없습니다" |
| 404 | `NOT_FOUND` | "할일을 찾을 수 없습니다" |

---

## 8. 에러 처리 패턴

### 8.1 에러 코드 → UI 메시지 매핑

```typescript
// src/utils/errorMessages.ts
export const ERROR_MESSAGES: Record<string, string> = {
  MISSING_FIELD: '필수 항목을 입력해주세요',
  INVALID_FORMAT: '입력 형식이 올바르지 않습니다',
  EMAIL_DUPLICATE: '이미 사용 중인 이메일입니다',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다',
  AUTH_REQUIRED: '로그인이 필요합니다',
  FORBIDDEN: '권한이 없습니다',
  NOT_FOUND: '데이터를 찾을 수 없습니다',
  CATEGORY_NAME_DUPLICATE: '이미 사용 중인 카테고리 이름입니다',
  TODO_FORBIDDEN: '해당 할일에 대한 권한이 없습니다',
  INVALID_DATE_RANGE: '종료일자는 시작일자보다 이전일 수 없습니다',
  INTERNAL_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
};

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    return ERROR_MESSAGES[code] ?? '오류가 발생했습니다';
  }
  return '오류가 발생했습니다';
}
```

### 8.2 TanStack Query에서 에러 처리

```typescript
const mutation = useMutation({
  mutationFn: (data: CreateTodoRequest) => api.post<Todo>('/todos', data),
  onError: (error) => {
    // error는 백엔드의 { status, message, code } 객체
    setErrorMessage(getErrorMessage(error));
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
    navigate('/');
  },
});
```

---

## 9. 라우팅 설정 (`src/App.tsx`)

```typescript
// React Router v6 기준
const routes = [
  { path: '/login',           element: <LoginPage />,      auth: false },
  { path: '/signup',          element: <SignupPage />,     auth: false },
  { path: '/',                element: <TodoListPage />,   auth: true  },
  { path: '/todos/new',       element: <TodoCreatePage />, auth: true  },
  { path: '/todos/:id/edit',  element: <TodoEditPage />,   auth: true  },
  { path: '/categories',      element: <CategoriesPage />, auth: true  },
  { path: '/profile',         element: <ProfilePage />,    auth: true  },
];
```

`ProtectedRoute`는 `authStore.token`이 없으면 `/login`으로 리다이렉트한다.

---

## 10. TanStack Query 쿼리 키 규칙

| 쿼리 키 | 설명 | 무효화 시점 |
|---------|------|-------------|
| `['todos']` | 전체 할일 목록 | 할일 생성/수정/삭제, 카테고리 삭제 후 |
| `['todos', filters]` | 필터 적용 목록 | 필터 변경 시 |
| `['categories']` | 카테고리 목록 | 카테고리 생성/수정/삭제 후 |
| `['profile']` | 내 정보 | 내 정보 수정 후 |

```typescript
// 카테고리 삭제 후 관련 쿼리 모두 무효화
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['categories'] });
  queryClient.invalidateQueries({ queryKey: ['todos'] }); // 할일 category_id 변경됨
};
```

---

## 11. 테마 및 다국어 구현

### 11.1 테마 (`src/hooks/useTheme.ts`)

CSS 변수 방식으로 구현한다. `data-theme` 속성을 `documentElement`에 적용한다.

```css
/* src/styles/variables.css */
:root {
  --bg-primary: #ffffff;
  --text-primary: #212121;
  --border-color: #e0e0e0;
}

[data-theme="dark"] {
  --bg-primary: #1e1e1e;
  --text-primary: #f5f5f5;
  --border-color: #424242;
}
```

```typescript
// src/hooks/useTheme.ts
import { useSettingsStore } from '../features/users/settingsStore';

export function useTheme() {
  const { theme, setTheme } = useSettingsStore();

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme); // 내부에서 document.documentElement에 적용
  };

  return { theme, toggleTheme };
}
```

**테마 초기화 시점:**  
로그인 성공 직후 `user.theme` 값으로 즉시 적용한다.

```typescript
// useLogin.ts 내
onSuccess: ({ token, user }) => {
  authStore.setAuth(token, user);
  settingsStore.setTheme(user.theme);    // 즉시 테마 적용
  settingsStore.setLanguage(user.language); // 즉시 언어 적용
  navigate('/');
},
```

### 11.2 다국어 (`src/hooks/useLanguage.ts`)

별도 i18n 라이브러리 없이 JSON 파일과 커스텀 훅으로 구현한다.

```typescript
// src/i18n/ko.json (발췌)
{
  "common": {
    "save": "저장",
    "cancel": "취소",
    "delete": "삭제",
    "edit": "수정",
    "loading": "로딩 중...",
    "error": "오류가 발생했습니다"
  },
  "auth": {
    "login": "로그인",
    "signup": "회원가입",
    "email": "이메일",
    "password": "비밀번호",
    "name": "이름"
  },
  "todo": {
    "title": "제목",
    "description": "설명",
    "status": "상태",
    "startDate": "시작일자",
    "endDate": "종료일자",
    "category": "카테고리",
    "overdue": "기한초과",
    "statusOptions": {
      "미시작": "미시작",
      "진행중": "진행중",
      "완료": "완료"
    }
  }
}
```

```typescript
// src/hooks/useLanguage.ts
import { useSettingsStore } from '../features/users/settingsStore';
import ko from '../i18n/ko.json';
import en from '../i18n/en.json';
import ja from '../i18n/ja.json';

const translations = { ko, en, ja } as const;

export function useLanguage() {
  const { language, setLanguage } = useSettingsStore();
  const t = translations[language];
  return { language, setLanguage, t };
}
```

---

## 12. 날짜 유틸리티 (`src/utils/dateUtils.ts`)

```typescript
// "YYYY-MM-DD" → 사용자 표시용 문자열 변환
export function formatDateDisplay(dateString: string | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// API 응답 날짜("YYYY-MM-DD") → <input type="date"> 기본값으로 변환
// 로컬 시간 메서드를 사용해 KST 환경에서의 UTC 직렬화 오프셋 오류 방지
export function isoToDateInputValue(isoString: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
```

---

## 13. 인증 플로우 다이어그램

```
[미인증 사용자]
    │
    ├── 회원가입 (S-01)
    │   POST /api/auth/signup
    │   성공 → 로그인 페이지(S-02)로 이동
    │
    └── 로그인 (S-02)
        POST /api/auth/login
        성공 → { token, user: { theme, language } }
              ├── localStorage.setItem('token', token)
              ├── settingsStore.setTheme(user.theme)
              ├── settingsStore.setLanguage(user.language)
              └── navigate('/')

[인증된 사용자]
    │
    ├── 모든 API 요청에 Authorization: Bearer {token} 헤더 자동 포함
    ├── 401 응답 시 + 기존 토큰 있음(세션 만료) → localStorage.removeItem('token') + navigate('/login')
    ├── 401 응답 시 + 토큰 없음(로그인 실패 등) → 에러만 throw, 리다이렉트 없음
    └── 로그아웃 버튼 → localStorage.removeItem('token') + navigate('/login')
```

---

## 14. 화면별 API 연동 요약

| 화면 | API | 비고 |
|------|-----|------|
| S-01 회원가입 | `POST /api/auth/signup` | 성공 시 `/login`으로 이동 |
| S-02 로그인 | `POST /api/auth/login` | 성공 시 theme/language 즉시 적용 후 `/`로 이동 |
| S-03 할일 목록 | `GET /api/todos[?category=&status=&overdue=]` | 필터 변경 시 재요청 |
| S-03 할일 삭제 | `DELETE /api/todos/:id` | 성공 시 목록 캐시 무효화 |
| S-04 할일 등록 | `GET /api/categories`, `POST /api/todos` | 카테고리 목록 먼저 로드 |
| S-05 할일 수정 | `GET /api/categories`, `PATCH /api/todos/:id` | 기존 데이터 폼에 미리 채움 |
| S-06 카테고리 관리 | `GET /api/categories`, `POST/PATCH/DELETE /api/categories/:id` | 기본 카테고리(user_id=null) 수정/삭제 불가 |
| S-07 내 정보 수정 | `GET /api/users/me`, `PATCH /api/users/me` | 테마/언어 변경 즉시 UI 적용 |

---

## 15. 클라이언트 유효성 검사 규칙

서버 오류를 줄이기 위해 아래 검증은 클라이언트에서 먼저 수행한다.

| 항목 | 규칙 | 에러 메시지 |
|------|------|-------------|
| 이메일 | RFC 5322 이메일 형식 | "유효한 이메일을 입력해주세요" |
| 비밀번호 | 8자 이상, 영문 1자+숫자 1자 포함, 공백 불허 | "비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다" |
| 할일 제목 | 빈 문자열 불허 | "제목을 입력해주세요" |
| 종료일자 | start_date 입력 시 end_date ≥ start_date | "종료일자는 시작일자보다 이전일 수 없습니다" |

```typescript
// src/utils/validatePassword.ts
export function validatePassword(password: string): string | null {
  if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다';
  if (!/[a-zA-Z]/.test(password)) return '영문을 1자 이상 포함해야 합니다';
  if (!/[0-9]/.test(password)) return '숫자를 1자 이상 포함해야 합니다';
  if (/\s/.test(password)) return '공백을 포함할 수 없습니다';
  return null;
}
```

---

## 16. 백엔드 에러 전체 목록

| code | HTTP | 발생 상황 |
|------|------|----------|
| `MISSING_FIELD` | 400 | 필수 필드 누락 또는 수정 항목 없음 |
| `INVALID_FORMAT` | 400 | 이메일/비밀번호 형식 오류 |
| `INVALID_DATE_RANGE` | 400 | end_date < start_date |
| `INVALID_CREDENTIALS` | 401 | 이메일 또는 비밀번호 불일치 |
| `AUTH_REQUIRED` | 401 | JWT 토큰 없음 또는 만료 |
| `FORBIDDEN` | 403 | 기본 카테고리 수정/삭제, 타인 소유 카테고리 접근 |
| `TODO_FORBIDDEN` | 403 | 타인 소유 할일 수정/삭제 |
| `NOT_FOUND` | 404 | 카테고리 또는 할일 없음 |
| `EMAIL_DUPLICATE` | 409 | 이메일 중복 |
| `CATEGORY_NAME_DUPLICATE` | 409 | 카테고리 이름 중복 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 |

---

## 17. 개발 시작 체크리스트

- [ ] `npm create vite@latest frontend -- --template react-ts`
- [ ] `npm install zustand @tanstack/react-query react-router-dom`
- [ ] `.env.local`에 `VITE_API_BASE_URL=http://localhost:3000/api` 설정
- [ ] 백엔드 `.env`의 `CORS_ORIGIN=http://localhost:5173`으로 변경 후 서버 재시작
- [ ] `src/types/index.d.ts` 타입 정의 작성
- [ ] `src/lib/api.ts` API 클라이언트 구현
- [ ] `src/lib/queryClient.ts` TanStack Query 클라이언트 생성
- [ ] `src/styles/variables.css` CSS 변수 정의 (light/dark)
- [ ] `src/i18n/ko.json`, `src/i18n/en.json`, `src/i18n/ja.json` 번역 파일 작성
- [ ] `src/features/auth/authStore.ts` Zustand 스토어 생성
- [ ] `http://localhost:3000/api-docs/` 에서 API 명세 확인
