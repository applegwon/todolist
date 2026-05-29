# TodoList 앱

개인 할일을 등록·조회·수정·삭제하고, 카테고리 분류 및 시작일/종료일 기반 일정 관리를 지원하는 웹 기반 할일 관리 애플리케이션입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 19 + TypeScript + Vite |
| 상태 관리 | Zustand + TanStack Query v5 |
| 라우팅 | React Router v6 |
| 백엔드 | Node.js + Express.js |
| 데이터베이스 | PostgreSQL 17 |
| DB 클라이언트 | pg (ORM 미사용, 직접 SQL 작성) |
| 인증 | JWT (jsonwebtoken) |
| 암호화 | bcryptjs |

## 주요 기능

- **인증**: 이메일/비밀번호 회원가입 및 로그인 (JWT 발급)
- **할일 관리**: 할일 CRUD, 카테고리·상태·기한초과 필터링
- **카테고리 관리**: 카테고리 CRUD ('기본' 카테고리는 수정/삭제 불가)
- **사용자 설정**: 이름·비밀번호 변경, 테마(Light/Dark), 언어(한국어/영어/일본어) 선택
- **기한초과 자동 계산**: `end_date < 오늘 AND 상태 ≠ 완료` 조건으로 동적 계산
- **반응형 UI**: 모바일(320px 이상) 지원

## 프로젝트 구조

```
todolist/
├── frontend/          # React 19 + TypeScript 프론트엔드
├── backend/           # Node.js + Express 백엔드
├── database/          # DB 마이그레이션 및 시드 스크립트
├── docs/              # 프로젝트 설계 문서
├── swagger/           # API 명세 (swagger.json)
└── test/              # E2E 테스트 리포트 및 스크린샷
```

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- PostgreSQL 17

### 백엔드 실행

```bash
cd backend
npm install
cp .env.example .env
# .env 파일에 DB 연결 정보 및 JWT_SECRET 설정
node src/db/seeds/seed.js   # 기본 카테고리 생성
npm run dev                  # localhost:3000
```

### 프론트엔드 실행

```bash
cd frontend
npm install
cp .env.example .env.local
# .env.local에 VITE_API_BASE_URL 설정
npm run dev                  # localhost:5173
```

### 환경변수 (백엔드 `.env`)

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=todolist_user
DB_PASSWORD=your_password
DB_NAME=todolist
JWT_SECRET=your_secret_key
JWT_EXPIRATION=7d
CORS_ORIGIN=http://localhost:5173
```

## API 엔드포인트

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | /api/auth/signup | 회원가입 | 불필요 |
| POST | /api/auth/login | 로그인 (JWT 발급) | 불필요 |
| GET | /api/users/me | 내 정보 조회 | 필요 |
| PATCH | /api/users/me | 내 정보 수정 | 필요 |
| GET | /api/categories | 카테고리 목록 | 필요 |
| POST | /api/categories | 카테고리 생성 | 필요 |
| PATCH | /api/categories/:id | 카테고리 수정 | 필요 |
| DELETE | /api/categories/:id | 카테고리 삭제 | 필요 |
| GET | /api/todos | 할일 목록 (필터: category, status, overdue) | 필요 |
| POST | /api/todos | 할일 생성 | 필요 |
| PATCH | /api/todos/:id | 할일 수정 | 필요 |
| DELETE | /api/todos/:id | 할일 삭제 | 필요 |

자세한 API 명세는 `swagger/swagger.json`을 참조하세요.

## 테스트 실행

```bash
# 백엔드 테스트 (Jest + supertest, 실제 DB 사용)
cd backend
npm test
```

## 설계 문서

| 문서 | 설명 |
|------|------|
| `docs/2-PRD.md` | 제품 요구사항 정의서 |
| `docs/4-project-structure.md` | 프로젝트 구조 설계 원칙 |
| `docs/5-arch-diagram.md` | 기술 아키텍처 다이어그램 |
| `docs/6-erd.md` | 데이터베이스 ERD |
| `docs/7-execution-plan.md` | 실행 계획 및 태스크 목록 |
| `docs/9-frontend-integration-guide.md` | 프론트엔드 통합 가이드 |
| `docs/10-style-guide.md` | UI 스타일 가이드 |
