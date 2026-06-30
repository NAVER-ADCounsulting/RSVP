/**
 * 2026 NAVER MARKETING DAY - Road to Korea
 * RSVP → Google Sheets 연동 스크립트
 *
 * ─── 배포 방법 ────────────────────────────────────────────────────────────────
 *
 * 1. 구글 시트 열기
 *    → 응답이 저장될 시트 (시트 소유자가 아니어도 '편집자' 권한이면 OK)
 *
 * 2. 확장 프로그램 > Apps Script 클릭
 *
 * 3. 이 파일의 내용을 전체 복사하여 코드 편집기에 붙여넣기
 *    (기존 내용은 삭제)
 *
 * 4. 배포 > 새 배포 클릭
 *    - 유형: 웹 앱
 *    - 설명: RSVP Form (아무 이름 가능)
 *    - 다음 사용자로 실행: 나 (본인 계정)
 *    - 액세스 권한: 모든 사용자
 *    → 배포 클릭 → 권한 허용
 *
 * 5. 배포 후 나타나는 "웹 앱 URL" 복사
 *    → index.html의 SCRIPT_URL 상수에 붙여넣기
 *
 * 6. 이후 코드 수정 시: 배포 > 배포 관리 > 수정 (새 버전으로 배포)
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * 시트 컬럼 구성 (자동 헤더 생성):
 * A: 제출 시각 | B: 회사명 | C: 이름 | D: 담당업무 | E: 이메일
 * F: 참석여부  | G: 동반인원 | H: 제출 언어
 */

var SHEET_NAME = ''; // 특정 시트명 지정 시 입력 (비워두면 첫 번째 시트 사용)

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = SHEET_NAME
      ? ss.getSheetByName(SHEET_NAME)
      : ss.getSheets()[0];

    // 헤더 자동 생성 (첫 제출 시)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        '제출 시각', '회사명', '이름', '담당 업무', '이메일',
        '참석 여부', '동반 인원', '언어'
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var data = JSON.parse(e.postData.contents);

    // 참석 여부 한글 변환
    var attendanceMap = {
      'attending': '참석',
      'not_attending': '불참',
      'undecided': '미정'
    };
    var companionMap = {
      'just_me': '본인만',
      '+1': '+1명',
      '+2': '+2명',
      '+3': '+3명 이상',
      '-': '-'
    };

    sheet.appendRow([
      new Date(),
      data.company   || '',
      data.name      || '',
      data.jobTitle  || '',
      data.email     || '',
      attendanceMap[data.attendance] || data.attendance || '',
      companionMap[data.companions]  || data.companions || '-',
      data.language  || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log(err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// GET 요청 테스트용 (배포 확인)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'RSVP Script is running ✓' }))
    .setMimeType(ContentService.MimeType.JSON);
}
