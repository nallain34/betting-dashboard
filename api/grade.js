const { writeCell } = require('./_sheets');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { tab, rowIndex, result, settleDate } = req.body;

    if (!tab || !rowIndex || !result) {
      return res.status(400).json({ error: 'Missing required fields: tab, rowIndex, result' });
    }

    // Determine result column based on tab
    let resultCol;
    if (tab === 'Straights') {
      resultCol = 'W'; // col 23 (1-indexed)
    } else if (tab === 'ParlaysOther') {
      resultCol = 'T'; // col 20 (1-indexed)
    } else if (tab === 'Futures') {
      resultCol = 'R'; // col 18 (1-indexed)
    } else {
      return res.status(400).json({ error: 'Invalid tab' });
    }

    // Write result
    await writeCell(`'${tab}'!${resultCol}${rowIndex}`, result);

    // Write settle date for futures if provided
    if (tab === 'Futures' && settleDate) {
      await writeCell(`'${tab}'!D${rowIndex}`, settleDate);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('grade error:', err);
    res.status(500).json({ error: err.message });
  }
};
