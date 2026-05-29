# E2E 테스트 리포트

**테스트 일시:** 2026-05-29  
**테스트 도구:** Playwright MCP  
**테스트 환경:** 백엔드 `http://localhost:3000` / 프론트엔드 `http://localhost:5173`  
**테스트 결과 요약:** 23개 통과 / 2개 버그 발견 → **모두 수정 완료**

---

## 결과 요약

| 구분 | 항목 수 | 결과 |
|------|---------|------|
| 통과 (PASS) | 23 | ✅ |
| 버그 발견 후 수정 | 2 | ✅ 수정 완료 |
| 실패 (FAIL) | 0 | - |

---

## 버그 수정 내역

### BUG-01 — 로그인 실패 시 오류 메시지 미표시 ✅ 수정됨
- **재현 경로:** 로그인 페이지에서 존재하지 않는 계정 정보 입력 후 로그인 버튼 클릭
- **기대 동작:** 화면에 "이메일 또는 비밀번호가 올바르지 않습니다" 오류 메시지 표시
- **원인:** `frontend/src/lib/api.ts` — 401 응답 시 토큰 유무와 무관하게 `window.location.href = '/login'`으로 즉시 리다이렉트하여 React mutation 에러 상태 전파 전에 페이지 이탈
- **수정:** `if (res.status === 401 && token)` — 기존 토큰이 있을 때만 리다이렉트 (세션 만료 처리), 로그인 시도 자체의 401은 에러로 throw
- **수정 스크린샷:** `screenshots/bugfix-01-login-error-message.png`

### BUG-02 — DATE 필드 타임존 오프셋으로 인한 날짜 하루 밀림 ✅ 수정됨
- **재현 경로:** 할일 등록 시 `2026-06-15` 입력 → 수정 폼에서 `2026-06-14`로 표시
- **원인:** `node-postgres(pg)` 8.x가 PostgreSQL `DATE` 컬럼을 로컬 타임존(KST) 기준 `Date` 객체로 생성 → `JSON.stringify` 시 UTC 자정 이전 값(`2026-06-14T15:00:00.000Z`)으로 직렬화
- **수정:** `backend/src/db/db.js` — `types.setTypeParser(1082, (val) => val)`로 DATE 컬럼을 `"YYYY-MM-DD"` 문자열 그대로 반환. 추가로 `frontend/src/utils/dateUtils.ts`의 `isoToDateInputValue`를 로컬 시간 메서드 사용으로 보강
- **수정 전 스크린샷:** `screenshots/14-todo-edit-form.png`
- **수정 후 스크린샷:** `screenshots/bugfix-02-date-correct.png`

---

## 테스트 케이스 상세

### TC-01 — 로그인 페이지 초기 진입
- **상태:** PASS ✅
- **설명:** `/login`으로 리다이렉트, 이메일/비밀번호 입력 폼 및 회원가입 링크 정상 표시
- **스크린샷:** `screenshots/01-login-page.png`

![로그인 페이지](screenshots/01-login-page.png)

---

### TC-02 — 로그인 폼 빈 제출 (엣지 케이스)
- **상태:** PASS ✅
- **설명:** 빈 폼 제출 시 이메일 필드로 포커스 이동 (HTML5 네이티브 required 검증 동작)
- **스크린샷:** `screenshots/02-login-empty-validation.png`

![빈 폼 제출](screenshots/02-login-empty-validation.png)

---

### TC-03 — 로그인 실패 — 잘못된 자격증명 (엣지 케이스)
- **상태:** ~~BUG~~ → **FIXED ✅**
- **설명:** 존재하지 않는 계정 정보로 로그인 시도. 수정 후 "이메일 또는 비밀번호가 올바르지 않습니다" 오류 메시지 정상 표시
- **수정 전 스크린샷:** `screenshots/03-login-invalid-credentials.png`
- **수정 후 스크린샷:** `screenshots/bugfix-01-login-error-message.png`

![수정 후 로그인 오류 메시지](screenshots/bugfix-01-login-error-message.png)

---

### TC-04 — 회원가입 페이지 진입
- **상태:** PASS ✅
- **설명:** `/signup` 라우트 정상 동작. 이름/이메일/비밀번호 입력 폼 표시
- **스크린샷:** `screenshots/04-signup-page.png`

![회원가입 페이지](screenshots/04-signup-page.png)

---

### TC-05 — 회원가입 — 중복 이메일 제출 (엣지 케이스)
- **상태:** PASS ✅
- **설명:** 이미 등록된 이메일 재가입 시도 → "이미 사용 중인 이메일입니다" 오류 메시지 표시
- **스크린샷:** `screenshots/05-signup-duplicate-email.png`

![중복 이메일 오류](screenshots/05-signup-duplicate-email.png)

---

