import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const identity = 'test-' + crypto.randomUUID();
const headers = {
  'Content-Type': 'application/json',
  'x-skillconnect-test-owner': identity,
};
async function read(h = headers) {
  const r = await fetch(base + '/api/portal', { headers: h });
  assert.equal(r.status, 200);
  return r.json();
}
async function post(action, role, body = {}, status = 200) {
  const r = await fetch(base + '/api/portal', {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, role, ...body }),
  });
  const d = await r.json();
  assert.equal(r.status, status, JSON.stringify(d));
  return d;
}
let d = await read();
assert.equal(d.opportunities.length, 9);
assert.equal(d.applications.length, 0);
await post('assessment', 'Student', { answers: [0] }, 400);
d = (
  await post('assessment', 'Student', {
    answers: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2],
  })
).state;
assert.equal(d.profiles.Student.assessment.score, 100);
await post('profile', 'Student', {
  name: 'Test Learner',
  institution: 'Test Institute',
  degree: 'B.Tech',
  year: '2027',
  career: 'Web Development',
  skills: ['HTML', 'CSS', 'JavaScript'],
  bio: 'Integration test profile.',
});
d = (await post('apply', 'Student', { id: 'nexa-frontend' })).state;
assert.equal(d.applications.length, 1);
assert.equal(d.applications[0].match, 75);
d = (await post('apply', 'Student', { id: 'nexa-frontend' })).state;
assert.equal(d.applications.length, 1);
const application = d.applications[0].id;
await post('status', 'Student', { id: application, status: 'Selected' }, 400);
d = (
  await post('status', 'Industry', {
    id: application,
    status: 'Shortlisted',
    feedback: 'Portfolio reviewed.',
  })
).state;
assert.equal(d.applications[0].status, 'Shortlisted');
await post('apply', 'Student', { id: 'faculty-fdp' }, 400);
d = (await post('apply', 'Faculty', { id: 'faculty-fdp' })).state;
assert.equal(d.applications.length, 2);
d = (
  await post('opportunity', 'Industry', {
    title: 'Integration test internship',
    company: 'Test company',
    location: 'Remote',
    pay: 'Test',
    duration: '4 weeks',
    description: 'Integration test listing',
    skills: ['React'],
    audience: 'Student',
    type: 'Internship',
    deadline: '2026-12-31',
  })
).state;
const listing = d.opportunities.find(
  (o) => o.title === 'Integration test internship',
);
assert.equal(listing.approved, false);
await post('apply', 'Student', { id: listing.id }, 400);
await post('approve', 'Industry', { id: listing.id, approved: true }, 400);
await post('approve', 'Institution', { id: listing.id, approved: true });
await post('apply', 'Student', { id: listing.id });
await post(
  'portfolio',
  'Student',
  {
    title: 'Bad URL',
    type: 'Project',
    description: 'test',
    url: 'javascript:alert(1)',
  },
  400,
);
d = (
  await post('portfolio', 'Student', {
    title: 'Test project',
    type: 'Project',
    description: 'A tested project',
    url: 'https://example.com',
  })
).state;
const portfolio = d.portfolio[0].id;
await post('verify', 'Student', { id: portfolio, verified: true }, 400);
d = (await post('verify', 'Faculty', { id: portfolio, verified: true })).state;
assert.equal(d.portfolio[0].verified, true);
await post('enroll', 'Student', { id: 'react', completed: false });
d = (await post('enroll', 'Student', { id: 'react', completed: true })).state;
assert.equal(d.enrollments[0].completed, true);
const form = new FormData();
form.set('role', 'Student');
form.set(
  'file',
  new Blob(
    [
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1EAAAAASUVORK5CYII=',
        'base64',
      ),
    ],
    { type: 'image/png' },
  ),
  'test.png',
);
let r = await fetch(base + '/api/files', {
  method: 'POST',
  headers: { 'x-skillconnect-test-owner': identity },
  body: form,
});
assert.equal(r.status, 200, await r.text());
d = await read();
const file = d.portfolio.find((p) => p.type === 'Document');
assert.ok(file);
r = await fetch(base + '/api/files?id=' + file.id, { headers });
assert.equal(r.status, 200);
assert.equal(r.headers.get('content-type'), 'image/png');
const otherHeaders = { 'x-skillconnect-test-owner': identity + '-other' };
const other = await read(otherHeaders);
assert.equal(other.applications.length, 0);
assert.equal(other.portfolio.length, 0);
r = await fetch(base + '/api/files?id=' + file.id, { headers: otherHeaders });
assert.equal(r.status, 404);
r = await fetch(base + '/api/portal', {
  method: 'POST',
  headers: { ...headers, Origin: 'https://untrusted.example' },
  body: JSON.stringify({
    action: 'apply',
    role: 'Student',
    id: 'nexa-frontend',
  }),
});
assert.ok([400, 403].includes(r.status));
assert.equal((await read()).applications.length, 3);
console.log(
  'PASS: assessment scoring, 75% matching, duplicate prevention, role action restrictions, approval gates, faculty applications, verification, learning progress, upload/download, workspace isolation, cross-origin rejection and persistence.',
);
