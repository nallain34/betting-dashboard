const { readRange } = require('./_sheets');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Read a wide range to see everything in the tab
    const raw = await readRange("'Daily Results_L30'!A1:M10");
    const fmt = await readRange("'Daily Results_L30'!A1:M10", { formatted: true });

    const output = raw.map((row, i) => ({
      sheetRow: i + 1,
      cellCount: row.length,
      raw: row,
      formatted: fmt[i] || [],
    }));

    res.status(200).json({ totalRows: raw.length, rows: output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
