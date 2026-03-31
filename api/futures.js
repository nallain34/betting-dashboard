const { readRange } = require('./_sheets');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Futures: cols A-W (23 cols), result in col R (index 17), settle date in col D (index 3)
    // Data starts row 3
    const rows = await readRange("'Futures'!A3:W");
    const open = [];
    let pl6m = 0, wins = 0, losses = 0, voids = 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (rows) {
      rows.forEach((r, i) => {
        const result = r[17];
        if (!result && result !== 0 && r.length > 0 && r[0]) {
          open.push({
            tab: 'Futures',
            rowIndex: i + 3,
            settleDate: r[3] ?? '',  // D
            league: r[4] ?? '',      // E
            bet: r[5] ?? '',         // F
            book: r[14] ?? '',       // O
            wager: r[15] ?? '',      // P
            odds: r[16] ?? '',       // Q
            allFields: r,
          });
        } else if (result) {
          // Check if settled in last 6 months for summary
          let settleDate = r[3];
          if (settleDate) {
            // Handle serial date numbers from Sheets
            let d;
            if (typeof settleDate === 'number') {
              d = new Date((settleDate - 25569) * 86400000);
            } else {
              d = new Date(settleDate);
            }
            if (d >= sixMonthsAgo) {
              const res = String(result).toLowerCase();
              if (res === 'won' || res === 'win' || res === 'w') {
                wins++;
                pl6m += parseFloat(r[21] || r[20] || 0); // net or wager
              } else if (res === 'lost' || res === 'loss' || res === 'l') {
                losses++;
                pl6m -= parseFloat(r[15] || 0); // wager
              } else if (res === 'void' || res === 'push' || res === 'v' || res === 'p') {
                voids++;
              }
            }
          }
        }
      });
    }

    res.status(200).json({
      open,
      summary: {
        pl: pl6m,
        record: `${wins}-${losses}-${voids}`,
      },
    });
  } catch (err) {
    console.error('futures error:', err);
    res.status(500).json({ error: err.message });
  }
};