### TC-06 — 정상 로그인 및 메인 페이지 진입
- **상태:** PASS ✅
- **설명:** 가입된 계정으로 로그인 → `/` 리다이렉트. 헤더 내비게이션, 할일 목록, 필터 UI 정상 표시
- **스크린샷:** `screenshots/06-main-page-after-login.png`

![메인 페이지](screenshots/06-main-page-after-login.png)

---

### TC-07 — 할일 등록 폼 진입
- **상태:** PASS ✅
- **설명:** `+ 할일 추가` 버튼 클릭 → `/todos/new` 이동. 제목/설명/카테고리/시작일/종료일 입력 폼 표시
- **스크린샷:** `screenshots/07-todo-create-form.png`

![할일 등록 폼](screenshots/07-todo-create-form.png)

---

### TC-08 — 할일 등록 — 제목 미입력 제출 (엣지 케이스)
- **상태:** PASS ✅
- **설명:** 제목 없이 저장 버튼 클릭 → "필수 항목입니다" 인라인 검증 메시지 표시, 페이지 유지
- **스크린샷:** `screenshots/08-todo-empty-title-validation.png`

![제목 미입력 검증](screenshots/08-todo-empty-title-validation.png)

---

### TC-09 — 할일 등록 — 종료일 < 시작일 (엣지 케이스)
- **상태:** PASS ✅
- **설명:** 종료일을 시작일보다 이전으로 입력 시 "종료일자는 시작일자보다 이전일 수 없습니다" 검증 메시지 표시
- **스크린샷:** `screenshots/09-todo-invalid-dates.png`

![날짜 유효성 검증](screenshots/09-todo-invalid-dates.png)

---

### TC-10 — 정상 할일 등록
- **상태:** PASS ✅
- **설명:** 유효한 데이터로 할일 등록 → 목록 페이지로 이동, 등록된 항목 표시 확인
- **스크린샷:** `screenshots/10-todo-created.png`

![할일 등록 완료](screenshots/10-todo-created.png)

---

### TC-11 — 할일 목록 2건 표시
- **상태:** PASS ✅
- **설명:** 기한초과 할일(2026-05-01~10) 및 일반 할일(2026-05-29~31) 2건 목록 정상 표시
- **스크린샷:** `screenshots/11-todo-list-two-items.png`

![할일 목록 2건](screenshots/11-todo-list-two-items.png)

---

### TC-12 — 기한초과 필터 (엣지 케이스)
- **상태:** PASS ✅
- **설명:** "기한초과만 보기" 체크박스 활성화 → 기한초과 항목만 표시, "기한초과" 배지 렌더링 확인
- **스크린샷:** `screenshots/12-todo-overdue-filter.png`

![기한초과 필터](screenshots/12-todo-overdue-filter.png)

---

### TC-13 — 상태 필터
- **상태:** PASS ✅
- **설명:** 상태 필터를 "미시작"으로 설정 → 해당 상태 항목만 표시
- **스크린샷:** `screenshots/13-todo-status-filter.png`

![상태 필터](screenshots/13-todo-status-filter.png)

---

### TC-14 — 할일 수정 폼 진입
- **상태:** ~~BUG-02~~ → **FIXED ✅**
- **설명:** 수정 버튼 클릭 → `/todos/:id/edit` 이동, 기존 데이터 pre-fill 확인. 수정 후 날짜 정확히 표시
- **수정 전 스크린샷:** `screenshots/14-todo-edit-form.png`
- **수정 후 스크린샷:** `screenshots/bugfix-02-date-correct.png`

![수정 후 날짜 정상 표시](screenshots/bugfix-02-date-correct.png)

---

### TC-15 — 할일 상태 변경 (미시작 → 완료)
- **상태:** PASS ✅
- **설명:** 상태를 "완료"로 변경 후 저장 → 목록에서 해당 항목 상태 업데이트, 필터 적용 시 정상 제외
- **스크린샷:** `screenshots/15-todo-status-completed.png`

![상태 변경](screenshots/15-todo-status-completed.png)

---

### TC-16 — 카테고리 관리 페이지
- **상태:** PASS ✅
- **설명:** `/categories` 페이지 정상 표시. 시스템 "기본" 카테고리의 수정/삭제 버튼 비활성화 확인
- **스크린샷:** `screenshots/16-categories-page.png`

![카테고리 관리](screenshots/16-categories-page.png)

---

### TC-17 — 카테고리 추가
- **상태:** PASS ✅
- **설명:** 모달에서 "업무" 카테고리 등록 → 목록에 추가 확인. 이름 미입력 시 저장 버튼 비활성화 동작 확인
- **스크린샷:** `screenshots/17-category-added.png`

![카테고리 추가](screenshots/17-category-added.png)

---

### TC-18 — 카테고리 중복 이름 (엣지 케이스)
- **상태:** PASS ✅
- **설명:** 동일 이름 "업무"로 재등록 시도 → "이미 사용 중인 카테고리 이름입니다" 오류 메시지 표시
- **스크린샷:** `screenshots/18-category-duplicate-error.png`

