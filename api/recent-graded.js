const { readRange } = require('./_sheets');

function isOpen(row, resultIndex) {
  if (!row || row.length <= resultIndex) return true;
  const val = row[resultIndex];
  return val === undefined || val === null || val === '';
}

function hasData(row) {
  if (!row || !row.length) return false;
  return row.some(cell => cell !== undefined && cell !== null && cell !== '');
}

function parseDate(val) {
  if (!val && val !== 0) return null;
  if (typeof val === 'number') {
    return new Date((val - 25569) * 86400000);
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const now = new Date();
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);

    const recent = [];

    // Straights: result col W (index 22), graded date col X (index 23), event date col D (index 3)
    // 2 header rows, data starts at sheet row 3
    const straightRows = await readRange("'Straights'!A3:AB");
    for (let i = 0; i < straightRows.length; i++) {
      const r = straightRows[i];
      if (!hasData(r)) continue;
      if (isOpen(r, 22)) continue; // skip ungraded

      const d = parseDate(r[23]) || parseDate(r[3]);
      if (d && d >= twoDaysAgo) {
        recent.push({
          tab: 'Straights',
          rowIndex: i + 3,
          date: r[3] ?? '',
          time: r[4] ?? '',
          league: r[5] ?? '',
          bet: r[10] ?? '',
          book: r[19] ?? '',
          wager: r[20] ?? '',
          odds: r[21] ?? '',
          result: r[22],
          allFields: r,
        });
      }
    }

    // Parlays/Other: result col T (index 19), graded date col U (index 20), event date col D (index 3)
    // 2 header rows, data starts at sheet row 3
    const parlayRows = await readRange("'Parlays/Other'!A3:Y");
    for (let i = 0; i < parlayRows.length; i++) {
      const r = parlayRows[i];
      if (!hasData(r)) continue;
      if (isOpen(r, 19)) continue; // skip ungraded

      const d = parseDate(r[20]) || parseDate(r[3]);
      if (d && d >= twoDaysAgo) {
        recent.push({
          tab: 'Parlays/Other',
          rowIndex: i + 3,
          date: r[3] ?? '',
          league: r[5] ?? '',
          playType: r[6] ?? '',
          bet: r[7] ?? '',
          book: r[16] ?? '',
          wager: r[17] ?? '',
          odds: r[18] ?? '',
          result: r[19],
          allFields: r,
        });
      }
    }

    res.status(200).json({ recent });
  } catch (err) {
    console.error('recent-graded error:', err);
    res.status(500).json({ error: err.message });
  }
};
