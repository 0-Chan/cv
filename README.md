# Astro 이력서 프로젝트

이력서 콘텐츠, 섹션 표시 설정, 디자인 테마를 UI와 분리하는 정적 이력서 웹페이지 프로젝트입니다.

Astro, React TSX, TypeScript, Tailwind CSS를 사용합니다. 프로필·소개·경력·기술·학력·자격을 빌드 시 HTML로 렌더링합니다. 경력에는 회사 업무 요약과 프로젝트 목록을 표시할 수 있습니다.

[이력서 예시 보기](https://0-chan.github.io/cv/) · [GitHub 저장소](https://github.com/0-Chan/cv)

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

Vitest로 날짜 입력 형식, 선택 날짜 누락, 기간 순서와 현재 재직 여부를 검사합니다. YAML의 링크·기술 매핑과 섹션 생략, 빈 이름의 필드 오류, 중복 키의 위치 안내도 검사합니다. 회사 요약과 프로젝트의 분리, 핵심 역할·이슈의 필수 입력과 이슈별 문제·해결 방향·성과 보존도 검증합니다. `npm test -- --reporter=verbose`로 각 테스트의 설명을 확인할 수 있습니다.

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
        technologies:
          - TypeScript
        role: 핵심 역할입니다.
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

- 회사 요약(`highlights`)과 프로젝트(`projects`)는 각각 생략할 수 있습니다. 배열에 적은 순서가 유지됩니다.
- 날짜는 `startDate: "2024"`, `endDate: "2024-03"`처럼 따옴표를 붙인 연도·연월입니다. 일 단위는 지원하지 않습니다.
- 현재 재직은 `isCurrent: true`로 명시하고 종료일을 생략합니다. 종료일 누락만으로 현재 재직으로 판단하지 않습니다.
- 자격 취득 날짜는 선택 필드인 `issuedAt`으로 입력합니다. `verificationLink`는 표시 이름과 주소 한 쌍입니다.
- 회사 로고는 회사 항목의 `logo`, 자격 배지는 `badge`에 `{ src: /images/example.png, alt: 이미지 설명 }` 형태로 입력합니다.
- 선택값은 필드를 생략합니다. 빈 문자열·공백만 있는 문장·`null`은 오류입니다. 전화번호처럼 숫자로 보이는 문자열에도 따옴표를 붙입니다.
- 문단은 빈 줄로 구분합니다. `|`는 줄바꿈을 보존하고 `>`는 줄을 이어 쓰는 YAML 문법입니다. Markdown의 명시적 줄바꿈은 두 공백 또는 역슬래시 뒤 줄바꿈으로 작성합니다.
- 프로젝트는 설명·핵심 역할과 하나 이상의 `issues`를 작성합니다. 각 이슈의 `title`·`description`·`approach`·`outcomes`는 필수이며 해결 방향·성과 목록은 비울 수 없습니다. `technologies`는 일반 텍스트 목록이며 생략하거나 비우면 기술 스택 행을 숨깁니다.
- 회사 수준 `highlights`는 유지하지만 프로젝트에는 사용하지 않습니다. 이슈 번호는 화면의 순서로 표시하므로 직접 입력하지 않습니다.
- Markdown은 소개·프로젝트 및 이슈 설명·핵심 역할·해결 방향·성과·기술 섹션의 항목에 적용합니다. 기술 항목은 `**기술명:** 설명`이나 단순 기술명으로 작성할 수 있습니다. 이름·제목·태그·프로젝트의 관련 기술은 일반 텍스트입니다. HTML, 이미지, 제목, 표, 코드 블록, 참조형 링크는 지원하지 않으며 목록은 YAML 목록으로 작성합니다.
- `**강조**`처럼 특수문자로 시작하거나 `: `를 포함하는 한 줄 문장은 따옴표로 감싸거나 `|` 아래에 작성합니다. 들여쓰기는 공백 두 칸을 사용합니다.

문법 오류에는 YAML 파일의 행·열과 오류 코드가, 내용 오류에는 필드 경로가 표시됩니다. 예를 들어 `resume.yaml.experiences.0.startDate`는 첫 번째 회사의 시작일입니다. 숫자로 읽힌 연도는 따옴표로 감싸고, 오타·누락·잘못된 형식을 고친 뒤 다시 빌드합니다.

## 표시와 테마

- `src/config/resume-display.ts`: `sections` 배열의 순서·`title`·`visible`을 수정합니다. 다섯 섹션은 각각 한 번 포함하며 숨길 때는 `visible: false`를 사용합니다. `labels`에서 프로젝트 설명·기술 스택·핵심 역할·이슈·해결 방향·성과의 표시 문구를 바꿉니다.
- `src/config/resume-theme.ts`: 폰트·크기·간격·색상·너비를 수정합니다. 이슈 제목 크기는 `fontSizes.issue`, 이슈 사이 간격은 `spacing.issue`로 조절합니다. 회사 로고는 `widths.companyLogo`, 자격증 배지는 `widths.certificationBadge`, 구분선의 주황색 길이는 `widths.sectionAccent`로 조절합니다. 섹션 제목의 그라데이션은 `colors.headingStart`·`headingEnd`, 장식 색상은 `accent`에서 변경합니다. 크기·간격·너비는 px 숫자, 줄 높이는 배수, 색상은 `#RRGGBB`입니다.

프로필과 첫 번째 표시 섹션 사이 간격은 `spacing.profile`로 조절하며 기본값은 40px입니다. 나머지 간격은 `spacing.section`·`company`·`project`·`issue`로 묶음별 조절합니다. `spacing.item`은 기술 분류 사이, `spacing.dividedItem`은 학력·자격 구분선 양쪽을 합친 간격이며 구분선 두께는 제외합니다.

경력 태그 칩의 배경색은 `colors.tagBackground`에서 조절합니다. 기본값은 `#DEDEDE`입니다. 이슈 제목 색상은 `colors.issueHeading`이며 기본값은 옅은 갈색 `#AD6F46`입니다.

YAML과 테마 설정은 전체 이력서 화면에 적용됩니다. 프로필은 맨 위에 표시하고, 나머지 다섯 섹션은 표시 설정의 제목·순서·표시 여부를 따릅니다. 빈 섹션과 기술이 없는 분류는 숨깁니다. 정적 배포 결과를 갱신하려면 변경 후 재빌드·재배포해야 합니다.

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

- **PDF 다운로드**: 흰 배경의 A4 문서를 바로 내려받습니다. 한글 텍스트를 선택·검색할 수 있으며 회사 로고와 자격 배지를 포함합니다.
- **Markdown 다운로드**: 화면에 표시하는 섹션의 순서·제목·내용·강조·링크를 `.md` 파일로 내려받습니다. 로고와 배지는 제외합니다.
- **프린터 출력**: 브라우저 인쇄창을 엽니다. 인쇄 배경은 흰색이며 종이 질감과 Export 메뉴는 출력하지 않습니다.

PDF와 Markdown은 빌드할 때 생성합니다. 콘텐츠나 섹션 표시 설정을 바꾼 뒤 재빌드·재배포하면 다운로드 파일에도 반영됩니다. PDF는 인쇄용 JSX와 저장소에 포함된 나눔고딕을 사용하며, 웹페이지의 시스템 글꼴과는 줄바꿈이 다를 수 있습니다. PDF의 크기·간격·색상은 테마값을 pt 단위로 변환해 사용하되 A4 여백과 흰 배경은 고정합니다. 글꼴 출처와 라이선스는 `assets/fonts/nanum-gothic/`에 있습니다.

## 외부 데이터 연결

`src/data/local-source.ts`의 공급 함수를 교체합니다. API 응답을 공통 모델로 변환하면 기존 로더가 다시 검증합니다. YAML과 같은 간단한 작성 형태의 JSON을 받는 API도 작성 형식 검증과 변환을 거쳐야 합니다. 컴포넌트에서는 API를 호출하지 않으며 현재 외부 API 요청은 없습니다.


## GitHub Pages 배포

워크플로는 `main` push 시 Node 버전 파일과 npm 12.2.0을 사용해 `npm ci`, `npm run verify`를 실행하고 성공한 `dist`만 배포합니다. 최초 사용 전 저장소 Settings → Pages → Source를 GitHub Actions로 설정해야 합니다. 공개 저장소는 GitHub Free에서 사용할 수 있으며 비공개 저장소는 Pages를 지원하는 요금제가 필요합니다.

Pages에서 제공하는 origin과 base path를 `SITE_URL`, `BASE_PATH`로 전달하므로 저장소 이름을 코드에 적지 않습니다. 로컬 개발의 기본 경로는 `/`입니다. 하위 경로를 재현하려면 빌드와 preview에 같은 값을 전달합니다.

```sh
SITE_URL=https://0-chan.github.io BASE_PATH=/cv npm run build
SITE_URL=https://0-chan.github.io BASE_PATH=/cv npm run preview
```

현재 배포 경로는 `/cv/`이며 다른 저장소에 배포하면 저장소 이름에 따라 달라집니다. 로컬 이미지는 `public/images`에 넣고 YAML에는 `/images/logo.png`처럼 사이트 루트 기준으로 작성합니다. 회사 로고와 자격 배지 렌더러가 배포 경로를 붙이며 외부 이미지 URL은 유지합니다. HTTPS 사이트의 외부 이미지는 HTTPS 주소를 사용하세요.

최초 배포는 GitHub 기본 주소를 사용합니다. `0-chan.cv` 도메인 연결·DNS·HTTPS 설정은 마지막 작업으로 남겨둡니다. 추후 Pages 설정에서 도메인을 연결한 뒤 재배포하면 새 주소가 반영됩니다. Actions 배포에는 저장소의 CNAME 파일이 필요하지 않습니다.
