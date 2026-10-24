// Approve a user: set the Firebase claim role=authenticated and upsert their users row.
//   node scripts/approve-user.js <email> [--admin] [--name "Name"] [--phone 9999999999]
//   node scripts/approve-user.js --all-existing
// Env (or ~/.dp-secrets.env): FIREBASE_SERVICE_ACCOUNT (path to JSON key),
// SUPABASE_SERVICE_ROLE_KEY, EXPO_PUBLIC_SUPABASE_URL (read from repo .env if missing).
const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline/promises');
const admin = require('firebase-admin');

for (const file of [path.join(os.homedir(), '.dp-secrets.env'), path.join(__dirname, '..', '.env')]) {
  if (fs.existsSync(file)) process.loadEnvFile(file);
}

function need(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set (put it in ~/.dp-secrets.env)`);
  return value;
}

async function rest(method, table, query, body) {
  const url = need('EXPO_PUBLIC_SUPABASE_URL');
  const key = need('SUPABASE_SERVICE_ROLE_KEY');
  const res = await fetch(`${url}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${table}: HTTP ${res.status} ${await res.text()}`);
  return method === 'GET' ? res.json() : null;
}

function setClaim(uid) {
  return admin.auth().setCustomUserClaims(uid, { role: 'authenticated' });
}

async function allExisting() {
  const rows = await rest('GET', 'users', '?select=id,email,role');
  if (rows.length === 0) throw new Error('users table returned 0 rows; refusing to continue');
  for (const row of rows) {
    await setClaim(row.id);
    console.log(`claim set: ${row.email} (${row.id}) role=${row.role}`);
  }
  console.log(`Done: ${rows.length} users. They must log in again (or wait for token refresh).`);
}

function flag(args, name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

async function ask(rl, label, given) {
  if (given) return given;
  const answer = (await rl.question(`${label}: `)).trim();
  if (!answer) throw new Error(`${label} is required`);
  return answer;
}

async function approveOne(args) {
  const skip = [flag(args, '--name'), flag(args, '--phone')];
  const email = args.find((a) => !a.startsWith('--') && !skip.includes(a));
  if (!email) throw new Error('Usage: node scripts/approve-user.js <email> [--admin] [--name N] [--phone P]');
  const user = await admin.auth().getUserByEmail(email.toLowerCase());
  const role = args.includes('--admin') ? 'admin' : 'user';
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const name = await ask(rl, 'Name', flag(args, '--name') || user.displayName);
    const phone = await ask(rl, 'Phone (digits only)', flag(args, '--phone'));
    if (!/^[0-9]+$/.test(phone)) throw new Error('Phone must be digits only');
    await setClaim(user.uid);
    await rest('POST', 'users', '?on_conflict=id', {
      id: user.uid,
      name,
      phone,
      email: email.toLowerCase(),
      role,
    });
    console.log(`Approved ${email} (${user.uid}) as ${role}.`);
  } finally {
    rl.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const keyPath = need('FIREBASE_SERVICE_ACCOUNT');
  admin.initializeApp({ credential: admin.credential.cert(require(path.resolve(keyPath))) });
  if (args.includes('--all-existing')) await allExisting();
  else await approveOne(args);
}

main().catch((err) => {
  console.error(`Failed: ${err.message}`);
  process.exitCode = 1;
});
