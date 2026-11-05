# Astro 이력서 프로젝트

이력서 콘텐츠, 섹션 표시 설정, 디자인 테마를 UI와 분리하는 정적 이력서 웹페이지 프로젝트입니다.

Astro, TypeScript, Tailwind CSS를 사용합니다. 현재는 ‘이력서’ 제목을 표시하는 최소 페이지만 구현되어 있습니다. 이력서 데이터와 각 섹션은 아직 제공하지 않습니다.

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

Vitest 실행 환경만 준비되어 있으며 테스트 코드는 아직 없습니다. 현재 `npm test`는 테스트 파일이 없다는 오류로 종료됩니다. 빈 테스트를 성공으로 처리하지 않습니다.

## 설계 문서

- [제품 설계](docs/development.md)
- [제품 검증 기준](docs/verification.md)
