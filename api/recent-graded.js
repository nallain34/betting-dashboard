const { readRange } = require('./_sheets');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const now = new Date();
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);

    const recent = [];

    // Straights: result in col W (index 22), graded date col X (index 23)
    // Date in col D (index 3)
    const straightRows = await readRange("'Straights'!A3:AB");
    if (straightRows) {
      straightRows.forEach((r, i) => {
        const result = r[22];
        if (result && r[0]) {
          // Use the date col D (index 3) to approximate recency
          // Or graded date if available in col X (index 23)
          let dateVal = r[23] || r[3];
          if (dateVal) {
            let d;
            if (typeof dateVal === 'number') {
              d = new Date((dateVal - 25569) * 86400000);
            } else {
              d = new Date(dateVal);
            }
            if (d >= twoDaysAgo) {
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
                result: result,
                allFields: r,
              });
            }
          }
        }
      });
    }

    // Parlays: result in col T (index 19), date in col D (index 3)
    const parlayRows = await readRange("'ParlaysOther'!A3:Y");
    if (parlayRows) {
      parlayRows.forEach((r, i) => {
        const result = r[19];
        if (result && r[0]) {
          let dateVal = r[20] || r[3]; // graded date or event date
          if (dateVal) {
            let d;
            if (typeof dateVal === 'number') {
              d = new Date((dateVal - 25569) * 86400000);
            } else {
              d = new Date(dateVal);
            }
            if (d >= twoDaysAgo) {
              recent.push({
                tab: 'ParlaysOther',
                rowIndex: i + 3,
                date: r[3] ?? '',
                league: r[5] ?? '',
                playType: r[6] ?? '',
                bet: r[7] ?? '',
                book: r[16] ?? '',
                wager: r[17] ?? '',
                odds: r[18] ?? '',
                result: result,
                allFields: r,
              });
            }
          }
        }
      });
    }

    res.status(200).json({ recent });
  } catch (err) {
    console.error('recent-graded error:', err);
    res.status(500).json({ error: err.message });
  }
};
