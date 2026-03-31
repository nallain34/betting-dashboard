const { readRange } = require('./_sheets');

// A row is "open" if the result column is missing, undefined, null, or empty string
function isOpen(row, resultIndex) {
  if (!row || row.length <= resultIndex) return true;
  const val = row[resultIndex];
  return val === undefined || val === null || val === '';
}

// Check if a row has any meaningful data
function hasData(row) {
  if (!row || !row.length) return false;
  return row.some(cell => cell !== undefined && cell !== null && cell !== '');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Straights: cols A-AB (28 cols), result in col W (index 22, 0-based)
    // 2 header rows, data starts at sheet row 3
    const straightRows = await readRange("'Straights'!A3:AB");
    const straights = [];
    for (let i = 0; i < straightRows.length; i++) {
      const r = straightRows[i];
      if (!hasData(r)) continue;
      if (isOpen(r, 22)) {
        straights.push({
          tab: 'Straights',
          rowIndex: i + 3,
          date: r[3] ?? '',
          time: r[4] ?? '',
          league: r[5] ?? '',
          bet: r[10] ?? '',
          book: r[19] ?? '',
          wager: r[20] ?? '',
          odds: r[21] ?? '',
          allFields: r,
        });
      }
    }

    // Parlays/Other: cols A-Y (25 cols), result in col T (index 19, 0-based)
    // 2 header rows, data starts at sheet row 3
    const parlayRows = await readRange("'Parlays/Other'!A3:Y");
    const parlays = [];
    for (let i = 0; i < parlayRows.length; i++) {
      const r = parlayRows[i];
      if (!hasData(r)) continue;
      if (isOpen(r, 19)) {
        parlays.push({
          tab: 'Parlays/Other',
          rowIndex: i + 3,
          date: r[3] ?? '',
          league: r[5] ?? '',
          playType: r[6] ?? '',
          bet: r[7] ?? '',
          book: r[16] ?? '',
          wager: r[17] ?? '',
          odds: r[18] ?? '',
          allFields: r,
        });
      }
    }

    res.status(200).json({ straights, parlays });
  } catch (err) {
    console.error('open-bets error:', err);
    res.status(500).json({ error: err.message });
  }
};
