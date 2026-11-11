![이력서 페이지 미리보기](assets/images/airy-floating-resume.png)

# Astro 이력서 프로젝트

이력서 콘텐츠, 섹션 표시 설정, 디자인 테마를 UI와 분리하는 정적 이력서 웹페이지 프로젝트입니다.

Astro, React TSX, TypeScript, Tailwind CSS를 사용합니다. 프로필·소개·경력·기술·학력·자격을 빌드 시 HTML로 렌더링합니다. 경력에는 회사 업무 요약과 프로젝트 목록을 표시할 수 있습니다.

[이력서 예시 보기](https://resume.0-chan.kim/) · [GitHub 저장소](https://github.com/0-Chan/cv)

## 실행

Node.js 26.0.0과 npm 12.2.0을 기준으로 합니다. Node 버전은 `.node-version`에 명시되어 있습니다.

```sh
npm ci
npm run dev
```

개발 서버의 기본 주소는 http://localhost:4321 입니다.

```sh
npm run check
npm run build
npm run preview
```

`check`는 Astro·TypeScript를 검사하고, `build`는 `dist`에 정적 페이지를 생성합니다. `preview`는 빌드한 결과를 확인하는 서버입니다.

## 코드 검사

```sh
npm run verify
```

타입 검사, Biome lint, 포맷 검사, Vitest, 정적 빌드를 차례로 실행하고 실패한 단계에서 중단합니다.

| 명령 | 역할 |
|---|---|
| `npm run lint` | 소스와 프로젝트 설정의 Biome lint |
| `npm run format:check` | 포맷 검사 |
| `npm run format` | 검사 대상 파일의 포맷 수정 |
| `npm test` | Vitest 실행 |
| `npm run verify:commit` | 타입·lint·포맷·Vitest 검사 |
| `npm run verify:static` | 타입·lint·포맷 검사와 빌드, Vitest 제외 |

Biome는 Astro·TypeScript·CSS, scripts의 검사 도구와 루트 설정 파일을 검사합니다. Markdown 문서, 스킬, lockfile, 생성 산출물은 포맷 대상이 아닙니다. Astro 전체 지원은 실험적 기능을 사용합니다.

Vitest로 날짜 입력 형식, 선택 날짜 누락, 기간 순서와 현재 재직 여부를 검사합니다. YAML의 링크·기술 매핑과 섹션 생략, 빈 이름의 필드 오류, 중복 키의 위치 안내도 검사합니다. 회사 요약과 프로젝트의 분리, 주요 기여·이슈의 필수 입력과 이슈별 문제·해결 방향·성과 보존도 검증합니다. `npm test -- --reporter=verbose`로 각 테스트의 설명을 확인할 수 있습니다.

## Git hook

`npm ci` 또는 `npm install`의 `prepare` 단계에서 Husky를 등록합니다. 수동으로 다시 등록하려면 `npm run prepare`를 실행합니다.

| 시점 | 검사 |
|---|---|
| 커밋 전 | 타입·lint·포맷·Vitest |
| 커밋 제목 입력 후 | `유형: 한글 설명` 형식 |
| push 전 | 정적 빌드 |

검사가 실패하면 해당 Git 작업이 중단됩니다. 커밋 제목의 유형은 `기능·수정·정리·문서·설정·도구·테스트·되돌림`이며 설명에 한글이 하나 이상 있어야 합니다. `테스트: Vitest로 데이터 검증 추가`처럼 기술명을 함께 사용할 수 있습니다. 본문은 자유롭게 작성하며 자동 생성된 제목에도 같은 규칙을 적용합니다.

hook은 현재 작업 트리를 검사하며 파일을 자동 수정하거나 스테이징하지 않습니다. 부분 스테이징 시 검사 대상과 커밋 내용이 다를 수 있습니다. 로컬 hook은 우회할 수 있으므로 서버 측 강제 검증은 별도 CI가 필요합니다.

## 설계 문서

- [제품 설계](docs/development.md)
- [제품 검증 기준](docs/verification.md)

## 이력서 작성

`src/config/resume.yaml`을 편집합니다. 콘텐츠 ID나 TypeScript 코드를 작성할 필요가 없습니다. `profile.name`, `profile.role`은 필수이고, 내용이 없는 섹션은 생략할 수 있습니다.

```yaml
profile:
  name: 이름
  role: 직무
  contacts:
    지역: 지역 이름
  links:
    이메일: mailto:name@example.com

summary: |
  소개 문장에 **굵게**, *기울임*, `코드`를 쓸 수 있습니다.
  [관련 링크](https://example.com)도 문장 안에 넣습니다.

experiences:
  - company: 회사 A
    role: 직무
    isCurrent: false
    highlights:
      - 회사 수준 업무 요약입니다.
    projects:
      - title: 프로젝트 A
        description: 제품·서비스 소개입니다.
        role: 주요 기여입니다.
        issues:
          - title: 이슈 제목입니다.
            description: 문제 상황을 설명합니다.
            approach:
              - 첫 번째 해결 방향입니다.
              - 두 번째 해결 방향입니다.
            outcomes:
              - 수행 결과와 성과입니다.
        links:
          관련 링크: https://example.com

skills:
  기술 분류:
    - "**TypeScript:** 기술 활용 경험을 설명합니다."
    - Astro

education:
  - institution: 기관 A
    program: 전공 또는 과정

certifications:
  - name: 자격 A
    issuer: 발급 기관
    verificationLink:
      자격 확인: https://example.com
```

소개를 목록으로 표시하려면 `summary`를 다음처럼 작성합니다.

```yaml
summary:
  - 첫 번째 소개 문장입니다.
  - 두 번째 소개 문장입니다.
```

이름·직무 바로 아래의 소개 문장은 `summary.lead`, 연락처 아래의 소개 본문은 `summary.body`에 작성합니다. 본문은 빈 줄로 문단을 구분합니다.

```yaml
summary:
  lead: |-
    이름과 직무 아래에 표시할 첫 구절,\
    다음 줄에 이어질 소개 문장입니다.
  body: |
    첫 번째 소개 문단입니다.

    두 번째 소개 문단입니다.
```

첫 문장과 본문은 각각 생략할 수 있습니다. 소개 본문을 목록으로 표시하려면 `body` 대신 `items`에 문자열 목록을 작성합니다. `body`와 `items`는 동시에 사용할 수 없습니다. 본문·목록 없이 첫 문장만 작성하면 프로필에 그 문장만 표시하고 빈 소개 섹션은 생략합니다. 소개의 `visible: false`는 첫 문장과 본문을 함께 숨깁니다.

- 회사 요약(`highlights`)과 프로젝트(`projects`)는 각각 생략할 수 있습니다. 배열에 적은 순서가 유지됩니다.
- 날짜는 `startDate: "2024"`, `endDate: "2024-03"`처럼 따옴표를 붙인 연도·연월입니다. 일 단위는 지원하지 않습니다.
- 현재 재직은 `isCurrent: true`로 명시하고 종료일을 생략합니다. 종료일 누락만으로 현재 재직으로 판단하지 않습니다.
- 자격 취득 날짜는 선택 필드인 `issuedAt`으로 입력합니다. `verificationLink`는 표시 이름과 주소 한 쌍입니다. 취득 사유는 선택 필드 `reason`에 Markdown 문장으로 작성하며 각 자격증의 마지막에 표시합니다. 생략하면 사유 라벨과 여백도 숨깁니다.
- 회사 로고는 회사 항목의 `logo`, 자격 배지는 `badge`에 `{ src: /images/example.png, alt: 이미지 설명 }` 형태로 입력합니다.
- 선택값은 필드를 생략합니다. 빈 문자열·공백만 있는 문장·`null`은 오류입니다. 전화번호처럼 숫자로 보이는 문자열에도 따옴표를 붙입니다.
- 문단은 빈 줄로 구분합니다. `|`는 줄바꿈을 보존하고 `>`는 줄을 이어 쓰는 YAML 문법입니다. Markdown의 명시적 줄바꿈은 두 공백 또는 역슬래시 뒤 줄바꿈으로 작성합니다.
- 프로젝트는 설명·주요 기여와 하나 이상의 `issues`를 작성합니다. 각 이슈의 `title`·`description`·`approach`·`outcomes`는 필수이며 해결 방향·성과 목록은 비울 수 없습니다.
- 회사 수준 `highlights`는 유지하지만 프로젝트에는 사용하지 않습니다. 이슈 번호는 화면의 순서로 표시하므로 직접 입력하지 않습니다.
- Markdown은 소개·프로젝트 및 이슈 설명·주요 기여·해결 방향·성과·기술 섹션의 항목·자격 취득 사유에 적용합니다. 기술 항목은 `**기술명:** 설명`이나 단순 기술명으로 작성할 수 있습니다. 이름·제목·태그는 일반 텍스트입니다. HTML, 이미지, 제목, 표, 코드 블록, 참조형 링크는 지원하지 않으며 목록은 YAML 목록으로 작성합니다.
- `**굵은 강조**`, `*기울임*`, `==배경 강조==`를 사용할 수 있습니다. 배경 강조는 웹과 PDF에서 옅은 베이지색으로 표시하며 `src/config/resume-theme.ts`의 `colors.highlightBackground`에서 색상을 바꿉니다. MD 복사와 파일에는 `==문구==`를 유지합니다. 이 확장 문법을 지원하지 않는 Markdown 뷰어에서는 `==`가 그대로 보일 수 있습니다. 등호를 문자로 표시하려면 `\=\=문구\=\=`처럼 이스케이프하거나 인라인 코드로 작성합니다.
- `**강조**`처럼 특수문자로 시작하거나 `: `를 포함하는 한 줄 문장은 따옴표로 감싸거나 `|` 아래에 작성합니다. 들여쓰기는 공백 두 칸을 사용합니다.

문법 오류에는 YAML 파일의 행·열과 오류 코드가, 내용 오류에는 필드 경로가 표시됩니다. 예를 들어 `resume.yaml.experiences.0.startDate`는 첫 번째 회사의 시작일입니다. 숫자로 읽힌 연도는 따옴표로 감싸고, 오타·누락·잘못된 형식을 고친 뒤 다시 빌드합니다.

### 재직 기간

경력의 날짜 뒤에는 입사월과 퇴사월을 포함한 근속 기간을 표시합니다. 예를 들어 `2021-01 ~ 2022-06`은 `2021-01 ~ 2022-06 (1년 6개월)`로 표시됩니다. 같은 달에 입·퇴사하면 `(1개월)`, 정확히 12개월이면 `(1년)`입니다. YAML에 근속 기간을 따로 입력하지 않습니다.

`isCurrent: true`인 경력은 빌드 시 서울 시간대의 현재 월까지 계산합니다. 예를 들어 2026년 11월에 빌드하면 `2023-02 ~ 현재 (3년 10개월)`입니다. 웹·PDF·Markdown은 같은 계산 함수와 빌드 기준월을 사용합니다. 필요한 날짜가 없거나 연도만 입력한 경우, 현재 재직의 입사월이 기준월보다 미래인 경우에는 날짜 표시는 유지하고 괄호의 근속 기간만 생략합니다.

## 표시와 테마

- `src/config/resume-display.ts`: `sections` 배열의 순서·`title`·`visible`을 수정합니다. 다섯 섹션은 각각 한 번 포함하며 숨길 때는 `visible: false`를 사용합니다. 본문을 유지하고 제목·구분선만 숨기려면 `showTitle: false`를 지정합니다. 생략하면 제목을 표시하며, 현재 소개에만 `false`를 지정했습니다. 제목을 숨겨도 접근성 이름으로 사용할 `title`은 유지합니다. `labels`에서 주요 기여·이슈·해결 방향·성과·자격 취득 사유의 표시 문구를 바꿉니다. 프로젝트의 `description`은 라벨 없이 제목 바로 아래에 회색 텍스트로 표시합니다.
- `src/config/resume-theme.ts`: 폰트·크기·간격·색상·너비를 수정합니다. 기술 분류 제목 크기는 `fontSizes.skillCategory`, 자격증 이름 크기는 `fontSizes.certification`, 이슈 제목 크기는 `fontSizes.issue`, 이슈 사이 간격은 `spacing.issue`로 조절합니다. 회사 로고는 `widths.companyLogo`, 자격증 배지는 `widths.certificationBadge`, 구분선의 주황색 길이는 `widths.sectionAccent`로 조절합니다. 섹션 제목의 그라데이션은 `colors.headingStart`·`headingEnd`, 장식 색상은 `accent`에서 변경합니다. 크기·간격·너비는 px 숫자, 줄 높이는 배수, 색상은 `#RRGGBB`입니다.

프로필과 첫 번째 표시 섹션 사이 간격은 `spacing.profile`로 조절하며 기본값은 40px입니다. 소개 다음 섹션까지의 간격은 `spacing.afterSummary`의 40px입니다. 나머지 간격은 `spacing.section`·`company`·`project`·`issue`로 묶음별 조절합니다. `spacing.item`은 기술 분류 사이의 24px 간격, `spacing.dividedItem`은 학력·자격 구분선 양쪽을 합친 간격이며 구분선 두께는 제외합니다.

외부 프로필 링크는 별도 행에 표시하고, `profile.contacts`의 값은 작성 순서대로 쉼표와 공백 한 칸(`, `)으로 연결해 한 행에 표시합니다. 전화번호와 일반 텍스트 이메일은 각각 `contacts`에 작성하면 됩니다. 공간이 부족하면 자연스럽게 줄바꿈합니다. 행 사이는 `spacing.compact`의 4px입니다. 이름·직무와 소개 첫 문장, 첫 문장과 연락처, 소개 본문 문단 사이는 `spacing.content`의 12px로 구분합니다. 본문은 들여쓰기 없이 표시하며 목록으로 작성한 경우에만 `spacing.inline`의 8px 간격을 사용합니다. 프로필의 마지막 연락처에서 소개 본문까지, 소개에서 다음 섹션까지 각각 40px 간격을 유지합니다. 웹·PDF·Markdown은 이름·직무 → 소개 첫 문장 → 연락처 → 소개 본문 순서로 표시합니다.

소개 첫 문장은 웹·PDF·인쇄에서 페이지 배경 위에 18px 일반체로 표시하며 크기는 `fontSizes.summaryLead`로 조절합니다. 글자는 `colors.text`, 내부 여백은 `spacing.content`의 12px를 사용하며 별도 배경색·테두리·둥근 모서리는 적용하지 않습니다. 위 예시처럼 YAML 여러 줄 문자열에서 쉼표 뒤에 역슬래시를 넣으면 명시적으로 줄을 나눕니다. Markdown 복사에도 같은 줄바꿈을 유지하고 좁은 화면에서는 문장이 추가로 자연스럽게 줄바꿈됩니다.

경력 태그 칩의 배경색은 `colors.tagBackground`에서 조절합니다. 기본값은 `#DEDEDE`입니다. 이슈 제목 색상은 `colors.issueHeading`이며 기본값은 옅은 갈색 `#AD6F46`입니다.

근속 기간의 `년`·`개월` 표시는 `src/config/resume-display.ts`의 `labels.durationYear`·`labels.durationMonth`에서 바꿉니다.

화면의 프로젝트명 그림자는 `shadows.projectTitle`에서 조절합니다. `x`·`y`·`blur`는 px, `opacity`는 0~1이며 색상은 `colors.text`를 따릅니다. 인쇄·고대비 모드와 PDF에는 그림자를 적용하지 않습니다.

YAML과 테마 설정은 전체 이력서 화면에 적용됩니다. 프로필은 맨 위에 표시하고, 나머지 다섯 섹션은 표시 설정의 제목·순서·표시 여부를 따릅니다. 빈 섹션과 기술이 없는 분류는 숨깁니다. 정적 배포 결과를 갱신하려면 변경 후 재빌드·재배포해야 합니다.

기술은 YAML에서 분류별 목록으로 작성하며 웹·PDF·Markdown에서는 분류 제목 아래에 `JavaScript, TypeScript, React, Next.js`처럼 쉼표로 연결해 표시합니다. 폭이 부족하면 자연스럽게 줄바꿈합니다.

### 백상지 배경 조절

페이지 전체에 SVG data URI로 만든 백상지 질감을 사용합니다. 종이 설정은 `src/config/resume-theme.ts` 상단의 `paper` 객체에서 관리하고, 배경색도 `paper.color`에서 가져옵니다. `BAEKSANGJI`는 원본 프리셋이며 바꿀 값은 `paper` 객체에 속성으로 덮어씁니다.

`npm run dev`로 실행하면 오른쪽 아래 **종이** 버튼이 나타납니다. `Alt+Shift+P`로도 패널을 열고 닫을 수 있습니다. 슬라이더로 질감을 조절하고, 패널 제목을 드래그하거나 제목 버튼에서 방향키로 이동합니다. 조정값과 위치는 같은 주소의 브라우저 저장소에 보관하며 작은 화면에서는 접힌 상태로 시작합니다. **백상지로 되돌리기**는 조정값을 초기화하고 저장된 조정값을 지웁니다.

저장할 값은 **JSON 복사**로 가져와 `paper` 객체에 반영한 뒤 아래 명령으로 CSS를 다시 생성합니다. **CSS 복사**는 현재 설정의 `:root` 변수 블록 전체를 제공합니다.

```sh
npm run paper:generate
npm run build
```

`src/styles/paper.generated.css`는 생성 결과입니다. 테마의 종이 설정을 바꿀 때마다 생성 명령을 실행하고 두 파일을 함께 커밋합니다. 프로덕션과 `npm run preview`에는 조절 패널이 포함되지 않으며, 배경은 JavaScript 없이 표시됩니다. 인쇄·고대비 모드에서는 질감을 끕니다. 현재 사이트는 라이트 테마이며, 어두운 종이색을 시험할 때의 본문 대비는 별도로 확인해야 합니다.

## 내보내기와 인쇄

화면 너비 1024px 이상에서는 프로필 오른쪽 위의 **Export** 메뉴를 사용할 수 있습니다.

- **PDF 다운로드**: 흰 배경의 A4 문서를 바로 내려받고 다운로드 시작 알림을 표시합니다. 한글 텍스트를 선택·검색할 수 있으며 회사 로고와 자격 배지를 포함합니다.
- **프린터 출력**: 인쇄창 열기 알림과 함께 브라우저 인쇄창을 엽니다. 인쇄 배경은 흰색이며 종이 질감과 Export 메뉴·알림은 출력하지 않습니다.
- **MD 복사하기**: 구분선 아래에서 화면에 표시하는 섹션의 순서·제목·내용·강조·링크를 Markdown 원문으로 복사합니다. 로고와 배지는 제외합니다. 복사 중 알림을 표시하고 성공하면 메뉴를 닫고 3초 동안 완료 알림을 표시합니다. 실패하면 메뉴를 열어 둔 채 클립보드 권한 안내를 표시하므로 같은 메뉴에서 다시 시도할 수 있습니다.

알림은 Sonner를 사용해 화면 오른쪽 위에 하나씩 표시합니다. 다운로드 시작·복사 성공 안내는 3초 후 사라지고, 복사 실패 안내는 재시도·메뉴 재열기·닫기 버튼으로 지울 수 있습니다. 인쇄창 열기 안내는 인쇄창을 닫을 때 제거합니다. PDF 저장이나 인쇄의 실제 완료 여부는 알림으로 판정하지 않습니다.

복사는 HTTPS 또는 localhost에서 사용할 수 있습니다. Export 버튼과 각 항목의 아이콘은 Tabler Icons의 SVG를 사용합니다.

PDF와 Markdown은 빌드할 때 생성합니다. 콘텐츠나 섹션 표시 설정을 바꾼 뒤 재빌드·재배포하면 다운로드 파일과 복사 내용에도 반영됩니다. 기존 `resume.md` 파일 주소도 유지합니다. 웹페이지와 PDF는 저장소에 포함된 Pretendard를 사용합니다. 웹폰트는 사이트에서 직접 제공하며 PDF에는 고정 굵기 글꼴을 포함합니다. PDF는 인쇄용 JSX로 생성하므로 웹페이지와 줄바꿈이 다를 수 있습니다. PDF의 크기·간격·색상은 테마값을 pt 단위로 변환해 사용하되 A4 여백과 흰 배경은 고정합니다. 글꼴 출처와 라이선스는 `assets/fonts/pretendard/`에 있습니다.

## 외부 데이터 연결

`src/data/local-source.ts`의 공급 함수를 교체합니다. API 응답을 공통 모델로 변환하면 기존 로더가 다시 검증합니다. YAML과 같은 간단한 작성 형태의 JSON을 받는 API도 작성 형식 검증과 변환을 거쳐야 합니다. 컴포넌트에서는 API를 호출하지 않으며 현재 외부 API 요청은 없습니다.


## GitHub Pages 배포

워크플로는 `main` push와 매월 1일 오전 9시 10분(Asia/Seoul)에 Node 버전 파일과 npm 12.2.0을 사용해 `npm ci`, `npm run verify`를 실행하고 성공한 `dist`만 배포합니다. 월별 빌드는 현재 재직의 근속 기간을 웹·PDF·Markdown에 함께 갱신합니다. 이 예약 실행은 워크플로 변경을 기본 브랜치인 `main`에 push한 뒤 적용됩니다. Actions의 **이력서 검사와 Pages 배포 → Run workflow**에서도 수동으로 실행할 수 있습니다.

GitHub의 예약 실행은 지연될 수 있으며, 공개 저장소에서 60일간 활동이 없으면 자동으로 비활성화될 수 있습니다. 비활성화된 경우 Actions의 해당 워크플로에서 **Enable workflow**로 다시 켜고 **Run workflow**로 갱신합니다. 다음 빌드·배포 전까지 사이트에는 마지막으로 빌드한 근속 기간이 유지됩니다. 자세한 제약은 [GitHub의 schedule 안내](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)를 참고하세요.

최초 사용 전 저장소 Settings → Pages → Source를 GitHub Actions로 설정해야 합니다. 공개 저장소는 GitHub Free에서 사용할 수 있으며 비공개 저장소는 Pages를 지원하는 요금제가 필요합니다.

배포 워크플로는 `SITE_URL=https://resume.0-chan.kim`, `BASE_PATH=/`를 명시해 커스텀 도메인의 루트에 배포합니다. Astro 설정은 이 환경변수를 읽으며 로컬 개발의 기본 경로도 `/`입니다. 운영 주소와 경로를 로컬에서 재현하려면 빌드와 preview에 같은 값을 전달합니다.

```sh
SITE_URL=https://resume.0-chan.kim BASE_PATH=/ npm run build
SITE_URL=https://resume.0-chan.kim BASE_PATH=/ npm run preview
```

현재 배포 경로는 `/`이며 CSS·JavaScript는 `/_astro/`, 이미지는 `/images/`, PDF와 Markdown은 `/resume.pdf`·`/resume.md`에서 제공합니다. 로컬 이미지는 `public/images`에 넣고 YAML에는 `/images/logo.png`처럼 사이트 루트 기준으로 작성합니다. 회사 로고와 자격 배지 렌더러가 배포 경로를 붙이며 외부 이미지 URL은 유지합니다. HTTPS 사이트의 외부 이미지는 HTTPS 주소를 사용하세요.

저장소 Settings → Pages의 커스텀 도메인은 `resume.0-chan.kim`이며 HTTPS를 사용합니다. 도메인이나 배포 경로를 변경하면 Pages 설정과 워크플로의 `SITE_URL`·`BASE_PATH`를 함께 갱신하고 재빌드·재배포해야 합니다. Actions 배포에는 저장소의 CNAME 파일이 필요하지 않습니다.
