import {
  state,
  ownerOf,
  initialize,
  put,
  get,
  textField,
  sameOrigin,
  database,
} from '@/lib/server';
import { careers, skills, roles, questions, matchSkills } from '@/lib/domain';
export async function GET(req: Request) {
  try {
    const owner = ownerOf(req);
    await initialize();
    return Response.json(await state(owner), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 401 });
  }
}
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const owner = ownerOf(req);
    await initialize();
    const b = (await req.json()) as Record<string, any>;
    if (!b || typeof b !== 'object') throw new Error('Invalid request.');
    if (!roles.includes(b.role)) throw new Error('Choose a valid portal.');
    const current = await state(owner);
    const profile =
      current.profiles[b.role === 'Faculty' ? 'Faculty' : 'Student'];
    const only = (allowed: string[]) => {
      if (!allowed.includes(b.role))
        throw new Error('This action is not available in this portal.');
    };
    let result: any = {};
    switch (b.action) {
      case 'profile': {
        only(['Student', 'Faculty']);
        if (
          !Object.keys(careers).includes(b.career) ||
          !Array.isArray(b.skills) ||
          b.skills.some((s: string) => !skills.includes(s))
        )
          throw new Error('Invalid career or skills.');
        await put(owner, 'profile', b.role, {
          ...profile,
          name: textField(b.name, 100),
          institution: textField(b.institution, 150),
          degree: textField(b.degree, 120),
          year: textField(b.year, 30),
          bio: textField(b.bio, 1000),
          career: b.career,
          skills: [...new Set(b.skills)],
        });
        break;
      }
      case 'assessment': {
        only(['Student', 'Faculty']);
        const key = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2];
        if (
          !Array.isArray(b.answers) ||
          b.answers.length !== key.length ||
          b.answers.some((a: unknown) => ![0, 1, 2].includes(a as number))
        )
          throw new Error('Answer all 12 questions.');
        const earned = questions
          .filter((_, i) => b.answers[i] === key[i])
          .map((q) => q.skill);
        result = {
          score: Math.round((earned.length / key.length) * 100),
          skills: earned,
          date: new Date().toISOString(),
        };
        await put(owner, 'profile', b.role, {
          ...profile,
          skills: earned,
          assessment: result,
        });
        break;
      }
      case 'apply': {
        only(['Student', 'Faculty']);
        const o = current.opportunities.find((o) => o.id === b.id);
        if (!o || !o.approved || o.audience !== b.role)
          throw new Error(
            'This opportunity is not available for this profile.',
          );
        if (o.deadline < new Date().toISOString().slice(0, 10))
          throw new Error('The application deadline has passed.');
        const id = b.role + '-' + o.id;
        await database()
          .prepare(
            'INSERT OR IGNORE INTO records(owner,kind,id,payload) VALUES(?,?,?,?)',
          )
          .bind(
            owner,
            'application',
            id,
            JSON.stringify({
              opportunityId: o.id,
              role: b.role,
              name: profile.name,
              status: 'Applied',
              date: new Date().toISOString(),
              match: matchSkills(profile.skills, o.skills).score,
              feedback: '',
              progress: 0,
            }),
          )
          .run();
        break;
      }
      case 'status': {
        only(['Industry', 'Institution']);
        if (
          ![
            'Applied',
            'Shortlisted',
            'Interview',
            'Selected',
            'In progress',
            'Completed',
            'Rejected',
          ].includes(b.status)
        )
          throw new Error('Invalid status.');
        const a = await get(owner, 'application', b.id);
        if (!a) throw new Error('Application not found.');
        await put(owner, 'application', b.id, {
          ...a,
          status: b.status,
          progress:
            b.status === 'Completed'
              ? 100
              : b.status === 'In progress'
                ? 50
                : a.progress,
          feedback:
            typeof b.feedback === 'string'
              ? b.feedback.slice(0, 1000)
              : a.feedback,
        });
        break;
      }
      case 'opportunity': {
        only(['Industry']);
        if (
          !['Student', 'Faculty'].includes(b.audience) ||
          ![
            'Internship',
            'Job',
            'Apprenticeship',
            'Live Project',
            'Faculty Internship',
            'FDP',
            'Industrial Training',
            'Research',
            'Consultancy',
          ].includes(b.type)
        )
          throw new Error('Invalid opportunity type.');
        if (
          !Array.isArray(b.skills) ||
          !b.skills.length ||
          b.skills.some((s: string) => !skills.includes(s))
        )
          throw new Error('Select at least one skill.');
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(b.deadline) ||
          b.deadline < new Date().toISOString().slice(0, 10)
        )
          throw new Error('Set a future deadline.');
        await put(owner, 'opportunity', crypto.randomUUID(), {
          title: textField(b.title, 150),
          company: textField(b.company, 100),
          location: textField(b.location, 150),
          pay: textField(b.pay, 100),
          duration: textField(b.duration, 100),
          description: textField(b.description, 2000),
          skills: b.skills,
          type: b.type,
          audience: b.audience,
          deadline: b.deadline,
          approved: false,
          demo: false,
        });
        break;
      }
      case 'approve': {
        only(['Institution']);
        if (!current.opportunities.some((o) => o.id === b.id))
          throw new Error('Opportunity not found.');
        await put(owner, 'approval', b.id, { approved: b.approved === true });
        break;
      }
      case 'portfolio': {
        only(['Student', 'Faculty']);
        if (
          !['Project', 'Certificate', 'Internship', 'Achievement'].includes(
            b.type,
          )
        )
          throw new Error('Invalid portfolio type.');
        const url = typeof b.url === 'string' ? b.url.trim() : '';
        if (url && !/^https?:\/\//i.test(url))
          throw new Error('Use an http or https link.');
        await put(owner, 'portfolio', crypto.randomUUID(), {
          role: b.role,
          title: textField(b.title, 150),
          type: b.type,
          description: textField(b.description, 1000),
          url,
          verified: false,
          date: new Date().toISOString(),
        });
        break;
      }
      case 'verify': {
        only(['Faculty', 'Institution']);
        const p = await get(owner, 'portfolio', b.id);
        if (!p || (p.role === 'Faculty' && b.role !== 'Institution'))
          throw new Error('This record needs institution review.');
        await put(owner, 'portfolio', b.id, {
          ...p,
          verified: b.verified === true,
          verifiedBy: b.role,
        });
        break;
      }
      case 'enroll': {
        only(['Student', 'Faculty']);
        if (!current.programs.some((p) => p.id === b.id))
          throw new Error('Program not found.');
        await put(owner, 'enrollment', b.role + '-' + b.id, {
          role: b.role,
          programId: b.id,
          completed: b.completed === true,
        });
        break;
      }
      case 'program': {
        only(['Industry']);
        if (
          !skills.includes(b.skill) ||
          ![
            'Learning path',
            'Certification',
            'Mentorship',
            'Workshop',
            'Guest lecture',
          ].includes(b.kind)
        )
          throw new Error('Invalid program.');
        const url = typeof b.url === 'string' ? b.url.trim() : '';
        if (url && !/^https?:\/\//i.test(url))
          throw new Error('Use an http or https link.');
        await put(owner, 'program', crypto.randomUUID(), {
          title: textField(b.title, 150),
          provider: textField(b.provider, 100),
          skill: b.skill,
          kind: b.kind,
          duration: textField(b.duration, 100),
          url,
        });
        break;
      }
      default:
        throw new Error('Unknown action.');
    }
    return Response.json({ ok: true, result, state: await state(owner) });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
