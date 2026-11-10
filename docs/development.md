# 제품 설계

## 확정 사항

데이터 모델·설정·로더와 React TSX의 프로필·소개·경력·기술·학력·자격, 테마 CSS 연결이 구현되어 있다. 한 열 문서형 화면을 사용하며 검증 범위는 검증 기준 문서에서 확인한다.

- npm과 lockfile로 의존성을 관리한다. 도입 시 호환 버전을 확인하고 고정한다.
- Astro + TypeScript strict, Tailwind CSS, Biome, Vitest를 사용한다.
- 프로필은 상단 고정이다. 소개·경력·기술·학력·자격의 제목·순서·표시 여부는 설정으로 관리한다.
- 사용자가 제공한 실제 콘텐츠와 이미지를 사용한다. 모든 섹션을 한 열로 정렬하고 제목의 크기·색상, 묶음별 여백과 구분선으로 문서의 위계를 표현한다.

## 책임과 데이터 흐름

`YAML 원문 → 구문 검사 → 작성 형식 검증 → Markdown·공통 모델 변환 → 공통 모델 검증 → getResumeData(): Promise<ResumeData> → 페이지 → 표시 컴포넌트`

- 최상위 모델은 profile, summary, experiences, skills, education, certifications다. Zod 스키마와 추론된 TypeScript 타입으로 계약을 공유한다.
- 필수값·날짜·링크 검증과 선택값 정규화는 로더 경계에서 수행한다. 오류는 필드 경로를 포함하되 전체 이력서를 로그에 출력하지 않는다.
- 콘텐츠 항목에는 ID를 두지 않으며 자동 생성도 하지 않는다. 섹션 표시 설정의 고정 키만 사용한다. 재입사 구분은 지원 범위에 포함하지 않는다. 작성 문장은 Markdown을 사용한다. 내부에서는 문단과 text·strong·emphasis·code·link·break 노드로 표현하며 HTML 문자열을 저장하지 않는다.
- 회사 수준 업무 요약과 프로젝트를 분리한다. 프로젝트는 설명·주요 기여와 이슈 목록을 가지며, 이슈별 제목·문제 설명·해결 방향·성과를 별도 필드로 둔다.
- 날짜는 선택 가능하고 입력 정밀도를 유지한다. 근속 기간은 제공된 연월의 입·퇴사월을 포함해 계산한다. `isCurrent: true`일 때만 빌드 기준월을 종료월로 사용한다. 날짜가 없거나 연도만 있으면 근속 기간을 생략하며 누락된 월을 추정하지 않는다.
- 날짜는 YYYY 또는 YYYY-MM만 허용한다. 선택값도 빈 문자열·공백·null은 거부한다. 시작·종료 정밀도가 다르면 가능한 기간이 겹치는 경우 허용한다. 현재 재직과 종료일 동시 지정은 거부한다.

페이지는 데이터 로딩과 섹션 조합을 담당한다. 프로필·소개·공통 섹션·재직 이력·프로젝트·성과 목록·기술 그룹·학력·자격 컴포넌트는 전달받은 모델만 표시한다.

## 콘텐츠·표시·테마

| 편집 위치 | 책임 |
|---|---|
| src/config/resume.yaml | 실제 이력서 콘텐츠 |
| src/config/resume-display.ts | 다섯 섹션의 id·title·visible·showTitle 배열, 공통 표시 문구 |
| src/config/resume-theme.ts | 폰트·크기·굵기·줄 높이·간격·색상·최대 너비 |

설정을 각각 검증하고 공통 진입점에서 조합한다. 표시 배열 순서를 DOM에 적용한다. showTitle은 생략 시 true로 해석하며 false이면 본문과 접근성 이름을 유지하고 제목·구분선·장식을 생략한다. 현재 소개는 visible: true·showTitle: false다. 콘텐츠 API 모델에는 테마나 Tailwind 클래스를 섞지 않는다.

회사 로고와 자격 배지는 `public/images/resume/`에 저장하고 YAML에서 주소와 대체 텍스트를 지정한다. 원본 PDF는 로컬 자료로 유지하며 Git과 배포 산출물에 포함하지 않는다. 경력·성과·날짜는 원문에 근거하고 불명확한 항목은 확인 후 반영한다.

