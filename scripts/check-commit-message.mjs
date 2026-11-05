import { readFileSync } from "node:fs";

try {
  const title = readFileSync(process.argv[2], "utf8").split(/\r?\n/, 1)[0];
  const pattern = /^(기능|수정|정리|문서|설정|도구|테스트|되돌림): .*[가-힣]/u;

  if (!pattern.test(title)) {
    console.error(
      "커밋 제목은 '유형: 한글 설명' 형식이어야 합니다.\n" +
        "허용 유형: 기능·수정·정리·문서·설정·도구·테스트·되돌림\n" +
        "예: 테스트: Vitest로 데이터 검증 추가",
    );
    process.exitCode = 1;
  }
} catch {
  console.error("커밋 메시지 파일을 읽을 수 없습니다.");
  process.exitCode = 1;
}
