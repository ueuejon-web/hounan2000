/**
 * 豊南中2000年卒ポータル - Backend GAS Script (最終安定版)
 * 2026/04/01 更新
 */

// スプレッドシートIDを固定
const SPREADSHEET_ID = '19R-_QYN5kKL204E6-tXWeQZJhE0P_1XZALnweOkB-yE';
const SHEET_NAME = 'シート1';
const DRIVE_FOLDER_ID = '1bw9jhwTg1BbAN2FyqVKDQx8cHGnUwGeJ';

function doGet(e) {
  try {
    const action = e.parameter.action;
    const sheet = getTargetSheet();
    
    if (action === 'save' || action === 'delete') {
      return handlePostRequest(e.parameter);
    }
    
    // データ取得
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    const json = data.map(row => {
      let obj = {};
      headers.forEach((h, i) => {
        // IDは常に文字列として扱う
        obj[h] = (h === 'id') ? String(row[i]) : row[i];
      });
      return obj;
    });
    
    return createJsonResponse(json);
  } catch (error) {
    logError('doGet', error);
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    return handlePostRequest(params);
  } catch (error) {
    logError('doPost', error);
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

function handlePostRequest(params) {
  const sheet = getTargetSheet();
  const action = params.action;
  
  if (action === 'save') {
    return handleSave(params.data, sheet);
  } else if (action === 'delete') {
    return handleDelete(params.id, sheet);
  }
  return createJsonResponse({ status: 'error', message: 'Invalid action' });
}

function handleSave(member, sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  // 1. IDの採番（新規の場合）
  if (!member.id) {
    member.id = Utilities.getUuid();
  } else {
    member.id = String(member.id);
  }

  // 2. 画像の処理
  if (member.images && member.images.length > 0) {
    member.images = member.images.map(img => {
      if (typeof img === 'string' && img.startsWith('http')) return img;
      return uploadToDrive(img, member.name);
    }).filter(Boolean).sort().join(','); // URLリストとしてカンマ区切りで保存
  } else {
    member.images = '';
  }

  // 3. 行の特定
  let rowIndex = rows.findIndex(r => String(r[0]) === String(member.id));
  
  // 4. 書き込み用データの配列作成
  const newRow = headers.map(h => {
    if (h === 'created_at' && !member[h]) return new Date();
    // メンバーオブジェクトから対応するキーの値を抽出
    return member[h] !== undefined ? member[h] : '';
  });

  if (rowIndex > -1) {
    // 更新 (スプレッドシートは1-indexed, 2行目からデータ開始)
    sheet.getRange(rowIndex + 2, 1, 1, headers.length).setValues([newRow]);
  } else {
    // 新規追加
    sheet.appendRow(newRow);
  }
  
  return createJsonResponse({ status: 'success', data: member });
}

function handleDelete(id, sheet) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return createJsonResponse({ status: 'success' });
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getTargetSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Sheet not found: ' + SHEET_NAME);
  return sheet;
}

function uploadToDrive(base64Data, itemName) {
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const contentType = base64Data.substring(base64Data.indexOf(":") + 1, base64Data.indexOf(";"));
    const bytes = Utilities.base64Decode(base64Data.split(",")[1]);
    const blob = Utilities.newBlob(bytes, contentType, itemName + "_" + Date.now());
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1000";
  } catch (e) {
    logError('uploadToDrive', e);
    return null;
  }
}

function logError(tag, error) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logSheet = ss.getSheetByName('log');
    if (!logSheet) {
      logSheet = ss.insertSheet('log');
      logSheet.appendRow(['Date', 'Tag', 'Message']);
    }
    logSheet.appendRow([new Date(), tag, error.toString()]);
  } catch (e) {}
}
