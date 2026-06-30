/**
 * 2026 NAVER MARKETING DAY - Road to Korea
 * RSVP → Google Sheets 연동 스크립트
 *
 * ─── 배포 방법 ────────────────────────────────────────────────────────────────
 *
 * 1. 아래 링크의 구글 시트 열기
 *    https://docs.google.com/spreadsheets/d/16KsRUetko_N8wqA7pN_qyIHD9-vXCDfMvUqwtM01G2Y/edit
 *
 * 2. 상단 메뉴 > 확장 프로그램 > Apps Script 클릭
 *
 * 3. 이 파일 내용 전체를 코드 편집기에 붙여넣기 (기존 내용 삭제 후)
 *
 * 4. 상단 > 배포 > 새 배포 클릭
 *    - 유형 선택(⚙️) > 웹 앱
 *    - 설명: RSVP Form
 *    - 다음 사용자로 실행: 나 (본인 계정)
 *    - 액세스 권한: 모든 사용자
 *    → 배포 클릭 → 권한 요청 팝업에서 허용
 *
 * 5. 배포 후 나타나는 "웹 앱 URL" 복사해서 개발자에게 전달
 *
 * ──────────────────────────────────────────────────────────────────────────────
 */

var SPREADSHEET_ID = '16KsRUetko_N8wqA7pN_qyIHD9-vXCDfMvUqwtM01G2Y';
var SHEET_GID      = 2055763895; // 특정 탭 (gid)

function getTargetSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === SHEET_GID) return sheets[i];
  }
  // gid 탭을 못 찾으면 첫 번째 탭 사용
  return ss.getSheets()[0];
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = getTargetSheet();

    // 헤더 자동 생성 (첫 제출 시)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['제출 시각', '회사명', '이름', '담당 업무', '이메일', '참석 여부', '동반 인원', '언어']);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var data = JSON.parse(e.postData.contents);

    var attendanceMap = { attending: '참석', not_attending: '불참', undecided: '미정' };
    var companionMap  = { just_me: '본인만', '+1': '+1명', '+2': '+2명', '+3': '+3명 이상', '-': '-' };

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

// 배포 확인용 GET 테스트
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'RSVP Script is running ✓' }))
    .setMimeType(ContentService.MimeType.JSON);
}
