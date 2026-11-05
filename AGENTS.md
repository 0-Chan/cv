# 이력서 프로젝트 작업 지침

작업 전 [공통 지침](docs/agent-instructions.md)과 [작업 기록](docs/work-log.md)을 읽고 따른다. 구조 변경에는 [개발 설계](docs/development.md), 검증에는 [검증 전략](docs/verification.md)을 읽는다.

- 현재 승인된 단계만 진행한다. 단계 종료 후 다음 단계는 사용자와 합의한다.
- 테스트 신규 작성·수정·삭제는 시나리오 논의와 실제 코드 초안/diff의 명시적 승인 후에만 반영한다. fixture·helper·snapshot·기준 이미지·임시 테스트 코드도 포함한다.
- 기존 승인된 테스트 실행과 타입·lint·포맷 검사·빌드는 재승인 없이 수행한다.
- 콘텐츠·표시·테마·UI를 분리하고 Tailwind CSS를 사용한다. 실제 PDF 콘텐츠를 재사용하지 않는다.
- 미작성·미실행·미등록을 완료로 기록하지 않는다.
- 완료한 변경은 검토 가능한 작업 단위로 나누어 커밋한다. 제목은 무엇을 바꿨는지 이해할 수 있는 한글로 쓰고, 필요한 이유·검증 결과는 본문에 기록한다. 원격 push는 별도 요청 없이 수행하지 않는다.

공통 스킬 원본은 `.agents/skills`에 있으며 `.claude/skills`의 개별 상대 링크로 공유한다. 자동 인식·검증 상태는 작업 기록을 확인한다.

- [cv-plan-change](.agents/skills/cv-plan-change/SKILL.md): 변경 단위 계획
- [cv-review-tests](.agents/skills/cv-review-tests/SKILL.md): 테스트 사전 검토
- [cv-verify-change](.agents/skills/cv-verify-change/SKILL.md): 변경 검증
