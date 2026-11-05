# Astro 이력서 프로젝트

이력서 콘텐츠, 섹션 표시 설정, 디자인 테마를 UI와 분리하는 정적 이력서 웹페이지 프로젝트입니다.

Astro, TypeScript, Tailwind CSS를 사용합니다. 현재는 콘텐츠·표시·테마 설정과 빌드 시 검증 로더가 구현되어 있습니다. 화면은 아직 ‘이력서’ 제목만 표시하며, 설정 내용을 보여주는 섹션 컴포넌트는 구현 예정입니다.

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
npm run verify:static
```

타입 검사, Biome lint, 포맷 검사, 정적 빌드를 차례로 실행합니다. 테스트는 포함하지 않습니다.

| 명령 | 역할 |
|---|---|
| `npm run lint` | 소스와 프로젝트 설정의 Biome lint |
| `npm run format:check` | 포맷 검사 |
| `npm run format` | 검사 대상 파일의 포맷 수정 |
| `npm test` | Vitest 실행 |

Biome는 Astro·TypeScript·CSS와 루트 설정 파일을 검사합니다. Markdown 문서, 스킬, lockfile, 생성 산출물은 포맷 대상이 아닙니다. Astro 전체 지원은 실험적 기능을 사용합니다.

Vitest로 날짜 입력 형식, 선택 날짜 누락, 기간 순서와 현재 재직 여부를 검사합니다. `npm test -- --reporter=verbose`로 각 테스트의 설명을 확인할 수 있습니다.

## 설계 문서

- [제품 설계](docs/development.md)
- [제품 검증 기준](docs/verification.md)

## 이력서 설정

- `src/config/resume.ts`: 이름·소개·경력 등 콘텐츠를 수정합니다. 재직 이력에는 `id`를 입력하지 않습니다. 프로젝트 등 나머지 항목의 `id`는 제목을 바꾸거나 순서를 옮겨도 유지합니다.
- `src/config/resume-display.ts`: `sections` 배열을 재정렬하거나 `title`, `visible`을 변경합니다. 다섯 섹션은 각각 한 번 포함하고, 숨길 때는 `visible: false`를 사용합니다.
- `src/config/resume-theme.ts`: 폰트·크기·간격·색상·너비를 수정합니다. 크기·간격·너비는 px 숫자, 줄 높이는 배수, 색상은 `#RRGGBB`입니다.

날짜는 `YYYY` 또는 `YYYY-MM`입니다. 선택값은 필드를 생략하며 빈 문자열·공백·null을 넣지 않습니다. 현재 재직 여부는 `isCurrent`로 명시합니다. 종료일 누락만으로 현재 재직을 판단하지 않습니다.

설정은 현재 빌드에서 검증되며, 오류가 있으면 빌드가 실패합니다. 표시·테마 설정의 실제 화면 적용은 섹션 컴포넌트 구현 후 제공됩니다. 정적 배포 결과를 갱신하려면 설정 변경 후 재빌드·재배포해야 합니다.

외부 API로 전환할 때는 `src/data/local-source.ts`의 공급 함수를 교체합니다. 응답을 공통 콘텐츠 모델로 변환한 뒤 기존 로더 검증을 통과시키며, 컴포넌트에서는 API를 호출하지 않습니다. 현재 외부 API 요청은 없습니다.
