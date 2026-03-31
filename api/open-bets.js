const { readRange } = require('./_sheets');

function isBlank(val) {
  return val === undefined || val === null || val === '';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Straights: cols A-AB (28 cols), result in col W (index 22, 0-based), data starts row 3
    const straightRows = await readRange("'Straights'!A3:AB");
    const straights = [];
    for (let i = 0; i < straightRows.length; i++) {
      const r = straightRows[i];
      if (!r || !r.length || isBlank(r[0])) continue;
      // Result is col W = index 22; if blank, bet is open
      if (isBlank(r[22])) {
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

    // Parlays/Other: cols A-Y (25 cols), result in col T (index 19, 0-based), data starts row 3
    const parlayRows = await readRange("'Parlays/Other'!A3:Y");
    const parlays = [];
    for (let i = 0; i < parlayRows.length; i++) {
      const r = parlayRows[i];
      if (!r || !r.length || isBlank(r[0])) continue;
      if (isBlank(r[19])) {
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
