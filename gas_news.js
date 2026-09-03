/**
 * 篠田ぶどう園 お知らせ連携スクリプト
 * Google Apps Script (GAS) に貼り付けて使用します。
 *
 * ========== スプレッドシートの列構成 ==========
 *   A列：日付　例）2025/08/01
 *   B列：タグ　例）直売情報 / お知らせ / Instagram
 *   C列：内容　例）今年の直売を開始しました。
 *   ※ 1行目はヘッダー行（読み飛ばします）
 *   ※ 新しいお知らせは上の行に追加してください（新着が上に来ます）
 *
 * ========== 設定手順 ==========
 * 1. Googleスプレッドシートを開く
 * 2. メニュー「拡張機能」→「Apps Script」を開く
 * 3. このファイルの内容を全コピーして貼り付ける
 * 4. SHEET_ID を自分のスプレッドシートIDに書き換える
 *    （スプレッドシートのURLの /d/〇〇〇/edit の〇〇〇の部分）
 * 5. 「デプロイ」→「新しいデプロイ」→ 種類：ウェブアプリ
 *    ・次のユーザーとして実行：自分
 *    ・アクセスできるユーザー：全員
 * 6. 表示されたウェブアプリURLをコピーする
 * 7. index.html の GAS_URL = 'YOUR_GAS_URL_HERE' に貼り付ける
 * ================================================
 */

// ▼ ここを自分のスプレッドシートIDに書き換えてください
const SHEET_ID   = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'お知らせ'; // シート名（変更した場合は合わせてください）
const MAX_ROWS   = 20;         // 表示する最大件数

function doGet() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const lastRow = sheet.getLastRow();

  // データが1行（ヘッダーのみ）または0行の場合
  if (lastRow <= 1) {
    return buildResponse([]);
  }

  // 2行目から最大 MAX_ROWS 件取得（A〜C列）
  const numRows = Math.min(lastRow - 1, MAX_ROWS);
  const values  = sheet.getRange(2, 1, numRows, 3).getValues();

  // 空行を除外し、日付・タグ・内容の配列に整形
  const data = values
    .filter(row => row[0] && row[2]) // 日付と内容が空でない行のみ
    .map(row => [
      formatDate(row[0]), // 日付
      String(row[1] || 'お知らせ').trim(), // タグ
      String(row[2]).trim()                 // 内容
    ]);

  return buildResponse(data);
}

/** Date型 or 文字列を "YYYY/MM/DD" 形式に統一 */
function formatDate(val) {
  if (val instanceof Date) {
    const y  = val.getFullYear();
    const m  = String(val.getMonth() + 1).padStart(2, '0');
    const d  = String(val.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  }
  return String(val).trim();
}

/** JSONレスポンスを生成（CORS対応） */
function buildResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
