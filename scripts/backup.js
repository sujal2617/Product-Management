// Backs up every Supabase table to backup/<date-time>/ as JSON and CSV.
// Reads EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY from .env.
const fs = require('fs');
const os = require('os');
const path = require('path');

const TABLES = ['products', 'purchases', 'users', 'app_notes'];
const PAGE_SIZE = 1000;
const ROOT = path.join(__dirname, '..');

function loadConfig() {
  process.loadEnvFile(path.join(ROOT, '.env'));
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const secrets = path.join(os.homedir(), '.dp-secrets.env');
  if (fs.existsSync(secrets)) process.loadEnvFile(secrets);
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL or a Supabase key is missing');
  }
  console.log(process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Using service role key' : 'Using anon key');
  return { url, key };
}

async function fetchTable({ url, key }, table) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const res = await fetch(`${url}/rest/v1/${table}?select=*`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Range: `${from}-${from + PAGE_SIZE - 1}`,
      },
    });
    if (!res.ok) {
      throw new Error(`${table}: HTTP ${res.status} ${await res.text()}`);
    }
    const page = await res.json();
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

function toCsv(rows) {
  if (rows.length === 0) return '';
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const cell = (value) => {
    if (value === null || value === undefined) return '';
    const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = rows.map((row) => columns.map((col) => cell(row[col])).join(','));
  return [columns.join(','), ...lines].join('\n') + '\n';
}

async function main() {
  const config = loadConfig();
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const outDir = path.join(ROOT, 'backup', stamp);
  fs.mkdirSync(outDir, { recursive: true, mode: 0o700 });

  let failed = false;
  for (const table of TABLES) {
    try {
      const rows = await fetchTable(config, table);
      if (rows.length === 0) {
        throw new Error(`${table}: 0 rows. Backup refused (RLS blocking? use the service role key)`);
      }
      fs.writeFileSync(path.join(outDir, `${table}.json`), JSON.stringify(rows, null, 2));
      fs.writeFileSync(path.join(outDir, `${table}.csv`), toCsv(rows));
      console.log(`OK   ${table}: ${rows.length} rows`);
    } catch (err) {
      failed = true;
      console.error(`FAIL ${err.message}`);
    }
  }
  console.log(`\nSaved to ${outDir}`);
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`Backup failed: ${err.message}`);
  process.exitCode = 1;
});