![카테고리 중복 오류](screenshots/18-category-duplicate-error.png)

---

### TC-19 — 프로필 페이지
- **상태:** PASS ✅
- **설명:** 이메일 필드 읽기전용, 이름/비밀번호 변경 가능, 테마(light/dark), 언어(ko/en/ja) 라디오 버튼 표시
- **스크린샷:** `screenshots/19-profile-page.png`

![프로필 페이지](screenshots/19-profile-page.png)

---

### TC-20 — 다크모드 전환
- **상태:** PASS ✅
- **설명:** Dark Mode 선택 후 저장 → 다크 테마 적용 확인
- **스크린샷:** `screenshots/20-dark-mode.png`

![다크모드](screenshots/20-dark-mode.png)

---

### TC-21 — 언어 변경 (영어)
- **상태:** PASS ✅
- **설명:** English 선택 즉시 전체 UI가 영어로 전환 (저장 전 실시간 반영). 메뉴, 버튼, 레이블 모두 영어로 표시
- **스크린샷:** `screenshots/21-language-english.png`

![영어 전환](screenshots/21-language-english.png)

---

### TC-22 — 언어 변경 (일본어)
- **상태:** PASS ✅
- **설명:** 日本語 선택 즉시 전체 UI가 일본어로 전환. カテゴリ, プロフィール, ログアウト, プロフィール編集 등 정상 번역
- **스크린샷:** `screenshots/22-language-japanese.png`

![일본어 전환](screenshots/22-language-japanese.png)

---

### TC-23 — 할일 삭제
- **상태:** PASS ✅
- **설명:** 삭제 버튼 클릭 → "이 할일을 삭제하시겠습니까?" confirm 다이얼로그 표시 → 확인 클릭 → 목록에서 제거
- **스크린샷:** `screenshots/23-todo-deleted.png`

![할일 삭제](screenshots/23-todo-deleted.png)

---

### TC-24 — 카테고리 삭제
- **상태:** PASS ✅
- **설명:** 삭제 버튼 클릭 → "이 카테고리를 삭제하시겠습니까? 소속 할일은 기본 카테고리로 이동됩니다" confirm → 확인 후 제거
- **스크린샷:** `screenshots/24-category-deleted.png`

![카테고리 삭제](screenshots/24-category-deleted.png)

---

### TC-25 — 인증 가드 — 미로그인 보호 경로 접근 (엣지 케이스)
- **상태:** PASS ✅
- **설명:** 로그아웃 상태에서 `/`, `/categories`, `/todos/new` 직접 접근 시 모두 `/login`으로 리다이렉트
- **스크린샷:** `screenshots/25-auth-guard-redirect.png`

![인증 가드](screenshots/25-auth-guard-redirect.png)

---

## 스크린샷 목록

| 파일명 | 설명 |
|--------|------|
| 01-login-page.png | 로그인 페이지 초기 화면 |
| 02-login-empty-validation.png | 빈 폼 제출 시 포커스 동작 |
| 03-login-invalid-credentials.png | 잘못된 자격증명 로그인 시도 (BUG-01) |
| 04-signup-page.png | 회원가입 페이지 |
| 05-signup-duplicate-email.png | 중복 이메일 오류 메시지 |
| 06-main-page-after-login.png | 로그인 후 메인 할일 목록 페이지 |
| 07-todo-create-form.png | 할일 등록 폼 |
| 08-todo-empty-title-validation.png | 제목 미입력 검증 메시지 |
| 09-todo-invalid-dates.png | 종료일 < 시작일 날짜 검증 메시지 |
| 10-todo-created.png | 할일 등록 완료 후 목록 |
| 11-todo-list-two-items.png | 할일 2건 목록 |
| 12-todo-overdue-filter.png | 기한초과 필터 활성화 |
| 13-todo-status-filter.png | 상태(미시작) 필터 |
| 14-todo-edit-form.png | 할일 수정 폼 (BUG-02 날짜 -1일) |
| 15-todo-status-completed.png | 상태 완료 변경 후 목록 |
| 16-categories-page.png | 카테고리 관리 페이지 |
| 17-category-added.png | 카테고리 추가 완료 |
| 18-category-duplicate-error.png | 중복 카테고리 이름 오류 |
| 19-profile-page.png | 프로필 / 내 정보 수정 페이지 |
| 20-dark-mode.png | 다크모드 전환 |
| 21-language-english.png | 영어 언어 전환 |
| 22-language-japanese.png | 일본어 언어 전환 |
| 23-todo-deleted.png | 할일 삭제 후 목록 |
| 24-category-deleted.png | 카테고리 삭제 후 목록 |
| 25-auth-guard-redirect.png | 미인증 접근 시 로그인 리다이렉트 |