Tailwind는 @tailwindcss/vite로 통합한다. 레이아웃에서 테마값을 CSS 변수로 전달하고 @theme inline에 연결한다. 컴포넌트는 고정된 의미 중심 유틸리티 이름을 사용한다. 동적 문자열 조합으로 클래스를 생성하지 않는다.

배경은 `ResumeTheme.paper`의 `PaperParams`로 관리한다. `src/styles/paper-texture.ts`는 제공된 백상지 프리셋과 SVG 필터·data URI 변환을 유지하며, 별도 이미지 파일이나 브라우저 JavaScript 없이 배경을 표시한다. `colors.background`는 같은 `paper.color`에서 가져온다. `npm run paper:generate`가 검증된 설정을 `src/styles/paper.generated.css`의 정적 변수로 생성하고 전역 CSS가 가져온다. 테마 변경 후 생성 명령을 실행하는 편집 흐름을 사용한다. `body.paper-surface` 전체에 적용하고 태그의 기존 배경은 유지한다. 회사 로고·자격 배지의 `resume-brand-image`는 일반 화면에서 `mix-blend-mode: multiply`로 이미지의 흰 배경을 종이색·질감과 합성한다. 이미지 원본은 유지하며 인쇄·고대비 모드에는 이미지 합성을 적용하지 않는다. 인쇄·고대비 모드에서는 질감을 끄며 다크 모드는 추가하지 않는다.

개발 패널은 `src/dev`의 React TSX와 Shadow DOM 스타일로 구현한다. Astro integration의 `astro:config:setup`에서 `command === "dev"`일 때만 React 개발 런타임 초기화와 DEV 분기의 동적 import를 주입한다. 프로덕션 빌드와 preview에는 패널 진입 스크립트를 주입하지 않는다. 패널은 전달받은 초기 설정과 검증된 브라우저 저장값을 사용하며 컴포넌트에서 이력서 데이터에 접근하지 않는다. 조정값의 저장 키는 `dev:paper-texture`, 위치·열림 상태는 `dev:paper-texture:ui`다. 480px 이하에서는 접힌 상태로 시작하고 위치를 화면 안으로 제한한다.

기본값은 시스템 한국어 폰트, 본문 16px·줄 높이 1.75, 최대 너비 840px이다. 좌우 여백은 모바일 20px·md 이상 40px로 본문의 최대 너비는 760px이다. 화면 크기에 관계없이 제목과 본문을 한 열로 배치한다. 소개·경력 목록의 들여쓰기는 spacing.listIndent의 12px을 사용한다. 기술은 들여쓰기 없는 쉼표 구분 문단으로 표시한다. 외부 폰트 요청은 없다.

이름은 40px, 섹션 제목은 32px, 회사명은 26px, 프로젝트·기관 제목은 24px, 기술 분류 제목은 fontSizes.skillCategory의 20px, 자격 이름은 fontSizes.certification의 20px, 이슈 제목은 fontSizes.issue의 20px이며 제목 굵기는 700이다. 이슈 번호는 제목과 같은 스타일, 이슈 설명은 fontSizes.meta의 14px·colors.muted로 표시한다. 해결 방향·성과 제목은 fontSizes.body의 16px·700 굵기와 colors.text의 진한 본문색으로 표시한다. 섹션 제목은 colors.headingStart에서 headingEnd로 이어지는 정적 그라데이션, 회사명은 headingStart, 이슈 제목은 issueHeading의 옅은 갈색 #AD6F46, 링크는 link를 사용한다. 목록의 숫자·글머리표는 별도 강조색 없이 본문의 색상을 따른다. colors.accent의 #FF7500은 섹션 구분선의 짧은 장식에 사용한다. 인쇄·고대비 모드와 그라데이션 미지원 환경에는 단색 제목을 제공한다.

프로필과 첫 번째 표시 섹션 사이는 spacing.profile의 40px이며, 소개 다음 섹션 사이는 spacing.afterSummary의 40px이다. 소개가 숨겨지거나 비어 있으면 이 간격은 적용하지 않는다. 나머지 섹션 사이는 spacing.section의 80px이다. 웹·인쇄는 표시된 섹션의 순서를 따르며 PDF도 같은 테마를 사용한다. 섹션 제목과 내용은 sectionContent의 24px이다. 회사 사이는 company의 64px, 프로젝트 사이는 project의 48px 공간 중앙에 얇은 선을 둔다. 같은 프로젝트의 이슈 사이는 issue의 32px 여백만 사용하며 구분선을 추가하지 않는다. 기술 분류 사이는 item의 40px이다. 학력·자격 사이는 dividedItem의 72px을 구분선 위아래 36px씩 나눠 적용하며, 부모 간격과 자식 여백을 더한 값이 설정값과 일치한다. 위 간격은 구분선 두께를 제외한다.

