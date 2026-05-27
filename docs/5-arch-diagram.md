# 기술 아키텍처 다이어그램

**버전:** 1.1  
**작성일:** 2026-05-27  
**작성자:** Naejune Gwon

---

## 변경 이력

| 버전 | 작성일     | 변경자       | 변경 내용                                                                         |
| ---- | ---------- | ------------ | --------------------------------------------------------------------------------- |
| 1.0  | 2026-05-27 | Naejune Gwon | 최초 작성                                                                         |
| 1.1  | 2026-05-27 | Naejune Gwon | 유지보수성 원칙 타입 안정성 표현 명확화 (FE/BE 범위 구분), bcrypt → bcryptjs 통일 |

---

## 1. 시스템 전체 구성도

사용자의 브라우저에서 시작하여 프론트엔드, 백엔드, 데이터베이스까지 전체 시스템의 계층 구조를 나타냅니다.

```mermaid
graph TB
    User["👤 사용자<br/>(브라우저)"]
    Frontend["🎨 프론트엔드<br/>(React 19 + TypeScript)"]
    Backend["⚙️ 백엔드<br/>(Node.js + Express)"]
    DB["🗄️ 데이터베이스<br/>(PostgreSQL 17)"]

    User -->|HTTP 요청| Frontend
    Frontend -->|REST API| Backend
    Backend -->|SQL 쿼리| DB

    DB -->|데이터 조회| Backend
    Backend -->|JSON 응답| Frontend
    Frontend -->|렌더링| User
```

---

## 2. 백엔드 레이어 구조

Express 프레임워크의 계층별 흐름을 나타냅니다. Routes → Controllers → Services → Database 순서로 데이터가 처리됩니다.

```mermaid
graph TD
    Request["HTTP 요청"]
    Routes["🔗 Routes<br/>(라우팅 계층)<br/>routes/auth.js<br/>routes/users.js<br/>routes/todos.js<br/>routes/categories.js"]
    Middleware["🔐 Middleware<br/>(미들웨어)<br/>authMiddleware.js<br/>errorHandler.js"]
    Controllers["🎮 Controllers<br/>(컨트롤러 계층)<br/>authController.js<br/>userController.js<br/>todoController.js<br/>categoryController.js"]
    Services["💼 Services<br/>(비즈니스 로직)<br/>authService.js<br/>userService.js<br/>todoService.js<br/>categoryService.js"]
    DB["🗄️ Database Layer<br/>(데이터 접근)<br/>db.js + pg client<br/>SQL 쿼리 실행"]

    Request -->|URL 매핑| Routes
    Routes -->|검증, 주입| Middleware
    Middleware -->|요청 처리| Controllers
    Controllers -->|비즈니스 규칙| Services
    Services -->|쿼리 실행| DB

    DB -->|조회 결과| Services
    Services -->|데이터 변환| Controllers
    Controllers -->|응답 포맷팅| Response["JSON 응답<br/>(200, 201, 400, 401 등)"]
```

---

## 3. 프론트엔드 레이어 구조

React의 계층별 흐름을 나타냅니다. Pages → Components → Hooks → Zustand/TanStack Query → API Client 순서로 상태와 데이터가 관리됩니다.

```mermaid
graph TD
    User["👤 사용자 인터랙션<br/>(클릭, 입력 등)"]
    Pages["📄 Pages<br/>(페이지 컴포넌트)<br/>LoginPage.jsx<br/>TodoListPage.jsx<br/>ProfilePage.jsx"]
    Components["🧩 Components<br/>(UI 컴포넌트)<br/>TodoList.jsx<br/>TodoForm.jsx<br/>LoginForm.jsx"]
    Hooks["⚓ Hooks<br/>(비즈니스 로직)<br/>useTodos.js<br/>useLogin.js<br/>useProfile.js"]
    Store["🏪 Zustand Store<br/>(전역 상태)<br/>authStore.js<br/>todoStore.js<br/>profileStore.js"]
    Query["🔄 TanStack Query<br/>(서버 상태)<br/>todoQueries.js<br/>categoryQueries.js"]
    API["📡 API Client<br/>(HTTP 통신)<br/>lib/api.js<br/>토큰 주입"]
    Backend["⚙️ 백엔드 API<br/>REST Endpoints"]

    User -->|이벤트| Pages
    Pages -->|렌더링| Components
    Components -->|상태/로직| Hooks
    Hooks -->|상태 읽기/쓰기| Store
    Hooks -->|데이터 캐싱| Query
    Query -->|API 호출| API
    API -->|HTTP 요청| Backend

    Backend -->|JSON 응답| API
    API -->|캐시 업데이트| Query
    Query -->|상태 업데이트| Hooks
    Hooks -->|상태 전파| Components
    Components -->|UI 렌더링| Pages
```

