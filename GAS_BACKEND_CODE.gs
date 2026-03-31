/**
 * 豊南中2000年卒ポータル - Backend GAS Script
 * 
 * [セットアップ手順]
 * 1. スプレッドシートを作成し、1行目に以下のヘッダーを入力します：
 *    id, name, job, category, short_desc, detail, images, company, contact, sns_link, map_url, created_at
 * 2. 拡張機能 > Apps Script を開き、このコードを貼り付けます。
 * 3. 上部の「デプロイ」>「新しいデプロイ」をクリック。
 * 4. 種類を「ウェブアプリ」に選択。
 * 5. アクセスできるユーザーを「全員」にしてデプロイ。
 * 6. 発行されたURLを React の src/services/api.js に貼り付けます。
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const SHEET_NAME = 'シート1'; // シート名に合わせて変更してください
const DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID_HERE'; // 画像を保存するフォルダID

function doGet(e) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  
  const json = data.map(row => {
    let obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });
  
  return ContentService.createTextOutput(JSON.stringify(json))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const action = params.action;
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  
  if (action === 'save') {
    return handleSave(params.data, sheet);
  } else if (action === 'delete') {
    return handleDelete(params.id, sheet);
  }
}

function handleSave(member, sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  // 画像の処理 (Base64 -> Google Drive URL)
  if (member.images && member.images.length > 0) {
    member.images = member.images.map(img => {
      // 既にURL（http）の場合はそのまま
      if (typeof img === 'string' && img.startsWith('http')) return img;
      // Base64の場合のみアップロード
      return uploadToDrive(img, member.name);
    }).filter(Boolean).join(',');
  } else {
    member.images = '';
  }

  let rowIndex = rows.findIndex(r => String(r[0]) === String(member.id));
  
  const newRow = headers.map(h => {
    if (h === 'created_at' && !member[h]) return new Date();
    if (h === 'id' && !member[h]) return Utilities.getUuid();
    return member[h] || '';
  });

  if (rowIndex > -1) {
    // 更新
    sheet.getRange(rowIndex + 2, 1, 1, headers.length).setValues([newRow]);
  } else {
    // 新規追加
    sheet.appendRow(newRow);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: member }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleDelete(id, sheet) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function uploadToDrive(base64Data, itemName) {
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const contentType = base64Data.substring(base64Data.indexOf(":") + 1, base64Data.indexOf(";"));
    const bytes = Utilities.base64Decode(base64Data.split(",")[1]);
    const blob = Utilities.newBlob(bytes, contentType, itemName + "_" + Date.now());
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // 直リンク形式のURLを生成
    return "https://drive.google.com/uc?export=view&id=" + file.getId();
  } catch (e) {
    return null;
  }
}
