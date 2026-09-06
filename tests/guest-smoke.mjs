import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
async function start(cookie) {
  const r = await fetch(base + '/api/portal', {
    headers: cookie ? { Cookie: cookie } : {},
    redirect: 'manual',
  });
  assert.equal(
    r.status,
    200,
    'Anonymous portal must load without a sign-in redirect',
  );
  const setCookie = r.headers.get('set-cookie');
  if (!cookie || !/^skillconnect_guest=[a-f0-9]{64}$/.test(cookie)) {
    assert.match(setCookie || '', /skillconnect_guest=[a-f0-9]{64}/);
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /SameSite=Lax/);
    if (base.startsWith('https:')) assert.match(setCookie, /Secure/);
  } else assert.equal(setCookie, null, 'Existing session must be retained');
  return { cookie: setCookie ? setCookie.split(';')[0] : cookie, state: await r.json() };
}
const a = await start();
const b = await start();
assert.notEqual(a.cookie, b.cookie);
assert.equal(a.state.applications.length, 0);
let r = await fetch(base + '/api/portal', {
  method: 'POST',
  headers: {
    Cookie: a.cookie,
    'Content-Type': 'application/json',
    Origin: base,
  },
  body: JSON.stringify({
    action: 'apply',
    role: 'Student',
    id: 'nexa-frontend',
  }),
});
assert.equal(r.status, 200, await r.clone().text());
assert.equal((await start(a.cookie)).state.applications.length, 1);
assert.equal((await start(b.cookie)).state.applications.length, 0);
r = await fetch(base + '/api/portal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'apply',
    role: 'Student',
    id: 'nexa-frontend',
  }),
});
assert.equal(r.status, 400, 'Writes without a guest session must fail');
const malformed = await start('skillconnect_guest=local-demo');
assert.equal(malformed.state.applications.length, 0);
r = await fetch(base + '/', { redirect: 'manual' });
assert.equal(r.status, 200, 'Homepage must be public');
console.log(
  'PASS: anonymous homepage/API, guest cookie security, saved application, reload persistence, isolated visitors, missing-session rejection, invalid-cookie isolation.',
);