프로젝트 정보와 첫 이슈는 content의 12px, 이슈 제목과 설명은 compact의 4px로 구분한다. 설명과 해결 방향·성과 블록 사이 및 문단 사이는 inline의 8px, 단계 제목과 목록·목록 항목은 compact의 4px이다. 이슈 번호와 제목은 `이슈1. 제목` 형식의 한 제목으로 표시한다. RichText·Highlights의 compact 옵션은 프로젝트에서만 사용하며 소개·회사 요약의 기본 내부 간격은 유지한다. 본문 강조는 600 굵기로 표시하며, 실제 콘텐츠의 소개·제품 설명·역할은 문장 전체 강조를 사용하지 않는다. 성과에서는 짧은 핵심 구절을 선택적으로 강조하고 기술 설명에서는 기술명만 강조한다.

## 화면 계약

- 이름 h1 → 섹션 h2 → 회사 h3 → 프로젝트 h4 → 이슈 h5 → 해결 방향·성과 h6 위계를 유지한다.
- 프로젝트 순서는 제목 → 프로젝트 설명 → 주요 기여 → 이슈 목록 → 선택적 링크다. 각 이슈는 `이슈1. 제목` 형태의 h5 → 문제 설명 → 해결 방향(번호 목록) → 성과(글머리표)로 표시한다. 긴 제목은 잘라내지 않고 자연스럽게 줄바꿈한다.
- 프로젝트 설명은 라벨 없이 프로젝트 제목 바로 아래에 4px 간격으로 표시한다. 주요 기여는 라벨과 내용의 dl로 표시한다. 640px 미만에서는 라벨 위·내용 아래로, 그 이상에서는 라벨 열과 내용 열로 배치하며 라벨·내용 사이는 4px다. 설명·주요 기여는 모두 14px 보조색으로 통일하며 문장 강조는 YAML에서 선택한 특정 문구의 Markdown strong으로만 표현한다. 주요 기여와 하나 이상의 이슈는 필수다. 모든 블록은 본문 시작점에 맞춰 추가 들여쓰기를 만들지 않는다.
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
| summary | lead?(RichText), format(paragraphs/list), items(content) |
| experiences | company(name·logo?), role, startDate?, endDate?, isCurrent, tags, highlights, projects |
| projects | title, description(프로젝트 설명), role(주요 기여), issues, links |
| project issues | title, description(문제 상황), approach(번호 목록), outcomes(성과 목록) |
| skills | category, items(content: RichText) |
| education | institution, program, startDate?, endDate?, description? |
| certifications | name, issuer, issuedAt?, badge?, verificationLink?, reason?(RichText) |

문장인 content·프로젝트/이슈 description·프로젝트 role은 문단 배열이다. 이슈의 approach·outcomes는 content를 갖는 항목 배열이며 각 목록은 하나 이상이어야 한다. 각 문단은 인라인 노드 목록을 가지며 strong·emphasis·link는 자식 노드를 갖는다. 일반 줄바꿈은 텍스트 안에 보존하고 Markdown의 명시적 줄바꿈은 break 노드로 표현한다. 렌더러는 텍스트를 이스케이프해야 하며 HTML을 직접 삽입하지 않는다. 이미지 구조는 `{ src, alt }`이며 루트 상대 경로 또는 HTTP(S) 주소를 사용한다. 링크는 HTTP(S), 프로필 링크는 추가로 mailto·tel을 허용한다. 주소의 형식을 검증하며 실제 접근 가능 여부는 검사하지 않는다.

`src/data/resume.ts`의 `getResumeData()`는 콘텐츠를, `getResumePageData()`는 `{ resume, display, theme }`를 반환한다. 페이지는 후자만 호출한다. 검증 오류는 `ResumeValidationError.issues`에 필드 경로와 메시지를 제공하며 원본 값을 오류 메시지에 넣지 않는다. 공급 함수 예외는 그대로 전파한다.

API는 위 여섯 영역의 JSON을 반환하는 형태를 권장한다. 다른 응답은 공급 함수에서 매핑한다. 빈 문자열·null을 누락값으로 쓰는 API라면 해당 변환은 공급 어댑터에 명시하며 공통 검증 규칙을 완화하지 않는다. 현재 로더는 외부 서버를 호출하지 않는다.

