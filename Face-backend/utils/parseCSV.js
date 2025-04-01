const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');

async function parseCSVAndHash(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', async (row) => {
        if (!row.username || !row.password || !row.fullName) return;

        const hashed = await bcrypt.hash(row.password, 10);

        results.push({
          studentId: row.username.trim(),
          password: hashed,
          fullName: row.fullName.trim(),
          role: row.role || 'student',
        });
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

module.exports = { parseCSVAndHash };
