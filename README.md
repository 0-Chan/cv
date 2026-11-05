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

## 설계 문서

- [제품 설계](docs/development.md)
- [제품 검증 기준](docs/verification.md)