## YAML 작성 형식과 변환

작성용 계약은 `src/models/authoring.ts`의 `ResumeAuthoringInput`이다. 내부 모델과 달리 회사명은 문자열, 문장은 Markdown 문자열, 기술·태그는 문자열 배열이다. 기술 섹션의 문자열은 단순 기술명과 Markdown 설명을 모두 지원하고 내부 모델의 content로 변환한다. 태그는 일반 텍스트 label로 변환한다. 연락처·링크·기술 분류는 이름을 키로 하는 매핑이다. 소개는 문자열·문자열 목록 또는 `{ lead?, body?, items? }` 객체로 작성한다. 문자열의 각 문단은 개별 문단 항목으로 변환하고 목록 형식도 유지한다. 객체의 lead는 프로필의 이름·직무 바로 아래에 표시하는 RichText, body는 빈 줄로 구분한 본문 문자열이며 format: paragraphs의 항목으로 변환한다. items는 format: list의 항목 목록으로 변환하며 body와 동시에 작성하면 오류다. 첫 문장과 본문·목록은 각각 생략할 수 있다. 본문·목록이 없으면 빈 소개 섹션을 생략하되 lead는 프로필에 표시한다. 소개의 visible: false는 lead와 본문을 함께 숨긴다. 프로젝트 issues의 description은 Markdown 문자열, approach·outcomes는 Markdown 문자열 목록으로 작성한다. 프로젝트의 평면 highlights 형식은 지원하지 않는다. 회사 logo는 작성 시 회사 항목 바로 아래에 두고 변환 후 company 안으로 이동한다. 자격 verificationLink는 이름과 주소 한 쌍의 매핑이다.

profile의 이름·직무는 필수다. 생략된 최상위 섹션과 선택 목록만 빈 목록으로 변환한다. 입력된 빈 문자열·null·잘못된 타입은 오류이며 전체 파일 누락이나 빈 파일을 정상 빈 데이터로 대체하지 않는다. 날짜는 따옴표로 감싼 YYYY 또는 YYYY-MM 문자열이다. 실제 작성 예시는 README에 둔다.

`src/data/yaml-source.ts`의 `parseResumeYaml(source, filename)`가 YAML을 검증·변환하여 ResumeInput을 반환한다. YAML은 1.2 구문으로 해석하고 중복 키·파싱 경고와 오류를 전파한다. 구문 오류에는 파일명·행·열·오류 코드만 기록하며 원문 발췌는 포함하지 않는다. 작성 형식 오류와 Markdown 오류는 작성 필드 경로를 포함한다. getResumeData는 변환 후 공통 모델까지 검증한다.

Markdown은 CommonMark의 문단·굵게·기울임·인라인 코드·직접 링크·줄바꿈을 지원한다. 표 인식 확장은 표를 일반 문장으로 오인하지 않고 거부하기 위해 사용한다. 문서 제목·목록·표·이미지·코드 블록·HTML·참조형 링크는 오류다. 지원하지 않는 문법이 일반 텍스트로 해석되는 경우(예: 취소선 기호)는 텍스트로 유지한다. 문장 링크의 주소는 HTTP(S)·mailto·tel만 허용한다.

로컬 공급 모듈만 YAML을 `?raw`로 가져온다. 표시·테마는 TypeScript 설정을 유지한다. 기본 정적 페이지는 서버 빌드 중 로더를 호출하며 YAML을 공개 파일로 제공하지 않는다. HTML 렌더링은 구현되어 있으며 브라우저 화면 검증은 별도 단계다.


## 정적 UI와 배포 경계

Astro 페이지는 getResumePageData를 한 번 호출하고 문서 레이아웃에 테마를, React ResumePage에 콘텐츠·표시 설정을 전달한다. 이력서 본문과 Export 메뉴는 client 지시자 없이 HTML로 렌더링하고, 별도의 ResumeExportToaster만 client:media="(min-width: 1024px)"로 연결한다. RichText·InlineContent는 구조화된 문장을 React 요소로 표현하며 HTML 문자열을 삽입하지 않는다. 상태 없는 정적 목록은 배열 위치를 React key로 사용하고, 해당 lint 예외만 표현식에 명시한다. 콘텐츠 ID는 추가하지 않는다.