---

## 4. 인증 흐름 (JWT 기반)

사용자 로그인부터 인증된 API 요청까지의 전체 흐름을 시간 순서대로 나타냅니다.

```mermaid
sequenceDiagram
    participant Browser as 📱 브라우저
    participant Frontend as 🎨 프론트엔드
    participant Backend as ⚙️ 백엔드
    participant DB as 🗄️ DB

    Note over Browser,DB: 회원가입 / 로그인 단계
    Browser->>Frontend: 이메일, 비밀번호 입력
    Frontend->>Backend: POST /api/auth/signup 또는 /login
    Backend->>DB: 사용자 조회 및 검증
    DB-->>Backend: 사용자 데이터 반환
    Backend->>Backend: 비밀번호 bcryptjs 검증
    Backend->>Backend: JWT 토큰 생성 (userId, email)
    Backend-->>Frontend: { token, user, theme, language }
    Frontend->>Frontend: localStorage.setItem('token', token)
    Frontend-->>Browser: 홈 페이지로 리다이렉트

    Note over Browser,DB: 인증된 API 요청 단계
    Browser->>Frontend: 할일 목록 조회 요청
    Frontend->>Frontend: localStorage.getItem('token')
    Frontend->>Backend: GET /api/todos<br/>Authorization: Bearer [token]
    Backend->>Backend: authMiddleware 검증
    Backend->>DB: 쿼리 (WHERE user_id = $1)
    DB-->>Backend: 할일 데이터 반환
    Backend-->>Frontend: { todos: [...] }
    Frontend-->>Browser: 할일 목록 렌더링
```

---

## 5. 데이터 모델 관계도

users, categories, todos 테이블 간의 관계를 ER 다이어그램 형식으로 나타냅니다.

```mermaid
erDiagram
    USERS ||--o{ CATEGORIES : "owns"
    USERS ||--o{ TODOS : "owns"
    CATEGORIES ||--o{ TODOS : "contains"

    USERS {
        int id PK
        string email UK
        string password "bcrypt hashed"
        string name
        string theme "light/dark"
        string language "ko/en"
        timestamp created_at
    }

    CATEGORIES {
        int id PK
        string name
        int user_id FK "NULL = 기본 카테고리"
    }

    TODOS {
        int id PK
        string title
        text description "선택"
        date start_date "선택"
        date end_date "선택"
        string status "미시작/진행중/완료"
        int category_id FK
        int user_id FK
        timestamp created_at
        timestamp updated_at
    }
```

---

## 6. 주요 기능별 상호작용

할일 조회, 등록, 수정, 삭제 및 필터링 과정에서 프론트엔드와 백엔드 간의 상호작용을 나타냅니다.

### 6.1 할일 목록 조회 (필터 포함)

```mermaid
graph LR
    A["사용자가<br/>필터 선택"] -->|category/status/overdue| B["프론트엔드<br/>TanStack Query"]
    B -->|GET /api/todos?<br/>category=1&status=진행중| C["백엔드<br/>todoController"]
    C -->|검증 & 필터링| D["todoService<br/>기한초과 계산"]
    D -->|SELECT with WHERE| E["PostgreSQL<br/>todos 테이블"]
    E -->|Row 반환| D
    D -->|필터링된 데이터| C
    C -->|JSON 응답| B
    B -->|캐시 & 상태 업데이트| F["프론트엔드<br/>Zustand Store"]
    F -->|렌더링| G["📋 할일 목록<br/>UI 업데이트"]
```

