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

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Futures: cols A-W (23 cols), result in col R (index 17, 0-based)
    // Settle date in col D (index 3). 2 header rows, data starts at sheet row 3
    const rows = await readRange("'Futures'!A3:W");
    const open = [];
    let pl6m = 0, wins = 0, losses = 0, voids = 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!hasData(r)) continue;

      if (isOpen(r, 17)) {
        open.push({
          tab: 'Futures',
          rowIndex: i + 3,
          settleDate: r[3] ?? '',
          league: r[4] ?? '',
          bet: r[5] ?? '',
          book: r[14] ?? '',
          wager: r[15] ?? '',
          odds: r[16] ?? '',
          allFields: r,
        });
      } else {
        // Settled — check if within last 6 months for summary
        const result = r[17];
        let settleDate = r[3];
        if (settleDate) {
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
              pl6m += parseFloat(r[21] || r[20] || 0);
            } else if (res === 'lost' || res === 'loss' || res === 'l') {
              losses++;
              pl6m -= parseFloat(r[15] || 0);
            } else if (res === 'void' || res === 'push' || res === 'v' || res === 'p') {
              voids++;
            }
          }
        }
      }
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
