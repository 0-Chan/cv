# 제품 설계

## 확정 사항

데이터 모델·설정·로더는 구현되어 있다. 화면 컴포넌트와 테마의 CSS 연결은 구현 예정이다.

- npm과 lockfile로 의존성을 관리한다. 도입 시 호환 버전을 확인하고 고정한다.
- Astro + TypeScript strict, Tailwind CSS, Biome, Vitest를 사용한다.
- 프로필은 상단 고정이다. 소개·경력·기술·학력·자격의 제목·순서·표시 여부는 설정으로 관리한다.
- PDF의 이름·직무 배치, 연한 소개 박스, 좁은 섹션명 열, 구분선을 참고한다. 실제 콘텐츠와 이미지는 사용하지 않는다.

## 책임과 데이터 흐름

`로컬 콘텐츠 → 공급 어댑터 → 검증·정규화 → getResumeData(): Promise<ResumeData> → 페이지 → 표시 컴포넌트`

- 최상위 모델은 profile, summary, experiences, skills, education, certifications다. Zod 스키마와 추론된 TypeScript 타입으로 계약을 공유한다.
- 필수값·날짜·링크·ID 검증과 선택값 정규화는 로더 경계에서 수행한다. 오류는 필드 경로를 포함하되 전체 이력서를 로그에 출력하지 않는다.
- 반복 항목에 명시적 ID를 부여한다. 강조는 `{ text, strong? }` 조각 배열로 표현하며 원시 HTML을 콘텐츠 형식으로 사용하지 않는다.
- 회사 수준 업무 요약과 프로젝트, 프로젝트의 제품 소개와 담당 역할을 별도 필드로 둔다.
- 날짜는 선택 가능하고 입력 정밀도를 유지한다. 현재 재직은 명시적으로 판단하며 개월 수를 생성하지 않는다.
- 날짜는 YYYY 또는 YYYY-MM만 허용한다. 선택값도 빈 문자열·공백·null은 거부한다. 시작·종료 정밀도가 다르면 가능한 기간이 겹치는 경우 허용한다. 현재 재직과 종료일 동시 지정은 거부한다.

페이지는 데이터 로딩과 섹션 조합을 담당한다. 프로필·소개·공통 섹션·재직 이력·프로젝트·성과 목록·기술 그룹·학력·자격 컴포넌트는 전달받은 모델만 표시한다.

## 콘텐츠·표시·테마

| 편집 위치 | 책임 |
|---|---|
| src/config/resume.ts | 최소 샘플 콘텐츠 |
| src/config/resume-display.ts | 다섯 섹션의 id·title·visible 배열, 공통 표시 문구 |
| src/config/resume-theme.ts | 폰트·크기·굵기·줄 높이·간격·색상·최대 너비 |

설정을 각각 검증하고 공통 진입점에서 조합한다. 표시 배열 순서를 DOM에 적용한다. 콘텐츠 API 모델에는 테마나 Tailwind 클래스를 섞지 않는다.

Tailwind는 @tailwindcss/vite로 통합한다. 레이아웃에서 테마값을 CSS 변수로 전달하고 @theme inline에 연결한다. 컴포넌트는 고정된 의미 중심 유틸리티 이름을 사용한다. 동적 문자열 조합으로 클래스를 생성하지 않는다.

초기값은 시스템 한국어 폰트, 본문 16px·줄 높이 약 1.75, 최대 너비 960px, 데스크톱 섹션명 열 128px이다. Tailwind md 아래에서 한 열로 전환하고 모바일·데스크톱 여백은 테마에서 관리한다. 외부 폰트 요청은 초기 범위에 없다.

## 화면 계약

- 이름 h1 → 섹션 h2 → 회사 h3 → 프로젝트 h4 위계를 유지한다.
- 프로젝트 순서는 제목 → 제품 소개 → 선택적 역할 → 수행 내용·성과 → 선택적 기술·링크다.
- 경력은 프로젝트만, 요약만, 둘 다 있는 형태를 지원한다. 각 내용은 자신에게 속한 위치에서 한 번만 출력한다.
- 선택값이 없으면 요소와 여백을 함께 생략한다. 빈 섹션은 제목·구분선도 생략한다.
- 로고·배지 없는 항목에 고정된 빈 이미지 열을 남기지 않는다. 이미지에는 대체 텍스트를 제공한다.
- 긴 제목·URL·태그는 줄바꿈하고 가로 스크롤·말줄임을 만들지 않는다.
- 기본 화면은 JavaScript 없이 읽을 수 있어야 한다. 상호작용이 필요할 때만 클라이언트 코드를 추가한다.

## API 전환과 갱신

초기에는 외부 API를 호출하지 않는다. 권장 응답은 공통 모델의 여섯 영역을 갖는 JSON이다. 다른 응답은 어댑터에서 변환하고 공통 로더 경계에서 검증·정규화한다. 컴포넌트는 교체하지 않는다.

데이터·표시·테마는 빌드 시 읽으므로 변경 후 재빌드·재배포가 필요하다. 요청 시 실시간 갱신은 별도 설계 대상이다. 구현 후 실제 데이터 예시와 편집법을 문서에 추가한다.

## 공식 참고 자료

- [Tailwind + Astro](https://tailwindcss.com/docs/installation/framework-guides/astro)
- [Tailwind theme](https://tailwindcss.com/docs/theme)

## 구현된 데이터 계약

`src/models/resume.ts`의 스키마에서 `ResumeInput`(편집 입력), `ResumeData`(검증·정규화 결과)를 추론한다. 최상위 여섯 영역은 모두 필수이며, 선택적인 하위 목록만 생략 시 빈 배열로 정규화한다. 알 수 없는 필드와 잘못된 타입은 거부한다.

| 영역 | 주요 필드 |
|---|---|
| profile | name, role, contacts(id·label·value), links(id·label·href) |
| summary | format(paragraphs/list), items(id·content) |
| experiences | id, company(name·logo?), role, startDate?, endDate?, isCurrent, tags, highlights, projects |
| projects | id, title, description(제품 소개), role?, highlights, technologies, links |
| skills | id, category, items(id·label) |
| education | id, institution, program, startDate?, endDate?, description? |
| certifications | id, name, issuer, issuedAt?, expiresAt?, badge?, verificationLink? |

문장인 content·description·프로젝트 role은 `{ text, strong? }` 조각 배열이다. 조각의 공백은 보존하고 HTML로 해석하지 않는다. ID는 같은 목록 안에서 유일해야 한다. 향후 DOM ID에는 부모 경로를 포함해 다른 목록의 동일 ID와 구분한다. 이미지 구조는 `{ src, alt }`이며 루트 상대 경로 또는 HTTP(S) 주소를 사용한다. 링크는 HTTP(S), 프로필 링크는 추가로 mailto·tel을 허용한다. 주소의 형식을 검증하며 실제 접근 가능 여부는 검사하지 않는다.

`src/data/resume.ts`의 `getResumeData()`는 콘텐츠를, `getResumePageData()`는 `{ resume, display, theme }`를 반환한다. 페이지는 후자만 호출한다. 검증 오류는 `ResumeValidationError.issues`에 필드 경로와 메시지를 제공하며 원본 값을 오류 메시지에 넣지 않는다. 공급 함수 예외는 그대로 전파한다.

API는 위 여섯 영역의 JSON을 반환하는 형태를 권장한다. 다른 응답은 공급 함수에서 매핑한다. 빈 문자열·null을 누락값으로 쓰는 API라면 해당 변환은 공급 어댑터에 명시하며 공통 검증 규칙을 완화하지 않는다. 현재 로더는 외부 서버를 호출하지 않는다.
