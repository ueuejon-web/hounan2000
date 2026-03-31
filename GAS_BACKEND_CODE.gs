/**
 * 豊南中2000年卒ポータル - Backend GAS Script (CORS対応・安定版)
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const SHEET_NAME = '豊南ポータルサイトメンバーカード';
const DRIVE_FOLDER_ID = '1bw9jhwTg1BbAN2FyqVKDQx8cHGnUwGeJ';

// GETリクエスト（データ取得および予備の操作用）
function doGet(e) {
  try {
    const action = e.parameter.action;
    const sheet = getTargetSheet();
    
    // アクションの分岐
    if (action === 'save' || action === 'delete') {
      // GET経由での書き込み（POSTがブロックされる際のエスケープ用）
      return handlePostRequest(e.parameter);
    }
    
    // デフォルト：データ一覧取得
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    const json = data.map(row => {
      let obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
    
    return createJsonResponse(json);
  } catch (error) {
    logError('doGet', error);
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

// POSTリクエスト（データ保存・削除用）
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    return handlePostRequest(params);
  } catch (error) {
    logError('doPost', error);
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

// 保存・削除の共通処理
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
  
  // 画像の処理 (Base64 -> Google Drive URL)
  if (member.images && member.images.length > 0) {
    member.images = member.images.map(img => {
      if (typeof img === 'string' && img.startsWith('http')) return img;
      return uploadToDrive(img, member.name);
    }).filter(Boolean).join(',');
  } else {
    member.images = member.images || '';
  }

  let rowIndex = rows.findIndex(r => String(r[0]) === String(member.id));
  
  const newRow = headers.map(h => {
    if (h === 'created_at' && !member[h]) return new Date();
    if (h === 'id' && !member[h]) return Utilities.getUuid();
    // スプレッドシート側のヘッダー名と一致するデータを格納
    return member[h] !== undefined ? member[h] : '';
  });

  if (rowIndex > -1) {
    sheet.getRange(rowIndex + 2, 1, 1, headers.length).setValues([newRow]);
  } else {
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

// 共通レスポンス生成 (CORS対策)
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// シート取得
function getTargetSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Sheet not found: ' + SHEET_NAME);
  return sheet;
}

// 画像アップロード
function uploadToDrive(base64Data, itemName) {
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const contentType = base64Data.substring(base64Data.indexOf(":") + 1, base64Data.indexOf(";"));
    const bytes = Utilities.base64Decode(base64Data.split(",")[1]);
    const blob = Utilities.newBlob(bytes, contentType, itemName + "_" + Date.now());
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return "https://drive.google.com/uc?export=view&id=" + file.getId();
  } catch (e) {
    logError('uploadToDrive', e);
    return null;
  }
}

// エラーログ記録シートへの自動記録
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
