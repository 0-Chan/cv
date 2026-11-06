# 제품 설계

## 확정 사항

데이터 모델·설정·로더는 구현되어 있다. React TSX의 프로필·소개·경력·기술·학력·자격과 테마 CSS 연결이 구현되어 있다. 전체 화면 검증은 다음 작업이다.

- npm과 lockfile로 의존성을 관리한다. 도입 시 호환 버전을 확인하고 고정한다.
- Astro + TypeScript strict, Tailwind CSS, Biome, Vitest를 사용한다.
- 프로필은 상단 고정이다. 소개·경력·기술·학력·자격의 제목·순서·표시 여부는 설정으로 관리한다.
- 사용자가 제공한 PDF의 실제 콘텐츠와 이미지를 이력서 데이터로 옮긴다. 이름·직무 배치, 연한 소개 박스, 좁은 섹션명 열, 구분선은 문서형 디자인의 참고로 사용한다.

## 책임과 데이터 흐름

`YAML 원문 → 구문 검사 → 작성 형식 검증 → Markdown·공통 모델 변환 → 공통 모델 검증 → getResumeData(): Promise<ResumeData> → 페이지 → 표시 컴포넌트`

- 최상위 모델은 profile, summary, experiences, skills, education, certifications다. Zod 스키마와 추론된 TypeScript 타입으로 계약을 공유한다.
- 필수값·날짜·링크 검증과 선택값 정규화는 로더 경계에서 수행한다. 오류는 필드 경로를 포함하되 전체 이력서를 로그에 출력하지 않는다.
- 콘텐츠 항목에는 ID를 두지 않으며 자동 생성도 하지 않는다. 섹션 표시 설정의 고정 키만 사용한다. 재입사 구분은 지원 범위에 포함하지 않는다. 작성 문장은 Markdown을 사용한다. 내부에서는 문단과 text·strong·emphasis·code·link·break 노드로 표현하며 HTML 문자열을 저장하지 않는다.
- 회사 수준 업무 요약과 프로젝트, 프로젝트의 제품 소개와 담당 역할을 별도 필드로 둔다.
- 날짜는 선택 가능하고 입력 정밀도를 유지한다. 현재 재직은 명시적으로 판단하며 개월 수를 생성하지 않는다.
- 날짜는 YYYY 또는 YYYY-MM만 허용한다. 선택값도 빈 문자열·공백·null은 거부한다. 시작·종료 정밀도가 다르면 가능한 기간이 겹치는 경우 허용한다. 현재 재직과 종료일 동시 지정은 거부한다.

페이지는 데이터 로딩과 섹션 조합을 담당한다. 프로필·소개·공통 섹션·재직 이력·프로젝트·성과 목록·기술 그룹·학력·자격 컴포넌트는 전달받은 모델만 표시한다.

## 콘텐츠·표시·테마

| 편집 위치 | 책임 |
|---|---|
| src/config/resume.yaml | 실제 이력서 콘텐츠 |
| src/config/resume-display.ts | 다섯 섹션의 id·title·visible 배열, 공통 표시 문구 |
| src/config/resume-theme.ts | 폰트·크기·굵기·줄 높이·간격·색상·최대 너비 |

설정을 각각 검증하고 공통 진입점에서 조합한다. 표시 배열 순서를 DOM에 적용한다. 콘텐츠 API 모델에는 테마나 Tailwind 클래스를 섞지 않는다.

회사 로고와 자격 배지는 `public/images/resume/`에 저장하고 YAML에서 주소와 대체 텍스트를 지정한다. 원본 PDF는 로컬 자료로 유지하며 Git과 배포 산출물에 포함하지 않는다. 경력·성과·날짜는 원문에 근거하고 불명확한 항목은 확인 후 반영한다.

Tailwind는 @tailwindcss/vite로 통합한다. 레이아웃에서 테마값을 CSS 변수로 전달하고 @theme inline에 연결한다. 컴포넌트는 고정된 의미 중심 유틸리티 이름을 사용한다. 동적 문자열 조합으로 클래스를 생성하지 않는다.