테마값은 레이아웃의 CSS 변수와 Tailwind @theme inline으로 연결한다. 가로·세로 페이지 여백은 각각 page-x·page-y 토큰을 사용한다. 공통 섹션은 소개 본문에도 재사용하며 본문을 한 열로 배치한다. 제목 표시를 끈 섹션은 aria-label로 이름을 제공하고 제목을 가리키는 aria-labelledby는 출력하지 않는다. 소개의 첫 문장은 프로필에서 이름·직무 다음, 연락처 앞에 fontSizes.summaryLead의 18px 일반체로 한 번만 표시하며 소개 본문에서 다시 출력하지 않는다. 웹·PDF·인쇄는 별도 배경색·테두리·둥근 모서리 없이 페이지 배경을 유지하고 colors.text로 표시하며 spacing.content의 12px 내부 여백을 사용한다. PDF는 px 값을 pt로 변환하며 소개 문장에 기울임 변환을 적용하지 않는다. 현재 lead는 YAML 여러 줄 문자열에서 쉼표 뒤에 Markdown 명시적 줄바꿈을 기록하며 기존 RichText break 노드로 웹·PDF·Markdown에 전달한다. 좁은 화면에서는 추가 자연 줄바꿈을 허용하며 소개 문장 블록 단위의 페이지 분리를 피한다. Markdown에도 같은 문장과 줄바꿈을 유지한다. 이름·직무와 첫 문장, 첫 문장과 연락처 사이는 spacing.content의 12px이다. 소개 본문은 16px·기존 줄 높이·문단 사이 12px이며 들여쓰기는 없다. 목록으로 작성한 경우 항목 사이는 spacing.inline의 8px이다. PDF의 마지막 소개 문단에는 추가 아래 여백을 두지 않아 다음 섹션까지의 간격과 중복하지 않는다. 연락처 행 사이는 spacing.compact의 4px이며 웹·PDF에 동일하게 적용한다. 내부 스크롤이나 고정 패널은 사용하지 않는다. 회사 로고는 widths.companyLogo의 32px로 회사명 바로 오른쪽에 spacing.inline의 8px 간격으로 배치한다. 직무·기간은 회사명 아래에서 본문 시작점에 맞춘다.

GitHub Pages는 main push·매월 1일 09:10(Asia/Seoul) 예약 실행·수동 실행의 검사 성공 후 dist artifact를 배포한다. 월별 예약은 워크플로를 main에 push한 뒤 적용되며 웹·PDF·Markdown을 함께 갱신한다. GitHub 예약은 지연될 수 있고 공개 저장소의 60일 비활동으로 비활성화될 수 있으므로 재활성화·수동 실행 방법은 README에 안내한다. 워크플로는 SITE_URL=https://resume.0-chan.kim과 BASE_PATH=/를 명시하고 Astro 설정이 이 환경변수를 읽는다. 로컬 기본 base도 /이며 로컬 이미지에는 표시 경계에서 BASE_URL을 붙인다. Pages의 커스텀 도메인과 빌드 환경값을 일치시켜 canonical·CSS·JavaScript·이미지·다운로드 경로를 함께 생성한다.

`src/presentation/experience-duration.ts`가 근속 기간을 공통으로 표시한다. 서울 시간대의 기준 연월은 정적 빌드에서 모듈이 처음 로드될 때 한 번 결정하며 웹·PDF·Markdown이 공유한다. 총 개월 수는 `(종료연도 - 시작연도) × 12 + 종료월 - 시작월 + 1`이다. 0인 단위는 생략하고 표시 접미사는 display.labels.durationYear·durationMonth를 사용한다. 현재 재직의 시작월이 기준월보다 미래이면 근속 기간만 생략한다. YAML·공통 콘텐츠 모델에는 계산 결과를 저장하지 않으며 학력에는 근속 기간을 추가하지 않는다.


## 기술·학력·자격 표시

ResumePage는 공통 표시 함수가 선택한 섹션을 순서대로 처리한다. 기술은 빈 분류를 제외한 뒤 남은 분류가 없으면 섹션을 생략한다. SkillGroup·EducationItem·CertificationItem의 props는 ResumeData의 해당 항목 타입을 사용한다. 기술은 분류 제목 아래의 항목을 getSkillGroupContent로 `, `로 연결한 한 문단으로 표시하며 글머리표·들여쓰기를 사용하지 않는다. 웹·PDF·Markdown이 같은 문단을 사용하며 Markdown 서식·링크를 보존한다. 항목 내부의 여러 문단은 공백으로 연결하고 폭이 부족하면 자연스럽게 줄바꿈한다. YAML 작성 형식과 분류별 간격은 유지한다.

