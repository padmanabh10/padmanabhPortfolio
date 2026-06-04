import { NextResponse } from 'next/server';

const REVALIDATE = 3600;

function tsToDate(ts: number): string {
  const d = new Date(ts * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function nextDay(date: string): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

async function fetchGitHubDay(date: string) {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;
  if (!username || !token) return [];

  const res = await fetch(
    `https://api.github.com/search/commits?q=author:${encodeURIComponent(username)}+committer-date:${date}&sort=committer-date&per_page=20`,
    {
      headers: {
        Authorization: `bearer ${token}`,
        Accept: 'application/vnd.github.cloak-preview+json',
      },
      next: { revalidate: REVALIDATE },
    }
  );
  if (!res.ok) return [];
  const json = await res.json();

  return (json.items ?? []).map((item: {
    commit: { message: string };
    repository: { full_name: string };
    html_url: string;
    sha: string;
  }) => ({
    message: item.commit.message.split('\n')[0].slice(0, 80),
    repo: item.repository.full_name,
    url: item.html_url,
    sha: item.sha.slice(0, 7),
  }));
}

async function fetchCodeforcesDay(date: string) {
  const handle = process.env.CODEFORCES_HANDLE;
  if (!handle) return [];

  const res = await fetch(
    `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=500`,
    { next: { revalidate: REVALIDATE } }
  );
  if (!res.ok) return [];
  const json = await res.json();
  if (json.status !== 'OK') return [];

  return (json.result as Array<{
    creationTimeSeconds: number;
    verdict: string;
    problem: { contestId: number; index: string; name: string; rating?: number };
  }>)
    .filter(s => tsToDate(s.creationTimeSeconds) === date)
    .map(s => ({
      problem: `${s.problem.index}. ${s.problem.name}`,
      verdict: s.verdict === 'OK' ? 'AC' : s.verdict?.replace(/_/g, ' ') ?? '?',
      rating: s.problem.rating,
      url: `https://codeforces.com/contest/${s.problem.contestId}/problem/${s.problem.index}`,
    }));
}

async function fetchLeetCodeDay(date: string) {
  const username = process.env.LEETCODE_USERNAME;
  if (!username) return [];

  const query = `query($u:String!){recentAcSubmissionList(username:$u,limit:50){title titleSlug timestamp}}`;
  const res = await fetch('https://leetcode.com/graphql/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Referer: 'https://leetcode.com',
      'User-Agent': 'Mozilla/5.0',
    },
    body: JSON.stringify({ query, variables: { u: username } }),
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return [];
  const json = await res.json();
  const list: Array<{ title: string; titleSlug: string; timestamp: string }> =
    json?.data?.recentAcSubmissionList ?? [];

  return list
    .filter(s => tsToDate(parseInt(s.timestamp)) === date)
    .map(s => ({
      title: s.title,
      url: `https://leetcode.com/problems/${s.titleSlug}/`,
    }));
}

async function fetchGitLabDay(date: string) {
  const username = process.env.GITLAB_USERNAME;
  if (!username) return [];

  const userRes = await fetch(
    `https://gitlab.com/api/v4/users?username=${encodeURIComponent(username)}`,
    { next: { revalidate: 86400 } }
  );
  if (!userRes.ok) return [];
  const users = await userRes.json() as Array<{ id: number }>;
  if (!users.length) return [];

  const after = date;
  const before = nextDay(date);

  const res = await fetch(
    `https://gitlab.com/api/v4/users/${users[0].id}/events?after=${after}&before=${before}&per_page=50`,
    { next: { revalidate: REVALIDATE } }
  );
  if (!res.ok) return [];
  const events = await res.json() as Array<{
    action_name: string;
    push_data?: { commit_title?: string };
    target_title?: string;
    project_id: number;
  }>;

  return events
    .filter(e => ['pushed', 'merged', 'accepted', 'opened'].includes(e.action_name))
    .map(e => ({
      action: e.action_name,
      title: (e.push_data?.commit_title ?? e.target_title ?? 'activity').slice(0, 80),
    }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  // Basic validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  const [github, codeforces, leetcode, gitlab] = await Promise.all([
    safe(() => fetchGitHubDay(date), []),
    safe(() => fetchCodeforcesDay(date), []),
    safe(() => fetchLeetCodeDay(date), []),
    safe(() => fetchGitLabDay(date), []),
  ]);

  return NextResponse.json(
    { date, github, codeforces, leetcode, gitlab },
    { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' } }
  );
}
