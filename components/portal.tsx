'use client';
import { useEffect, useState } from 'react';
import {
  GraduationCap,
  ArrowUpRight,
  ArrowRight,
  BriefcaseBusiness,
  LayoutDashboard,
  Target,
  BookOpen,
  FileUser,
  ClipboardList,
  ShieldCheck,
  ChartNoAxesCombined,
  Plus,
  Search,
  MapPin,
  Clock,
  Check,
  Upload,
  Download,
  Leaf,
  Building2,
  Users,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  roles,
  skills,
  careers,
  questions,
  matchSkills,
  defaultProfile,
  opportunities,
  programs,
  type Role,
} from '@/lib/domain';
type Item = Record<string, any>;
const initial = {
  profiles: {
    Student: defaultProfile,
    Faculty: {
      ...defaultProfile,
      name: 'Dr. Priya Sharma',
      career: 'Research & Teaching',
      skills: ['Research', 'Communication', 'Python'],
    },
  },
  opportunities,
  programs,
  applications: [],
  portfolio: [],
  enrollments: [],
};
export default function Portal() {
  const [data, setData] = useState<Item>(initial),
    [ready, setReady] = useState(false),
    [role, setRole] = useState<Role>('Student'),
    [view, setView] = useState('Overview'),
    [query, setQuery] = useState(''),
    [filter, setFilter] = useState('All'),
    [modal, setModal] = useState(''),
    [selected, setSelected] = useState<Item | null>(null),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(''),
    [error, setError] = useState(''),
    [answers, setAnswers] = useState<number[]>(Array(12).fill(-1)),
    [draft, setDraft] = useState<Item>({});
  const learner = role === 'Student' || role === 'Faculty',
    profile = data.profiles[role === 'Faculty' ? 'Faculty' : 'Student'],
    ownApps = data.applications.filter(
      (a: Item) => !learner || a.role === role,
    ),
    ownPortfolio = data.portfolio.filter((p: Item) => p.role === role),
    gap = matchSkills(profile.skills, careers[profile.career] || []),
    pending = data.opportunities.filter((o: Item) => !o.approved);
  async function load() {
    try {
      const r = await fetch('/api/portal');
      const d = (await r.json()) as Item;
      if (!r.ok) throw Error(d.error);
      setData(d);
      setReady(true);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function act(
    action: string,
    body: Item = {},
    message = 'Saved successfully',
  ) {
    if (busy || !ready) return false;
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, role, action }),
      });
      const d = (await r.json()) as Item;
      if (!r.ok) throw Error(d.error);
      setData(d.state);
      setNotice(message);
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  function navigate(v: string) {
    setView(v);
    setQuery('');
    setFilter('All');
    setNotice('');
  }
  function open(kind: string, item?: Item) {
    setModal(kind);
    setSelected(item || null);
    setError('');
    setDraft(
      kind === 'profile'
        ? { ...profile }
        : kind === 'opportunity'
          ? {
              skills: [],
              audience: 'Student',
              type: 'Internship',
              deadline: '2026-12-31',
            }
          : kind === 'program'
            ? { kind: 'Learning path', skill: 'React' }
            : kind === 'portfolio'
              ? { type: 'Project' }
              : kind === 'status'
                ? { status: item?.status, feedback: item?.feedback }
                : {},
    );
  }
  const nav = learner
    ? [
        [LayoutDashboard, 'Overview'],
        [Target, 'My skills'],
        [BriefcaseBusiness, 'Opportunities'],
        [ClipboardList, 'My applications'],
        [BookOpen, 'Learning hub'],
        [FileUser, 'My portfolio'],
        ...(role === 'Faculty' ? [[ShieldCheck, 'Verification']] : []),
      ]
    : role === 'Industry'
      ? [
          [LayoutDashboard, 'Overview'],
          [BriefcaseBusiness, 'Opportunities'],
          [Users, 'Applicants'],
          [BookOpen, 'Learning hub'],
          [ChartNoAxesCombined, 'Analytics'],
        ]
      : [
          [LayoutDashboard, 'Overview'],
          [ShieldCheck, 'Approvals'],
          [Users, 'Applications'],
          [ShieldCheck, 'Verification'],
          [ChartNoAxesCombined, 'Analytics'],
        ];
  const relevant = data.opportunities
    .filter((o: Item) => !learner || (o.approved && o.audience === role))
    .map((o: Item) => ({ ...o, ...matchSkills(profile.skills, o.skills) }))
    .sort((a: Item, b: Item) => (b.score ?? -1) - (a.score ?? -1));
  const filtered = relevant.filter(
    (o: Item) =>
      (filter === 'All' || o.type === filter) &&
      (o.title + ' ' + o.company + ' ' + o.location + ' ' + o.skills.join(' '))
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const descriptions: Record<string, string> = {
    Overview: 'A little progress today. A world of opportunity tomorrow.',
    'My skills': 'Know your strengths. Make your next move with confidence.',
    Opportunities: 'Find the right experience for your next chapter.',
    'My applications': 'Every application, every milestone, in one place.',
    'Learning hub': 'Close a skill gap. Open a new door.',
    'My portfolio': 'Your work and achievements, together in one place.',
    Applicants: 'Help promising talent take their next step.',
    Applications: 'Follow student and faculty outcomes across the demo.',
    Approvals: 'Review opportunities before they appear to learners.',
    Verification: 'Give achievements the credibility they deserve.',
    Analytics: 'Understand readiness, participation, and skill demand.',
  };
  function cards(items: Item[]) {
    return (
      <div className="opportunity-grid">
        {items.map((o) => {
          const applied = data.applications.some(
            (a: Item) => a.opportunityId === o.id && a.role === role,
          );
          return (
            <article className="panel opportunity" key={o.id}>
              <div className="row between">
                <span className={'company-logo logo-' + (o.company.length % 3)}>
                  {o.company[0]}
                </span>
                <span className="tag">{o.type}</span>
              </div>
              <p className="muted">
                {o.company}
                {o.demo ? ' Â· Demo company' : ''}
              </p>
              <h3>{o.title}</h3>
              <p className="row muted">
                <MapPin size={12} />
                {o.location}
              </p>
              <p className="row muted">
                <Clock size={12} />
                {o.duration}
                <span className="dot">Â·</span>
                {o.pay}
              </p>
              <div className="tags">
                {o.skills.slice(0, 4).map((s: string) => (
                  <span
                    className={
                      'tag ' + (profile.skills.includes(s) ? 'owned' : '')
                    }
                    key={s}
                  >
                    {s}
                  </span>
                ))}
              </div>
              {learner && (
                <>
                  <div className="row between">
                    <span className="match">
                      {o.score === null
                        ? 'No required skills'
                        : o.score + '% skill match'}
                    </span>
                    <span className="tiny muted">
                      {o.missing.length
                        ? 'Missing ' +
                          o.missing.length +
                          ' skill' +
                          (o.missing.length > 1 ? 's' : '')
                        : 'Great fit'}
                    </span>
                  </div>
                  <Progress
                    value={o.score ?? 0}
                    aria-label="Skill compatibility"
                  />
                </>
              )}
              <div className="card-bottom">
                <span className="tiny muted">
                  {learner
                    ? applied
                      ? 'Application sent'
                      : 'Closes ' + o.deadline
                    : o.approved
                      ? 'Approved'
                      : 'Awaiting approval'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => open('detail', o)}
                >
                  View details <ArrowUpRight size={15} />
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    );
  }
  function field(
    label: string,
    key: string,
    type = 'text',
    options?: string[],
  ) {
    return (
      <label className="form-field" key={key}>
        {label}
        {options ? (
          <NativeSelect
            value={draft[key] || options[0]}
            onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
          >
            {options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </NativeSelect>
        ) : type === 'textarea' ? (
          <textarea
            required
            maxLength={key === 'description' ? 2000 : 1000}
            value={draft[key] || ''}
            onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
          />
        ) : (
          <Input
            required={key !== 'url'}
            type={type}
            maxLength={key === 'name' ? 100 : 150}
            value={draft[key] || ''}
            onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
          />
        )}
      </label>
    );
  }
  function skillPicker() {
    return (
      <div>
        <p className="form-label">Skills</p>
        <div className="tags">
          {skills.map((s) => (
            <Button
              type="button"
              size="sm"
              variant={draft.skills?.includes(s) ? 'default' : 'outline'}
              key={s}
              onClick={() =>
                setDraft({
                  ...draft,
                  skills: draft.skills?.includes(s)
                    ? draft.skills.filter((v: string) => v !== s)
                    : [...(draft.skills || []), s],
                })
              }
            >
              {draft.skills?.includes(s) && <Check size={12} />} {s}
            </Button>
          ))}
        </div>
      </div>
    );
  }
  const stats = learner
    ? [
        [
          Target,
          profile.skills.length,
          'Skills in your profile',
          'Keep your strengths up to date',
        ],
        [
          BriefcaseBusiness,
          relevant.length,
          'Open opportunities',
          'Matched to your portal',
        ],
        [
          ClipboardList,
          ownApps.length,
          'Applications sent',
          'Your next step is in motion',
        ],
        [
          ShieldCheck,
          ownPortfolio.filter((p: Item) => p.verified).length,
          'Verified achievements',
          'Build a credible portfolio',
        ],
      ]
    : [
        [
          BriefcaseBusiness,
          data.opportunities.filter((o: Item) => o.approved).length,
          'Approved opportunities',
          'Across student & faculty programs',
        ],
        [
          Users,
          data.applications.length,
          'Total applications',
          'Live demo activity',
        ],
        [
          Check,
          data.applications.filter((a: Item) =>
            ['Selected', 'In progress', 'Completed'].includes(a.status),
          ).length,
          'Successful applications',
          'Selected or progressing',
        ],
        [
          ShieldCheck,
          pending.length,
          'Awaiting approval',
          'Institution review queue',
        ],
      ];
  const statsPanel = (
    <div className="stats-grid">
      {stats.map(([Icon, value, label, sub]: any) => (
        <div className="panel stat" key={label}>
          <div className="row between">
            <span>{label}</span>
            <Icon size={17} />
          </div>
          <strong>{value}</strong>
          <p>{sub}</p>
        </div>
      ))}
    </div>
  );
  const empty = (text: string) => (
    <div className="panel empty">
      <Leaf size={30} />
      <h3>A fresh start</h3>
      <p className="muted">{text}</p>
    </div>
  );
  function applicationsTable() {
    return ownApps.length ? (
      <div className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Opportunity / applicant</th>
              <th>Applied</th>
              <th>Match at application</th>
              <th>Status</th>
              <th>Next step</th>
            </tr>
          </thead>
          <tbody>
            {ownApps.map((a: Item) => {
              const o = data.opportunities.find(
                (o: Item) => o.id === a.opportunityId,
              );
              return (
                <tr key={a.id}>
                  <td>
                    <strong>{o?.title || 'Opportunity'}</strong>
                    <small>
                      {learner ? o?.company : a.name + ' Â· ' + a.role}
                    </small>
                  </td>
                  <td>{new Date(a.date).toLocaleDateString('en-IN')}</td>
                  <td>
                    <span className="match">
                      {a.match === null ? 'Not specified' : a.match + '%'}
                    </span>
                  </td>
                  <td>
                    <span className={'tag status-' + a.status.replace(' ', '')}>
                      {a.status}
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => open(learner ? 'tracking' : 'status', a)}
                    >
                      {learner ? 'Track progress' : 'Review'}
                      <ChevronRight size={14} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    ) : (
      empty(
        learner
          ? 'Find an opportunity and send your first application.'
          : 'Apply through the Student or Faculty portal to see a candidate here.',
      )
    );
  }
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <GraduationCap />
          <span>
            skillconnect<span className="brand-dot">.</span>
          </span>
        </div>
        <p className="eyebrow">YOUR CAREER WORKSPACE</p>
        <nav>
          {nav.map(([Icon, title]: any) => (
            <button
              className={'nav-item ' + (view === title ? 'active' : '')}
              key={title}
              onClick={() => navigate(title)}
            >
              <Icon size={18} />
              {title}
              {title === 'Approvals' && pending.length > 0 && (
                <span className="nav-count">{pending.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-card">
          <Leaf size={21} />
          <h3>A future that fits you.</h3>
          <p>Turn your potential into your next opportunity.</p>
          <button onClick={() => navigate(learner ? 'My skills' : 'Analytics')}>
            Take the next step <ArrowRight size={13} />
          </button>
        </div>
        <div className="side-bottom">
          <div className="row">
            <div className="avatar">
              {learner
                ? profile.name
                    .split(' ')
                    .map((s: string) => s[0])
                    .slice(0, 2)
                    .join('')
                : role === 'Industry'
                  ? 'HR'
                  : 'IN'}
            </div>
            <div>
              <strong>
                {learner
                  ? profile.name
                  : role === 'Industry'
                    ? 'Industry workspace'
                    : 'Institution workspace'}
              </strong>
              <div className="tiny muted">
                {learner ? profile.degree : 'Demo management portal'}
              </div>
            </div>
          </div>
          <p>SMART INDIA HACKATHON 2026</p>
        </div>
      </aside>
      <div className="workspace">
        <header>
          <span>
            {role} workspace <span className="muted"> / {view}</span>
          </span>
          <div className="row">
            <span className="demo-dot" />
            <span className="tiny muted">Private demo</span>
            <NativeSelect
              aria-label="Switch demo portal"
              value={role}
              onChange={(e) => {
                setRole(e.target.value as Role);
                navigate('Overview');
                setModal('');
              }}
            >
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </NativeSelect>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                {role === 'Student'
                  ? 'YOUR NEXT CHAPTER STARTS HERE'
                  : role === 'Faculty'
                    ? 'BRING INDUSTRY INTO THE CLASSROOM'
                    : role === 'Industry'
                      ? 'CONNECT WITH TOMORROWâ€™S TALENT'
                      : 'CONNECT LEARNING WITH OUTCOMES'}
              </p>
              <h1>
                {view === 'Overview'
                  ? learner
                    ? 'Build skills. Find your place.'
                    : role === 'Industry'
                      ? 'Discover potential. Build your team.'
                      : 'A clearer picture of every journey.'
                  : view}
              </h1>
              <p className="muted">{descriptions[view]}</p>
            </div>
            {learner ? (
              <Button
                onClick={() =>
                  view === 'Opportunities'
                    ? open('profile')
                    : navigate('Opportunities')
                }
              >
                {view === 'Opportunities'
                  ? 'Edit skill profile'
                  : 'Explore opportunities'}
                <ArrowUpRight size={16} />
              </Button>
            ) : role === 'Industry' ? (
              <Button onClick={() => open('opportunity')}>
                <Plus size={16} />
                Post an opportunity
              </Button>
            ) : (
              <Button onClick={() => navigate('Approvals')}>
                Review opportunities <ArrowUpRight size={16} />
              </Button>
            )}
          </div>
          {error && (
            <div className="notice error" role="alert">
              {error}{' '}
              {!ready && (
                <Button size="sm" onClick={() => void load()}>
                  Retry connection
                </Button>
              )}
            </div>
          )}
          {notice && (
            <div className="notice" role="status">
              <Check size={16} />
              {notice}
              <button
                aria-label="Dismiss notification"
                onClick={() => setNotice('')}
              >
                Ã—
              </button>
            </div>
          )}
          {!ready && !error && (
            <p className="muted" role="status">
              Connecting your saved workspaceâ€¦
            </p>
          )}
          {view === 'Overview' && (
            <>
              {learner && (
                <section className="hero">
                  <div>
                    <span className="hero-kicker">
                      FROM POTENTIAL TO POSSIBILITY
                    </span>
                    <h2>
                      Your ambition.
                      <br />
                      An industry-ready future.
                    </h2>
                    <p>
                      Understand your strengths, close the gaps, and connect
                      <br />
                      with opportunities that move you forward.
                    </p>
                    <Button
                      className="light-btn"
                      onClick={() => navigate('My skills')}
                    >
                      Discover your skill profile <ArrowUpRight size={17} />
                    </Button>
                  </div>
                  <div className="hero-stat">
                    <GraduationCap size={42} />
                    <strong>
                      Learn.
                      <br />
                      Connect.
                      <br />
                      Grow.
                    </strong>
                    <span>ONE PLATFORM. EVERY POSSIBILITY.</span>
                  </div>
                </section>
              )}
              {statsPanel}
              <div className="section-heading">
                <div>
                  <h2>
                    {learner
                      ? 'Recommended for you'
                      : 'Opportunities in your ecosystem'}
                  </h2>
                  <p className="muted">
                    {learner
                      ? 'Ranked by the skills you bring to the table.'
                      : 'Sample opportunities and your newly published listings.'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => navigate('Opportunities')}
                >
                  View all <ArrowRight size={15} />
                </Button>
              </div>
              {cards(relevant.slice(0, 3))}
              <div className="bottom-grid">
                <section className="panel">
                  <div className="section-heading compact">
                    <h2>
                      {learner
                        ? 'Your next learning milestone'
                        : 'Ready to connect?'}
                    </h2>
                    <Target size={20} />
                  </div>
                  <p className="muted">
                    {learner
                      ? gap.missing.length
                        ? 'Build ' +
                          gap.missing.join(' and ') +
                          ' to strengthen your ' +
                          profile.career.toLowerCase() +
                          ' profile.'
                        : 'Your current skills cover this career path. Explore opportunities or reassess your strengths.'
                      : 'Post an opportunity, review applicants, and track outcomes from one connected workspace.'}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(
                        learner
                          ? 'Learning hub'
                          : role === 'Industry'
                            ? 'Applicants'
                            : 'Applications',
                      )
                    }
                  >
                    {learner ? 'Explore learning paths' : 'Review applications'}
                    <ArrowRight size={14} />
                  </Button>
                </section>
                <section className="panel demo-note">
                  <span className="tag">PRESENTATION READY</span>
                  <h3>Four perspectives. One connected journey.</h3>
                  <p className="muted">
                    Use the portal switcher to try student, industry, faculty
                    and institution workflows. Example companies are fictional.
                    Your changes are saved in your private demo.
                  </p>
                </section>
              </div>
            </>
          )}
          {view === 'Opportunities' && (
            <>
              <div className="filter-bar">
                <div className="search-field">
                  <Search size={17} />
                  <Input
                    aria-label="Search opportunities"
                    placeholder="Search role, company, location or skillâ€¦"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <NativeSelect
                  aria-label="Filter opportunity type"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  {['All', ...new Set(relevant.map((o: Item) => o.type))].map(
                    (t: any) => (
                      <option key={t}>{t}</option>
                    ),
                  )}
                </NativeSelect>
                <span className="tiny muted">
                  {filtered.length} opportunities
                </span>
              </div>
              {filtered.length
                ? cards(filtered)
                : empty(
                    'No opportunities match your search. Try another skill or clear the filters.',
                  )}
            </>
          )}
          {view === 'My skills' && (
            <>
              <div className="two-col">
                <section className="panel">
                  <div className="section-heading compact">
                    <h2>Your skill profile</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => open('profile')}
                    >
                      Edit profile
                    </Button>
                  </div>
                  <p className="muted">
                    Career direction: <strong>{profile.career}</strong>
                  </p>
                  <div className="tags">
                    {profile.skills.length ? (
                      profile.skills.map((s: string) => (
                        <span className="tag owned" key={s}>
                          <Check size={12} />
                          {s}
                        </span>
                      ))
                    ) : (
                      <p>No skills yet. Complete an assessment.</p>
                    )}
                  </div>
                  <div className="readiness">
                    <strong>{gap.score ?? 0}%</strong>
                    <div>
                      <b>Career skill coverage</b>
                      <p className="muted">
                        Skills matched against a predefined career path.
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={gap.score ?? 0}
                    aria-label="Career skill coverage"
                  />
                  <h3 className="mt">Your next skills to build</h3>
                  <div className="tags">
                    {gap.missing.length ? (
                      gap.missing.map((s) => (
                        <span className="tag missing" key={s}>
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="match">
                        All skills in this path are represented.
                      </span>
                    )}
                  </div>
                  <p className="tiny muted">
                    Self-reported and short-assessment skills are indicators,
                    not verified proficiency.
                  </p>
                </section>
                <section className="panel assessment-intro">
                  <Target size={29} />
                  <h2>Start with what you know.</h2>
                  <p className="muted">
                    12 short questions covering technical fundamentals,
                    aptitude, communication and teamwork. Your latest answers
                    replace your assessed skill profile.
                  </p>
                  <div className="tags">
                    <span className="tag">About 5 minutes</span>
                    <span className="tag">Rule-based scoring</span>
                  </div>
                  {profile.assessment && (
                    <p className="match">
                      Last result: {profile.assessment.score}% Â·{' '}
                      {new Date(profile.assessment.date).toLocaleDateString(
                        'en-IN',
                      )}
                    </p>
                  )}
                  <Button
                    disabled={!ready || busy}
                    onClick={() => {
                      setAnswers(Array(12).fill(-1));
                      open('assessment');
                    }}
                  >
                    {profile.assessment
                      ? 'Retake assessment'
                      : 'Take skill assessment'}
                    <ArrowUpRight size={16} />
                  </Button>
                </section>
              </div>
              <section className="panel mt">
                <h3>How your match is calculated</h3>
                <p className="muted">
                  Matched required skills Ã· total unique required skills Ã—
                  100. If you have HTML, CSS and JavaScript and a role also
                  requires React, your match is 75%. This is skill
                  compatibility, not a hiring prediction.
                </p>
              </section>
            </>
          )}
          {['My applications', 'Applications', 'Applicants'].includes(view) &&
            applicationsTable()}
          {view === 'Learning hub' && (
            <>
              <div className="section-heading">
                <div>
                  <h2>Make your next skill count</h2>
                  <p className="muted">
                    Learning resources, mentorship and workshops. Completion is
                    self-reported.
                  </p>
                </div>
                {role === 'Industry' && (
                  <Button onClick={() => open('program')}>
                    <Plus size={15} />
                    Publish a program
                  </Button>
                )}
              </div>
              <div className="opportunity-grid">
                {[...data.programs]
                  .sort(
                    (a, b) =>
                      Number(gap.missing.includes(b.skill)) -
                      Number(gap.missing.includes(a.skill)),
                  )
                  .map((p: Item) => {
                    const enrolled = data.enrollments.find(
                      (e: Item) => e.programId === p.id && e.role === role,
                    );
                    return (
                      <section className="panel program" key={p.id}>
                        <div className="row between">
                          <BookOpen size={25} />
                          <span className="tag">{p.kind}</span>
                        </div>
                        <h3>{p.title}</h3>
                        <p className="muted">{p.provider}</p>
                        <div className="tags">
                          <span className="tag">{p.skill}</span>
                          {gap.missing.includes(p.skill) && learner && (
                            <span className="tag owned">
                              Closes a skill gap
                            </span>
                          )}
                        </div>
                        <p className="tiny muted">{p.duration}</p>
                        <div className="program-actions">
                          {p.url && (
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="resource-link"
                            >
                              Open resource <ArrowUpRight size={14} />
                            </a>
                          )}
                          {learner && (
                            <Button
                              variant={enrolled ? 'outline' : 'default'}
                              size="sm"
                              disabled={busy || !ready || enrolled?.completed}
                              onClick={() =>
                                void act(
                                  'enroll',
                                  { id: p.id, completed: !!enrolled },
                                  enrolled
                                    ? 'Learning marked complete.'
                                    : 'Added to your learning plan.',
                                )
                              }
                            >
                              {enrolled?.completed
                                ? 'Completed'
                                : enrolled
                                  ? 'Mark complete'
                                  : 'Add to my learning'}
                            </Button>
                          )}
                        </div>
                      </section>
                    );
                  })}
              </div>
            </>
          )}
          {view === 'My portfolio' && (
            <>
              <section className="panel portfolio-head">
                <div className="avatar large">
                  {profile.name
                    .split(' ')
                    .map((s: string) => s[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <p className="eyebrow">YOUR DIGITAL PORTFOLIO</p>
                  <h2>{profile.name}</h2>
                  <p className="muted">
                    {profile.degree} Â· {profile.institution} Â· {profile.year}
                  </p>
                  <p>{profile.bio}</p>
                  <div className="tags">
                    {profile.skills.map((s: string) => (
                      <span className="tag owned" key={s}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <Button variant="outline" onClick={() => open('profile')}>
                  Edit profile
                </Button>
              </section>
              <div className="section-heading">
                <h2>Evidence of your progress</h2>
                <div className="row wrap">
                  <Button variant="outline" onClick={() => window.print()}>
                    <Download size={15} />
                    Print / save PDF
                  </Button>
                  <Button variant="outline" onClick={() => open('upload')}>
                    <Upload size={15} />
                    Upload document
                  </Button>
                  <Button onClick={() => open('portfolio')}>
                    <Plus size={15} />
                    Add achievement
                  </Button>
                </div>
              </div>
              {ownPortfolio.length ? (
                <div className="opportunity-grid">
                  {ownPortfolio.map((p: Item) => (
                    <section className="panel" key={p.id}>
                      <div className="row between">
                        <span className="tag">{p.type}</span>
                        <span
                          className={
                            'tag ' + (p.verified ? 'owned' : 'missing')
                          }
                        >
                          {p.verified ? (
                            <>
                              <ShieldCheck size={13} />
                              Verified in demo
                            </>
                          ) : (
                            'Pending verification'
                          )}
                        </span>
                      </div>
                      <h3 className="mt">{p.title}</h3>
                      <p className="muted">{p.description}</p>
                      {(p.url || p.fileKey) && (
                        <a
                          className="resource-link"
                          href={p.fileKey ? '/api/files?id=' + p.id : p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {p.fileKey ? 'Download document' : 'View evidence'}
                          <ArrowUpRight size={14} />
                        </a>
                      )}
                    </section>
                  ))}
                </div>
              ) : (
                empty(
                  'Add your first project, certificate, internship, achievement or resume. Faculty and institutions can review your evidence.',
                )
              )}
            </>
          )}
          {view === 'Approvals' && (
            <>
              {pending.length
                ? pending.map((o: Item) => (
                    <section className="panel review-row" key={o.id}>
                      <div>
                        <span className="tag">
                          {o.type} Â· {o.audience}
                        </span>
                        <h3>{o.title}</h3>
                        <p className="muted">
                          {o.company} Â· {o.location}
                        </p>
                        <p>{o.description}</p>
                        <div className="tags">
                          {o.skills.map((s: string) => (
                            <span className="tag" key={s}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        disabled={busy || !ready}
                        onClick={() =>
                          void act(
                            'approve',
                            { id: o.id, approved: true },
                            'Opportunity approved and visible to learners.',
                          )
                        }
                      >
                        <Check size={15} />
                        Approve opportunity
                      </Button>
                    </section>
                  ))
                : empty(
                    'No opportunities are waiting for approval. New industry listings appear here first.',
                  )}
              <div className="section-heading">
                <h2>Approved listings</h2>
              </div>
              {data.opportunities
                .filter((o: Item) => o.approved)
                .map((o: Item) => (
                  <div className="panel review-row" key={o.id}>
                    <div>
                      <strong>{o.title}</strong>
                      <p className="muted">{o.company}</p>
                    </div>
                    <Button
                      variant="outline"
                      disabled={busy || !ready}
                      onClick={() =>
                        void act(
                          'approve',
                          { id: o.id, approved: false },
                          'Opportunity removed from learner listings.',
                        )
                      }
                    >
                      Unpublish
                    </Button>
                  </div>
                ))}
            </>
          )}
          {view === 'Verification' && (
            <>
              {data.portfolio.filter(
                (p: Item) => role === 'Institution' || p.role === 'Student',
              ).length
                ? data.portfolio
                    .filter(
                      (p: Item) =>
                        role === 'Institution' || p.role === 'Student',
                    )
                    .map((p: Item) => (
                      <section className="panel review-row" key={p.id}>
                        <div>
                          <span className="tag">
                            {p.role} Â· {p.type}
                          </span>
                          <h3>{p.title}</h3>
                          <p className="muted">{p.description}</p>
                          {(p.url || p.fileKey) && (
                            <a
                              className="resource-link"
                              href={p.fileKey ? '/api/files?id=' + p.id : p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Review evidence <ArrowUpRight size={14} />
                            </a>
                          )}
                        </div>
                        <Button
                          disabled={busy || !ready}
                          variant={p.verified ? 'outline' : 'default'}
                          onClick={() =>
                            void act(
                              'verify',
                              { id: p.id, verified: !p.verified },
                              p.verified
                                ? 'Verification revoked.'
                                : 'Achievement verified in this demo.',
                            )
                          }
                        >
                          {p.verified
                            ? 'Revoke verification'
                            : 'Verify achievement'}
                        </Button>
                      </section>
                    ))
                : empty(
                    'Uploaded documents and achievements will appear here for review.',
                  )}
            </>
          )}
          {view === 'Analytics' && (
            <>
              {statsPanel}
              <div className="two-col mt">
                <section className="panel">
                  <h2>Skills industry is asking for</h2>
                  <p className="muted">
                    Required-skill mentions across approved listings, including
                    sample data.
                  </p>
                  {skills
                    .map((s) => ({
                      s,
                      n: data.opportunities.filter(
                        (o: Item) => o.approved && o.skills.includes(s),
                      ).length,
                    }))
                    .sort((a, b) => b.n - a.n)
                    .slice(0, 8)
                    .map(({ s, n }) => (
                      <div className="analytics-bar" key={s}>
                        <div className="row between">
                          <span>{s}</span>
                          <b>{n} listings</b>
                        </div>
                        <Progress
                          value={
                            (n /
                              Math.max(
                                1,
                                data.opportunities.filter(
                                  (o: Item) => o.approved,
                                ).length,
                              )) *
                            100
                          }
                          aria-label={s + ' demand'}
                        />
                      </div>
                    ))}
                </section>
                <section className="panel">
                  <h2>Application outcomes</h2>
                  <p className="muted">
                    Calculated from saved applications in this demo workspace.
                  </p>
                  {[
                    'Applied',
                    'Shortlisted',
                    'Interview',
                    'Selected',
                    'In progress',
                    'Completed',
                    'Rejected',
                  ].map((s) => (
                    <div className="outcome-row" key={s}>
                      <span>{s}</span>
                      <strong>
                        {
                          data.applications.filter((a: Item) => a.status === s)
                            .length
                        }
                      </strong>
                    </div>
                  ))}
                  <p className="tiny muted mt">
                    Demo reporting is not a national or institution-wide
                    dataset.
                  </p>
                </section>
              </div>
            </>
          )}
          <footer>
            <span>SkillConnect Â· Bridging academia and industry.</span>
            <span>
              Private SIH prototype Â· Role switching is a demo feature
            </span>
          </footer>
        </main>
      </div>
      <Dialog
        open={!!modal}
        onOpenChange={(o) => {
          if (!o && !busy) setModal('');
        }}
      >
        <DialogContent className="portal-dialog">
          <DialogTitle>
            {
              (
                {
                  profile: 'Make this profile yours',
                  assessment: 'Discover your skills',
                  detail: selected?.title,
                  opportunity: 'Post an opportunity',
                  portfolio: 'Add to your portfolio',
                  upload: 'Upload a document',
                  status: 'Review application',
                  tracking: 'Your application journey',
                  program: 'Publish a learning program',
                } as Item
              )[modal]
            }
          </DialogTitle>
          <DialogDescription>
            {modal === 'assessment'
              ? 'Answer each question. This short diagnostic is not a certification.'
              : modal === 'detail'
                ? selected?.company
                : modal === 'upload'
                  ? 'Resume, certificate, academic record or report. PDF, PNG or JPEG, up to 5 MB.'
                  : 'Changes are saved in your private demo workspace.'}
          </DialogDescription>
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          {modal === 'detail' && selected && (
            <>
              <div className="tags">
                <span className="tag">{selected.type}</span>
                <span className="tag">{selected.audience}</span>
                {selected.demo && (
                  <span className="tag">Fictional demo opportunity</span>
                )}
              </div>
              <p>{selected.description}</p>
              <p className="muted">
                {selected.location} Â· {selected.duration}
                <br />
                {selected.pay} Â· Apply by {selected.deadline}
              </p>
              <h3>Required skills</h3>
              <div className="tags">
                {selected.skills.map((s: string) => (
                  <span
                    className={
                      'tag ' +
                      (profile.skills.includes(s) ? 'owned' : 'missing')
                    }
                    key={s}
                  >
                    {s}
                  </span>
                ))}
              </div>
              {learner && (
                <>
                  <p className="match">
                    {matchSkills(profile.skills, selected.skills).score ?? 0}%
                    skill compatibility
                  </p>
                  <p className="tiny muted">
                    Missing:{' '}
                    {matchSkills(profile.skills, selected.skills).missing.join(
                      ', ',
                    ) || 'None'}
                    . Selection also depends on recruiter review.
                  </p>
                  <Button
                    disabled={
                      busy ||
                      !ready ||
                      data.applications.some(
                        (a: Item) =>
                          a.opportunityId === selected.id && a.role === role,
                      )
                    }
                    onClick={async () => {
                      if (
                        await act(
                          'apply',
                          { id: selected.id },
                          'Application sent. Track it in My applications.',
                        )
                      )
                        setModal('');
                    }}
                  >
                    {data.applications.some(
                      (a: Item) =>
                        a.opportunityId === selected.id && a.role === role,
                    )
                      ? 'Already applied'
                      : 'Apply with my profile'}
                    <ArrowUpRight size={15} />
                  </Button>
                </>
              )}
            </>
          )}
          {modal === 'profile' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  await act(
                    'profile',
                    draft,
                    'Profile updated. Your matches have been refreshed.',
                  )
                )
                  setModal('');
              }}
            >
              <div className="form-grid">
                {field('Full name', 'name')}
                {field('Institution', 'institution')}
                {field('Degree / department', 'degree')}
                {field('Graduation year / experience', 'year')}
                {field(
                  'Career direction',
                  'career',
                  'text',
                  Object.keys(careers),
                )}
              </div>
              {field('About you', 'bio', 'textarea')}
              {skillPicker()}
              <Button type="submit" disabled={busy || !ready}>
                Save profile
              </Button>
            </form>
          )}
          {modal === 'assessment' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  await act(
                    'assessment',
                    { answers },
                    'Assessment complete. Your skill profile and matches are updated.',
                  )
                ) {
                  setModal('');
                  navigate('My skills');
                  setNotice(
                    'Assessment complete. Your skill profile has been updated.',
                  );
                }
              }}
            >
              {questions.map((q, i) => (
                <fieldset className="question" key={q.skill}>
                  <legend>
                    <span className="tiny muted">
                      {i + 1} / 12 Â· {q.skill}
                    </span>
                    <br />
                    {q.q}
                  </legend>
                  {q.options.map((o, j) => (
                    <label key={o}>
                      <input
                        type="radio"
                        required
                        name={'q' + i}
                        checked={answers[i] === j}
                        onChange={() =>
                          setAnswers(answers.map((a, k) => (k === i ? j : a)))
                        }
                      />
                      {o}
                    </label>
                  ))}
                </fieldset>
              ))}
              <Button
                type="submit"
                disabled={busy || !ready || answers.includes(-1)}
              >
                Finish assessment Â· {answers.filter((a) => a >= 0).length}/12
                answered
              </Button>
            </form>
          )}
          {modal === 'opportunity' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  await act(
                    'opportunity',
                    draft,
                    'Opportunity submitted. Switch to Institution to approve it.',
                  )
                )
                  setModal('');
              }}
            >
              <div className="form-grid">
                {field('Role / opportunity title', 'title')}
                {field('Company', 'company')}
                {field('Type', 'type', 'text', [
                  'Internship',
                  'Job',
                  'Apprenticeship',
                  'Live Project',
                  'Faculty Internship',
                  'FDP',
                  'Industrial Training',
                  'Research',
                  'Consultancy',
                ])}
                {field('Audience', 'audience', 'text', ['Student', 'Faculty'])}
                {field('Location / work mode', 'location')}
                {field('Stipend / compensation', 'pay')}
                {field('Duration', 'duration')}
                {field('Application deadline', 'deadline', 'date')}
              </div>
              {field('Description', 'description', 'textarea')}
              {skillPicker()}
              <Button type="submit" disabled={busy || !ready}>
                Submit for institution approval
              </Button>
            </form>
          )}
          {modal === 'portfolio' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  await act(
                    'portfolio',
                    draft,
                    'Achievement added for verification.',
                  )
                )
                  setModal('');
              }}
            >
              {field('Title', 'title')}
              {field('Type', 'type', 'text', [
                'Project',
                'Certificate',
                'Internship',
                'Achievement',
              ])}
              {field(
                'Description / issuing organization',
                'description',
                'textarea',
              )}
              {field('Evidence link (optional)', 'url', 'url')}
              <Button type="submit" disabled={busy || !ready}>
                Add achievement
              </Button>
            </form>
          )}
          {modal === 'program' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  await act(
                    'program',
                    draft,
                    'Program published to the learning hub.',
                  )
                )
                  setModal('');
              }}
            >
              {field('Program title', 'title')}
              {field('Company / provider', 'provider')}
              <div className="form-grid">
                {field('Program type', 'kind', 'text', [
                  'Learning path',
                  'Certification',
                  'Mentorship',
                  'Workshop',
                  'Guest lecture',
                ])}
                {field('Skill developed', 'skill', 'text', skills)}
              </div>
              {field('Duration', 'duration')}
              {field('Program link (optional)', 'url', 'url')}
              <Button type="submit" disabled={busy || !ready}>
                Publish program
              </Button>
            </form>
          )}
          {modal === 'upload' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError('');
                try {
                  const form = new FormData(e.currentTarget);
                  form.set('role', role);
                  const r = await fetch('/api/files', {
                    method: 'POST',
                    body: form,
                  });
                  const d = (await r.json()) as Item;
                  if (!r.ok) throw Error(d.error);
                  await load();
                  setModal('');
                  setNotice(
                    'Document uploaded securely to your demo portfolio.',
                  );
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label className="upload-box">
                <Upload size={28} />
                <span>Choose a document</span>
                <Input
                  name="file"
                  type="file"
                  required
                  accept="application/pdf,image/png,image/jpeg"
                />
              </label>
              <Button type="submit" disabled={busy || !ready}>
                {busy ? 'Uploadingâ€¦' : 'Upload document'}
              </Button>
            </form>
          )}
          {modal === 'status' && selected && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  await act(
                    'status',
                    { ...draft, id: selected.id },
                    'Application status and mentor feedback updated.',
                  )
                )
                  setModal('');
              }}
            >
              <p>
                <strong>{selected.name}</strong> Â· {selected.role}
              </p>
              {field('Application status', 'status', 'text', [
                'Applied',
                'Shortlisted',
                'Interview',
                'Selected',
                'In progress',
                'Completed',
                'Rejected',
              ])}
              <label className="form-field">
                Recruiter / mentor feedback
                <textarea
                  maxLength={1000}
                  value={draft.feedback || ''}
                  onChange={(e) =>
                    setDraft({ ...draft, feedback: e.target.value })
                  }
                />
              </label>
              <Button type="submit" disabled={busy || !ready}>
                Save review
              </Button>
            </form>
          )}
          {modal === 'tracking' && selected && (
            <>
              <span className="tag">{selected.status}</span>
              <div className="timeline">
                {[
                  'Applied',
                  'Shortlisted',
                  'Interview',
                  'Selected',
                  'In progress',
                  'Completed',
                ].map((s, i) => (
                  <div
                    key={s}
                    className={
                      i <=
                      [
                        'Applied',
                        'Shortlisted',
                        'Interview',
                        'Selected',
                        'In progress',
                        'Completed',
                      ].indexOf(selected.status)
                        ? 'done'
                        : ''
                    }
                  >
                    <span>{i + 1}</span>
                    {s}
                  </div>
                ))}
              </div>
              {selected.status === 'Rejected' && (
                <p>This application was not selected.</p>
              )}
              <h3>Mentor / recruiter feedback</h3>
              <p className="muted">
                {selected.feedback ||
                  'No feedback yet. Updates from the industry portal will appear here.'}
              </p>
              {selected.status === 'Completed' && (
                <p className="match">
                  <ShieldCheck size={16} /> Completion recorded in your
                  application history.
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
