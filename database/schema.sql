-- =============================================================
-- TodoList 데이터베이스 스키마 DDL
-- 참조 문서: docs/6-erd.md (ERD v1.0)
--            docs/2-PRD.md (제품 요구사항 정의서 v2.1)
-- 작성일: 2026-05-27
-- 작성자: Naejune Gwon
-- =============================================================


-- -------------------------------------------------------------
-- 0. 기존 테이블 제거 (재실행 시 초기화)
--    의존성 역순으로 삭제
-- -------------------------------------------------------------
DROP TABLE IF EXISTS todos       CASCADE;
DROP TABLE IF EXISTS categories  CASCADE;
DROP TABLE IF EXISTS users       CASCADE;


-- -------------------------------------------------------------
-- 1. users 테이블
--    사용자 계정 정보 및 개인 설정(테마, 언어)을 저장한다.
-- -------------------------------------------------------------
CREATE TABLE users (
    id          SERIAL          PRIMARY KEY,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,                      -- bcryptjs 단방향 해시 저장
    name        VARCHAR(100)    NOT NULL,
    theme       VARCHAR(10)     NOT NULL DEFAULT 'light'
                    CHECK (theme IN ('light', 'dark')),        -- BR-203: 허용값 light/dark
    language    VARCHAR(5)      NOT NULL DEFAULT 'ko'
                    CHECK (language IN ('ko', 'en', 'ja')),    -- BR-204: 허용값 ko/en/ja
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT now()
);

COMMENT ON TABLE  users            IS '사용자 계정 및 개인 설정';
COMMENT ON COLUMN users.email      IS '로그인용 이메일 (중복 불가)';
COMMENT ON COLUMN users.password   IS 'bcryptjs 단방향 해시된 비밀번호';
COMMENT ON COLUMN users.theme      IS 'UI 테마 설정 (light/dark), 로그인 시 자동 적용';
COMMENT ON COLUMN users.language   IS 'UI 언어 설정 (ko/en/ja), 로그인 시 자동 적용';


-- -------------------------------------------------------------
-- 2. categories 테이블
--    사용자별 할일 분류 카테고리를 저장한다.
--    user_id = NULL 인 레코드는 시스템 공통 '기본' 카테고리이다.
-- -------------------------------------------------------------
CREATE TABLE categories (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    user_id     INTEGER         REFERENCES users(id) ON DELETE CASCADE  -- 사용자 삭제 시 해당 카테고리 함께 삭제
                                NULL                                     -- NULL = 시스템 공통 '기본' 카테고리
);

-- 동일 사용자 내 카테고리 이름 중복 방지 (UC-302)
-- user_id가 NULL인 경우(기본 카테고리)는 제외하기 위해 partial unique index 사용
CREATE UNIQUE INDEX uq_categories_user_name
    ON categories (user_id, name)
    WHERE user_id IS NOT NULL;

COMMENT ON TABLE  categories          IS '할일 분류 카테고리 (user_id = NULL이면 시스템 공통 기본 카테고리)';
COMMENT ON COLUMN categories.user_id  IS '카테고리 소유자 ID. NULL이면 전체 공통 기본 카테고리';


-- -------------------------------------------------------------
-- 3. todos 테이블
--    사용자의 할일 항목을 저장한다.
--    기한초과 여부(is_overdue)는 저장하지 않고 조회 시 동적 계산한다.
--    (end_date < CURRENT_DATE AND status != '완료')
-- -------------------------------------------------------------
CREATE TABLE todos (
    id           SERIAL          PRIMARY KEY,
    title        VARCHAR(255)    NOT NULL,                     -- 할일 제목 (필수)
    description  TEXT            NULL,                         -- 상세 설명 (선택)
    start_date   DATE            NULL,                         -- 시작 일자 (선택)
    end_date     DATE            NULL,                         -- 종료 일자 (선택)
    status       VARCHAR(10)     NOT NULL
                     CHECK (status IN ('미시작', '진행중', '완료')),  -- BR-401: 허용 상태값
    category_id  INTEGER         NOT NULL
                     REFERENCES categories(id) ON DELETE RESTRICT,  -- 카테고리 삭제 전 할일 이동 필요 (UC-306: 앱 레이어 처리)
    user_id      INTEGER         NOT NULL
                     REFERENCES users(id) ON DELETE CASCADE,        -- 사용자 삭제 시 할일 함께 삭제
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ     NOT NULL DEFAULT now(),

    -- 종료일자는 시작일자보다 이전일 수 없다 (UC-403, BR-402)
    CONSTRAINT chk_date_order CHECK (
        end_date IS NULL OR start_date IS NULL OR end_date >= start_date
    )
);

COMMENT ON TABLE  todos             IS '할일 항목. is_overdue는 컬럼 없이 조회 시 동적 계산';
COMMENT ON COLUMN todos.status      IS '진행 상태: 미시작 / 진행중 / 완료';
COMMENT ON COLUMN todos.category_id IS '소속 카테고리. 미지정 시 기본 카테고리 ID 배정 (앱 레이어)';
COMMENT ON COLUMN todos.updated_at  IS '수정 시 애플리케이션에서 now()로 갱신';


-- -------------------------------------------------------------
-- 4. 인덱스 (조회 성능 최적화)
-- -------------------------------------------------------------

-- 할일 목록 조회: 사용자 기준 필터링 (UC-404, NFR-102)
CREATE INDEX idx_todos_user_id      ON todos (user_id);

-- 할일 목록 조회: 카테고리 필터 (UC-405)
CREATE INDEX idx_todos_category_id  ON todos (category_id);

-- 할일 목록 조회: 상태 필터 (UC-405)
CREATE INDEX idx_todos_status       ON todos (user_id, status);

-- 기한초과 계산: end_date 조건 (UC-406)
CREATE INDEX idx_todos_end_date     ON todos (user_id, end_date)
    WHERE end_date IS NOT NULL;

-- 카테고리 목록 조회: 사용자 기준 필터링
CREATE INDEX idx_categories_user_id ON categories (user_id);


-- -------------------------------------------------------------
-- 5. 시드 데이터: 시스템 공통 '기본' 카테고리 (UC-402, BR-301)
--    user_id = NULL, 수정/삭제 불가 (UC-304, BR-302)
-- -------------------------------------------------------------
INSERT INTO categories (name, user_id)
VALUES ('기본', NULL);
