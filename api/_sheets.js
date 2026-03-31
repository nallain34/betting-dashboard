const { google } = require('googleapis');

let _sheets = null;
let _sheetId = null;

function getSheets() {
  if (_sheets) return { sheets: _sheets, sheetId: _sheetId };

  const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  _sheetId = process.env.SHEET_ID;

  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  _sheets = google.sheets({ version: 'v4', auth });
  return { sheets: _sheets, sheetId: _sheetId };
}

async function readRange(range, { formatted = false } = {}) {
  const { sheets, sheetId } = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
    valueRenderOption: formatted ? 'FORMATTED_VALUE' : 'UNFORMATTED_VALUE',
  });
  return res.data.values || [];
}

async function writeCell(range, value) {
  const { sheets, sheetId } = getSheets();
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[value]] },
  });
}

module.exports = { getSheets, readRange, writeCell };
