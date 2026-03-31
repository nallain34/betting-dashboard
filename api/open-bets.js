const { readRange } = require('./_sheets');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Straights: cols A-AB (28 cols), result in col W (index 22), data starts row 3
    const straightRows = await readRange("'Straights'!A3:AB");
    const straights = [];
    if (straightRows) {
      straightRows.forEach((r, i) => {
        if (!r[22] && r[22] !== 0 && r.length > 0 && r[0]) {
          straights.push({
            tab: 'Straights',
            rowIndex: i + 3, // 1-indexed, data starts row 3
            date: r[3] ?? '',       // D
            time: r[4] ?? '',       // E
            league: r[5] ?? '',     // F
            bet: r[10] ?? '',       // K
            book: r[19] ?? '',      // T
            wager: r[20] ?? '',     // U
            odds: r[21] ?? '',      // V
            allFields: r,
          });
        }
      });
    }

    // Parlays: cols A-Y (25 cols), result in col T (index 19), data starts row 3
    const parlayRows = await readRange("'ParlaysOther'!A3:Y");
    const parlays = [];
    if (parlayRows) {
      parlayRows.forEach((r, i) => {
        if (!r[19] && r[19] !== 0 && r.length > 0 && r[0]) {
          parlays.push({
            tab: 'ParlaysOther',
            rowIndex: i + 3,
            date: r[3] ?? '',       // D
            league: r[5] ?? '',     // F
            playType: r[6] ?? '',   // G
            bet: r[7] ?? '',        // H
            book: r[16] ?? '',      // Q
            wager: r[17] ?? '',     // R
            odds: r[18] ?? '',      // S
            allFields: r,
          });
        }
      });
    }

    res.status(200).json({ straights, parlays });
  } catch (err) {
    console.error('open-bets error:', err);
    res.status(500).json({ error: err.message });
  }
};