초기값은 시스템 한국어 폰트, 본문 16px·줄 높이 약 1.75, 최대 너비 960px, 데스크톱 섹션명 열 96px·본문과의 가로 간격 8px이다. 소개·경력·기술 목록의 들여쓰기는 테마의 spacing.listIndent로 관리하며 기본값은 12px이다. Tailwind md 아래에서 한 열로 전환하고 모바일·데스크톱 여백은 테마에서 관리한다. 외부 폰트 요청은 초기 범위에 없다.

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

`src/models/resume.ts`의 스키마에서 `ResumeInput`(공통 모델 입력), `ResumeData`(검증·정규화 결과)를 추론한다. 최상위 여섯 영역은 모두 필수이며, 선택적인 하위 목록만 생략 시 빈 배열로 정규화한다. 알 수 없는 필드와 잘못된 타입은 거부한다.

| 영역 | 주요 필드 |
|---|---|
| profile | name, role, contacts(label·value), links(label·href) |
| summary | format(paragraphs/list), items(content) |
| experiences | company(name·logo?), role, startDate?, endDate?, isCurrent, tags, highlights, projects |
| projects | title, description(제품 소개), role?, highlights, technologies, links |
| skills | category, items(content: RichText) |
| education | institution, program, startDate?, endDate?, description? |
| certifications | name, issuer, issuedAt?, expiresAt?, badge?, verificationLink? |

문장인 content·description·프로젝트 role은 문단 배열이다. 각 문단은 인라인 노드 목록을 가지며 strong·emphasis·link는 자식 노드를 갖는다. 일반 줄바꿈은 텍스트 안에 보존하고 Markdown의 명시적 줄바꿈은 break 노드로 표현한다. 렌더러는 텍스트를 이스케이프해야 하며 HTML을 직접 삽입하지 않는다. 이미지 구조는 `{ src, alt }`이며 루트 상대 경로 또는 HTTP(S) 주소를 사용한다. 링크는 HTTP(S), 프로필 링크는 추가로 mailto·tel을 허용한다. 주소의 형식을 검증하며 실제 접근 가능 여부는 검사하지 않는다.

`src/data/resume.ts`의 `getResumeData()`는 콘텐츠를, `getResumePageData()`는 `{ resume, display, theme }`를 반환한다. 페이지는 후자만 호출한다. 검증 오류는 `ResumeValidationError.issues`에 필드 경로와 메시지를 제공하며 원본 값을 오류 메시지에 넣지 않는다. 공급 함수 예외는 그대로 전파한다.

API는 위 여섯 영역의 JSON을 반환하는 형태를 권장한다. 다른 응답은 공급 함수에서 매핑한다. 빈 문자열·null을 누락값으로 쓰는 API라면 해당 변환은 공급 어댑터에 명시하며 공통 검증 규칙을 완화하지 않는다. 현재 로더는 외부 서버를 호출하지 않는다.

## YAML 작성 형식과 변환

작성용 계약은 `src/models/authoring.ts`의 `ResumeAuthoringInput`이다. 내부 모델과 달리 회사명은 문자열, 문장은 Markdown 문자열, 기술·태그는 문자열 배열이다. 기술 섹션의 문자열은 단순 기술명과 Markdown 설명을 모두 지원하고 내부 모델의 content로 변환한다. 태그와 프로젝트의 관련 기술은 일반 텍스트 label로 변환한다. 연락처·링크·기술 분류는 이름을 키로 하는 매핑이다. 소개는 문자열 또는 문자열 목록이며 문자열의 각 문단은 소개의 개별 문단 항목으로 변환한다. 회사 logo는 작성 시 회사 항목 바로 아래에 두고 변환 후 company 안으로 이동한다. 자격 verificationLink는 이름과 주소 한 쌍의 매핑이다.