각 분류·기관·자격 이름은 h3로 표시하고 공통 ResumeSection을 재사용한다. 학력 설명은 RichText로 렌더링한다. 학력 기간은 양쪽 값이 있을 때만 구분자를 표시하며 날짜 정밀도를 바꾸지 않는다. 자격 취득 문구는 표시 설정에서 받고 날짜가 없으면 날짜 영역을 생략한다. 자격 취득 사유는 선택 필드 reason의 Markdown 문자열을 로더에서 RichText로 변환하고 각 항목의 확인 링크 다음에 표시한다. 표시 문구는 labels.certificationReason에서 관리하며 웹·PDF는 14px 회색 텍스트, Markdown은 라벨과 문단으로 출력한다. 사유를 생략하면 라벨·여백도 생략한다. 자격 만료 필드는 지원하지 않는다. 배지는 assetUrl로 배포 경로를 반영하며 이미지가 없으면 빈 열을 만들지 않는다. 배지는 테마의 certificationBadge 크기 128px 영역에서 비율을 유지하며 모든 화면에서 자격 텍스트 왼쪽 상단에 정렬한다. 현재 PNG 배지 두 개는 도안의 크기를 유지하면서 위쪽 흰 여백만 제거한 자산을 사용한다.

## 내보내기

인쇄 목록의 들여쓰기는 spacing.listIndent에 spacing.inline을 더해 페이지 왼쪽에서 번호·글머리표가 잘리지 않게 한다. 학력 섹션은 제목·기관·전공·기간이 페이지 사이에 분리되지 않게 보호한다. 생성 PDF의 해결 방향·성과 제목은 minPresenceAhead 72pt로 후속 목록 공간을 확보한다.

`src/presentation/resume.ts`의 getVisibleResumeSections는 검증된 ResumeData·ResumeDisplay에서 표시할 섹션·제목·내용을 반환한다. 화면·PDF·Markdown은 이 함수를 공유해 순서·숨김·빈 목록 처리를 일치시킨다. 프로필 연락처는 getProfileDetails로 관리하며 콘텐츠 모델은 바꾸지 않는다. HTTP(S) 프로필 링크를 먼저 각각 표시하고 contacts의 값은 작성 순서대로 ` | `로 연결한 일반 텍스트 한 행에 표시한다. contacts가 비어 있으면 행을 생략하고, 한 항목이면 구분자를 붙이지 않는다. 공간이 부족하면 줄바꿈하며 기존 tel·mailto 링크는 뒤에 별도 항목으로 유지한다.

정적 엔드포인트 resume.pdf.ts·resume.md.ts는 getResumePageData로 데이터를 읽고 빌드 시 파일을 생성한다. PDF는 @react-pdf/renderer의 JSX와 로컬 나눔고딕 TTF를 사용하며, 테마의 px 값을 pt로 변환한다. A4 페이지 배경은 #ffffff이고 여백은 좌우 40pt·상하 36pt다. 짧은 회사 정보 헤더는 한 페이지에 유지하되 긴 회사·프로젝트 전체를 나눔 금지 블록으로 만들지 않는다. 기술 분류 제목은 별도 컨테이너 없이 본문 문단과 같은 흐름에 배치해 minPresenceAhead가 적용되게 한다. 문단에는 orphans·widows를 사용한다. 나눔고딕에 없는 기울임체는 밑줄로 강조한다. Markdown은 구조화된 문장을 mdast로 변환하고 mdast-util-to-markdown으로 직렬화한다. 장식용 이미지는 제외한다. 생성 오류는 전파하며 생성된 파일을 Git에 저장하지 않는다. 원문 참고 PDF와 별도로 사용자가 다운로드하도록 생성한 PDF만 배포한다.

