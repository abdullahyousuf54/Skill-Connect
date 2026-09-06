import { env } from 'cloudflare:workers';
import { defaultProfile, opportunities, programs } from './domain';
export function ownerOf(req: Request) {
  if (import.meta.env.DEV) {
    const testOwner = req.headers.get('x-skillconnect-test-owner');
    if (testOwner?.startsWith('test-') && testOwner.length < 100)
      return testOwner;
  }
  const owner = req.headers.get('oai-authenticated-user-id');
  if (owner) return owner;
  if (import.meta.env.DEV) return 'local-demo';
  throw new Error('Sign in to access your demo workspace.');
}
export function database() {
  return env.DB;
}
export async function initialize() {
  await database()
    .prepare(
      'CREATE TABLE IF NOT EXISTS records (owner TEXT NOT NULL, kind TEXT NOT NULL, id TEXT NOT NULL, payload TEXT NOT NULL, PRIMARY KEY(owner,kind,id))',
    )
    .run();
}
export async function list(owner: string, kind: string) {
  const r = await database()
    .prepare('SELECT id,payload FROM records WHERE owner=? AND kind=?')
    .bind(owner, kind)
    .all<{ id: string; payload: string }>();
  return r.results.map((r) => ({ ...JSON.parse(r.payload), id: r.id }));
}
export async function get(owner: string, kind: string, id: string) {
  const r = await database()
    .prepare('SELECT payload FROM records WHERE owner=? AND kind=? AND id=?')
    .bind(owner, kind, id)
    .first<{ payload: string }>();
  return r ? { ...JSON.parse(r.payload), id } : null;
}
export async function put(
  owner: string,
  kind: string,
  id: string,
  value: unknown,
) {
  await database()
    .prepare(
      'INSERT INTO records(owner,kind,id,payload) VALUES(?,?,?,?) ON CONFLICT(owner,kind,id) DO UPDATE SET payload=excluded.payload',
    )
    .bind(owner, kind, id, JSON.stringify(value))
    .run();
}
export async function state(owner: string) {
  const [
    profiles,
    custom,
    applications,
    portfolio,
    enrollments,
    customPrograms,
    approvals,
  ] = await Promise.all(
    [
      'profile',
      'opportunity',
      'application',
      'portfolio',
      'enrollment',
      'program',
      'approval',
    ].map((k) => list(owner, k)),
  );
  return {
    profiles: {
      Student: profiles.find((p) => p.id === 'Student') || defaultProfile,
      Faculty: profiles.find((p) => p.id === 'Faculty') || {
        ...defaultProfile,
        name: 'Dr. Priya Sharma',
        degree: 'Faculty Â· Computer Science',
        career: 'Research & Teaching',
        skills: ['Research', 'Communication', 'Python'],
      },
    },
    opportunities: [...custom, ...opportunities].map((o) => ({
      ...o,
      approved: approvals.find((a) => a.id === o.id)?.approved ?? o.approved,
    })),
    applications,
    portfolio,
    enrollments,
    programs: [...customPrograms, ...programs],
  };
}
export function textField(value: unknown, max = 300) {
  if (typeof value !== 'string' || !value.trim() || value.length > max)
    throw new Error(
      'Please complete all required fields within the character limit.',
    );
  return value.trim();
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  if (origin && origin !== new URL(req.url).origin)
    throw new Error('Cross-origin request rejected.');
}