profile의 이름·직무는 필수다. 생략된 최상위 섹션과 선택 목록만 빈 목록으로 변환한다. 입력된 빈 문자열·null·잘못된 타입은 오류이며 전체 파일 누락이나 빈 파일을 정상 빈 데이터로 대체하지 않는다. 날짜는 따옴표로 감싼 YYYY 또는 YYYY-MM 문자열이다. 실제 작성 예시는 README에 둔다.

`src/data/yaml-source.ts`의 `parseResumeYaml(source, filename)`가 YAML을 검증·변환하여 ResumeInput을 반환한다. YAML은 1.2 구문으로 해석하고 중복 키·파싱 경고와 오류를 전파한다. 구문 오류에는 파일명·행·열·오류 코드만 기록하며 원문 발췌는 포함하지 않는다. 작성 형식 오류와 Markdown 오류는 작성 필드 경로를 포함한다. getResumeData는 변환 후 공통 모델까지 검증한다.

Markdown은 CommonMark의 문단·굵게·기울임·인라인 코드·직접 링크·줄바꿈을 지원한다. 표 인식 확장은 표를 일반 문장으로 오인하지 않고 거부하기 위해 사용한다. 문서 제목·목록·표·이미지·코드 블록·HTML·참조형 링크는 오류다. 지원하지 않는 문법이 일반 텍스트로 해석되는 경우(예: 취소선 기호)는 텍스트로 유지한다. 문장 링크의 주소는 HTTP(S)·mailto·tel만 허용한다.

로컬 공급 모듈만 YAML을 `?raw`로 가져온다. 표시·테마는 TypeScript 설정을 유지한다. 기본 정적 페이지는 서버 빌드 중 로더를 호출하며 YAML을 공개 파일로 제공하지 않는다. HTML 렌더링은 구현되어 있으며 브라우저 화면 검증은 별도 단계다.


## 정적 UI와 배포 경계

Astro 페이지는 getResumePageData를 한 번 호출하고 문서 레이아웃에 테마를, React ResumePage에 콘텐츠·표시 설정을 전달한다. React 컴포넌트는 client 지시자 없이 HTML로 렌더링한다. RichText·InlineContent는 구조화된 문장을 React 요소로 표현하며 HTML 문자열을 삽입하지 않는다. 상태 없는 정적 목록은 배열 위치를 React key로 사용하고, 해당 lint 예외만 표현식에 명시한다. 콘텐츠 ID는 추가하지 않는다.

테마값은 레이아웃의 CSS 변수와 Tailwind @theme inline으로 연결한다. 가로·세로 페이지 여백은 각각 page-x·page-y 토큰을 사용한다. 공통 섹션은 md 이상에서 제목 열과 minmax(0, 1fr) 본문 열을 사용한다.

GitHub Pages는 main push의 검사 성공 후 dist artifact를 배포한다. SITE_URL과 BASE_PATH는 Pages 메타데이터에서 읽으며 로컬 기본 base는 /다. 로컬 이미지에는 표시 경계에서 BASE_URL을 붙인다. 개인 도메인은 기본 주소 배포 이후에 연결한다.


## 기술·학력·자격 표시

ResumePage는 다섯 섹션의 표시 설정을 순서대로 처리한다. 기술은 빈 분류를 제외한 뒤 남은 분류가 없으면 섹션을 생략한다. SkillGroup·EducationItem·CertificationItem의 props는 ResumeData의 해당 항목 타입을 사용한다. SkillGroup은 Highlights를 재사용해 기술명과 설명을 세로 글머리표 목록으로 표시하고 Markdown 강조를 렌더링한다. 단순 기술명도 동일한 목록 구조로 표시한다.

각 분류·기관·자격 이름은 h3로 표시하고 공통 ResumeSection의 반응형 배치를 재사용한다. 학력 설명은 RichText로 렌더링한다. 학력 기간은 양쪽 값이 있을 때만 구분자를 표시하며 날짜 정밀도를 바꾸지 않는다. 자격 취득·만료 문구는 표시 설정에서 받고 값이 없는 정보는 생략한다. 배지는 assetUrl로 배포 경로를 반영하며 이미지가 없으면 빈 열을 만들지 않는다.