ResumeExport는 전달받은 프로필 이름으로 PDF 다운로드 파일명을 만들고 BASE_URL을 반영한 정적 파일 링크를 표시한다. 메뉴는 PDF 다운로드·프린터 출력 다음에 구분선과 MD 복사하기를 배치한다. Export 버튼의 IconFileExport와 각 항목의 IconFileTypePdf·IconPrinter·IconMarkdown은 @tabler/icons-react의 정적 SVG이며 18px·stroke 1.75·currentColor를 사용한다. 아이콘은 aria-hidden·focusable=false로 장식 처리한다. 1024px 이상에서 프로필 오른쪽 위에 일반 문서 흐름으로 배치하고 메뉴·알림을 모바일·인쇄에서는 숨긴다.

페이지는 빌드 시 renderResumeMarkdown으로 만든 원문을 ResumePage·ResumeExport의 markdown 문자열 prop으로 전달한다. 원문은 React가 HTML 이스케이프하는 숨겨진 읽기 전용 textarea에 저장하고, 클릭 이벤트 안에서 navigator.clipboard.writeText를 바로 호출한다. Markdown 생성 코드를 클라이언트에 포함하거나 클릭 후 네트워크로 원문을 읽지 않는다. 기존 resume.md 엔드포인트는 같은 생성 함수를 사용해 유지한다.

Sonner 2.0.8의 Toaster를 화면 오른쪽 위 16px 여백에 밝은 기본 스타일·기존 글꼴·상태 아이콘·한글 닫기 버튼으로 표시한다. 알림은 고정 ID 하나를 갱신하며 새 작업이 이전 알림을 교체한다. 복사 중에는 aria-disabled와 실행 가드로 중복 요청을 막고 키보드 포커스를 유지한다. 성공하면 메뉴를 닫고 메뉴 안에 포커스가 남아 있을 때만 Export 버튼으로 돌리며 완료 문구를 3초 동안 표시한다. API 미지원·권한 거부 등으로 실패하면 메뉴를 강제로 닫지 않고 권한 확인 안내를 유지한다. 재시도는 메뉴에서 하며 다음 복사·새 작업·메뉴 재열기·알림 닫기로 안내를 교체하거나 제거한다. 늦게 도착한 비동기 결과는 새 작업의 알림이나 메뉴를 변경하지 않는다.

Toaster가 마운트된 뒤 initializeResumeExport가 native details/summary의 Escape·바깥 클릭·포커스 이탈 시 닫기와 항목 실행 이벤트를 연결한다. 해제 시 AbortController로 리스너를 제거하고 예약된 인쇄 프레임·알림을 정리한다. PDF는 기존 정적 링크로 다운로드하고 시작 안내를 3초 표시한다. 프린터는 열기 안내를 그린 뒤 window.print를 호출하고 afterprint에서 안내를 지운다. PDF 저장·인쇄 완료 여부를 추정하지 않는다. 1024px 미만 전환 시 메뉴와 알림을 닫고, 인쇄 CSS에서는 Export·알림을 숨기며 html·body 배경을 #fff로 지정하고 제목을 단색으로 표시한다. 알림 영역에 필요한 React·Sonner만 클라이언트에 포함하며 PDF·Markdown 생성 도구는 포함하지 않는다. 다운로드 파일과 복사 원문은 데이터·표시·테마와 함께 재빌드·재배포할 때 갱신된다.

프로젝트 UI는 전달받은 모델과 표시 문구만 사용하며 IssueItem이 이슈별 설명과 두 종류의 목록을 렌더링한다. 기존 Highlights의 ordered 옵션으로 ol·ul을 선택한다. PDF·Markdown도 동일 모델의 이슈 배열을 순서대로 출력한다. PDF는 같은 테마의 간격을 pt로 변환하고 프로젝트 문단·목록에 compact 옵션을 적용한다. 목록의 마지막 항목에는 아래 여백을 남기지 않아 다음 묶음 간격과 중복하지 않는다. PDF 목록은 번호·글머리표와 첫 문단을 같은 Text에 배치하고 orphans·widows로 보호해 표시만 페이지 끝에 남지 않게 한다. 긴 문단은 페이지 사이에 나눌 수 있다. 이슈 제목은 짧은 나눔 금지 블록으로 묶고 minPresenceAhead로 후속 본문 공간을 확보한다. 긴 이슈 본문은 페이지 사이에 나눌 수 있으며 해결 방향·성과 제목도 후속 목록과 이어지도록 보호한다. 웹 인쇄 CSS의 제목 보호 범위는 h1~h6이다. Markdown도 `이슈1. 제목`을 다섯 단계 제목 하나로 표시하며 해결 방향·성과는 여섯 단계 제목, 각 목록은 ordered·unordered로 구분한다.
