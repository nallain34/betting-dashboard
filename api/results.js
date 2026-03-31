const { readRange } = require('./_sheets');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Daily Results_L30: row 1=L7, row 2=L30, row 3=All Time
    // Cols: A=label, B=outstanding_bets, C=outstanding_wagered, D=settled_bets,
    //   E=settled_wagered, F=pl, G=roi, H=wlv_string, I=win_pct, J=won, K=lost, L=void
    const raw = await readRange("'Daily Results_L30'!A1:L3");
    const fmt = await readRange("'Daily Results_L30'!A1:L3", { formatted: true });

    // Debug: log raw rows from sheet
    console.log('DEBUG results raw row 1 (L7):', JSON.stringify(raw[0]));
    console.log('DEBUG results raw row 2 (L30):', JSON.stringify(raw[1]));
    console.log('DEBUG results raw row 3 (AllTime):', JSON.stringify(raw[2]));
    console.log('DEBUG results fmt row 1 (L7):', JSON.stringify(fmt[0]));
    console.log('DEBUG results fmt row 2 (L30):', JSON.stringify(fmt[1]));
    console.log('DEBUG results fmt row 3 (AllTime):', JSON.stringify(fmt[2]));

    const labels = ['l7', 'l30', 'allTime'];
    const result = {};

    labels.forEach((label, i) => {
      const r = raw[i] || [];
      const f = fmt[i] || [];
      result[label] = {
        label: r[0] ?? '',
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
        // Formatted strings exactly as they appear in the sheet
        fmt: {
          outstanding_bets: f[1] ?? '0',
          outstanding_wagered: f[2] ?? '$0',
          settled_bets: f[3] ?? '0',
          settled_wagered: f[4] ?? '$0',
          pl: f[5] ?? '$0',
          roi: f[6] ?? '0%',
          wlv_string: f[7] ?? '0-0-0',
          win_pct: f[8] ?? '0%',
        },
      };
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('results error:', err);
    res.status(500).json({ error: err.message });
  }
};
