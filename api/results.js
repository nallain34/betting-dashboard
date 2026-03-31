const { readRange } = require('./_sheets');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Daily Results_L30: row 1=L7, row 2=L30, row 3=All Time, rows 5+ daily
    // Cols: A=date, B=outstanding_bets, C=outstanding_wagered, D=settled_bets,
    //   E=settled_wagered, F=pl, G=roi, H=wlv_string, I=win_pct, J=won, K=lost, L=void
    const rows = await readRange("'Daily Results_L30'!A1:L3");

    const labels = ['l7', 'l30', 'allTime'];
    const result = {};

    labels.forEach((label, i) => {
      const r = rows[i] || [];
      result[label] = {
        date: r[0] ?? '',
        outstanding_bets: r[1] ?? 0,
        outstanding_wagered: r[2] ?? 0,
        settled_bets: r[3] ?? 0,
        settled_wagered: r[4] ?? 0,
        pl: r[5] ?? 0,
        roi: r[6] ?? 0,
        wlv_string: r[7] ?? '0-0-0',
        win_pct: r[8] ?? 0,
        won: r[9] ?? 0,
        lost: r[10] ?? 0,
        void: r[11] ?? 0,
      };
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('results error:', err);
    res.status(500).json({ error: err.message });
  }
};