### 6.2 할일 등록

```mermaid
graph LR
    A["사용자<br/>폼 제출"] -->|title, description| B["프론트엔드<br/>useTodoCreate"]
    B -->|검증| C["POST /api/todos<br/>{ title, categoryId, ... }"]
    C -->|요청| D["백엔드<br/>todoController"]
    D -->|검증 & 권한 확인| E["todoService<br/>createTodo()"]
    E -->|INSERT INTO todos| F["PostgreSQL"]
    F -->|id 반환| E
    E -->|생성된 할일| D
    D -->|{ id, title, ... }| C
    C -->|캐시 무효화 & 상태 갱신| B
    B -->|목록 새로고침| G["📋 할일 목록<br/>새 항목 추가"]
```

---

## 7. 기술 스택 레이어

프론트엔드와 백엔드의 기술 스택을 계층별로 나타냅니다.

```mermaid
graph TB
    subgraph Frontend["🎨 프론트엔드"]
        direction TB
        UI["UI 라이브러리<br/>React 19"]
        State["상태 관리<br/>Zustand + TanStack Query"]
        Build["빌드 도구<br/>Vite"]
        Lang["언어<br/>TypeScript"]
        Style["스타일<br/>CSS Modules / Tailwind"]
    end

    subgraph Backend["⚙️ 백엔드"]
        direction TB
        Runtime["런타임<br/>Node.js"]
        Framework["프레임워크<br/>Express.js"]
        Auth["인증<br/>JWT + bcryptjs"]
        DBLib["DB 클라이언트<br/>pg (Prisma 금지)"]
    end

    subgraph Database["🗄️ 데이터베이스"]
        direction TB
        DBMS["DBMS<br/>PostgreSQL 17"]
        Tables["테이블<br/>users, categories, todos"]
    end

    subgraph DevTools["🛠️ 개발 도구"]
        direction TB
        Test["테스트<br/>Jest + React Testing Library"]
        Lint["린트 & 포맷<br/>ESLint + Prettier"]
        VCS["버전 관리<br/>Git"]
    end

    Frontend -->|REST API| Backend
    Backend -->|SQL| Database
    DevTools -.->|개발 지원| Frontend
    DevTools -.->|개발 지원| Backend
```

---

## 8. 네트워크 통신 구조

프론트엔드와 백엔드 간의 HTTP 통신을 나타냅니다.

```mermaid
graph LR
    Client["🌐 클라이언트<br/>(localhost:5173)"]
    Server["🔗 서버<br/>(localhost:3000)"]

    Client -->|HTTP/REST<br/>+ JWT Token<br/>+ JSON| Server
    Client -->|Content-Type<br/>application/json| Server

    Server -->|CORS 허용<br/>credentials: true| Client
    Server -->|HTTP Status<br/>+ JSON| Client

    style Client fill:#e1f5ff
    style Server fill:#fff3e0
```

---

## 아키텍처 설계 원칙

### 단순성 (Simplicity)

- 필수 기능에 집중하여 불필요한 복잡도 제거
- REST API로 프론트엔드와 백엔드 분리
- 한 가지 책임만 수행하는 계층 설계

### 확장성 (Extensibility)

- 도메인별 폴더 구조로 새 기능 추가 시 기존 코드 수정 최소화
- 공통 라이브러리(lib/)에 재사용 가능한 함수 집중
- 미들웨어 기반의 횡단 관심사 처리

### 유지보수성 (Maintainability)

- 계층 간 명확한 의존성 방향 (하향 의존 원칙)
- 한국어 주석으로 의도와 비즈니스 규칙 명시
- 타입 안정성 (프론트엔드: TypeScript, 백엔드: 입력 검증으로 안전성 확보)

---

**문서 작성 완료**  
이 아키텍처 다이어그램은 TodoList 앱의 전체 구조를 시각적으로 나타내며, 개발자가 각 계층의 역할을 명확히 이해할 수 있도록 설계되었습니다.
