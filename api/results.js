const { readRange } = require('./_sheets');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Read daily data rows starting at row 5 (skip summary rows 1-3 and header row 4)
    // Cols (0-indexed): A=date, B=outstanding_bets, C=outstanding_wagered,
    //   D=settled_bets, E=settled_wagered, F=pl, G=roi, H=wlv_string,
    //   I=win_pct, J=won, K=lost, L=void
    const rows = await readRange("'Daily Results_L30'!A5:L");

    // Filter to rows that have settled_bets > 0, keep in date order (newest first)
    const active = rows.filter(r => r && r.length >= 6 && (parseFloat(r[3]) || 0) > 0);

    function summarize(subset) {
      let settled_bets = 0, settled_wagered = 0, pl = 0, won = 0, lost = 0, voided = 0;
      for (const r of subset) {
        settled_bets += parseFloat(r[3]) || 0;
        settled_wagered += parseFloat(r[4]) || 0;
        pl += parseFloat(r[5]) || 0;
        won += parseFloat(r[9]) || 0;
        lost += parseFloat(r[10]) || 0;
        voided += parseFloat(r[11]) || 0;
      }
      const roi = settled_wagered > 0 ? pl / settled_wagered : 0;
      const total = won + lost + voided;
      const win_pct = total > 0 ? won / total : 0;
      return {
        settled_bets: Math.round(settled_bets),
        settled_wagered: Math.round(settled_wagered * 100) / 100,
        pl: Math.round(pl * 100) / 100,
        roi,
        wlv_string: `${Math.round(won)}-${Math.round(lost)}-${Math.round(voided)}`,
        win_pct,
        won: Math.round(won),
        lost: Math.round(lost),
        void: Math.round(voided),
      };
    }

    const l7 = summarize(active.slice(0, 7));
    const l30 = summarize(active.slice(0, 30));
    const allTime = summarize(active);

    res.status(200).json({ l7, l30, allTime });
  } catch (err) {
    console.error('results error:', err);
    res.status(500).json({ error: err.message });
  }
};
