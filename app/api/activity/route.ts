import { NextResponse } from 'next/server';

type DailyMap = Record<string, number>;

const REVALIDATE = 3600;

function tsToDate(ts: number): string {
  const d = new Date(ts * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function safe(fn: () => Promise<DailyMap>): Promise<DailyMap> {
  try {
    return await fn();
  } catch {
    return {};
  }
}

async function fetchGitHub(): Promise<DailyMap> {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;
  if (!username || !token) return {};

  const to = new Date();
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - 1);

  const query = `query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){contributionsCollection(from:$from,to:$to){contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}`;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { login: username, from: from.toISOString(), to: to.toISOString() } }),
    next: { revalidate: REVALIDATE },
  });

  if (!res.ok) return {};
  const json = await res.json();
  const weeks: Array<{ contributionDays: Array<{ date: string; contributionCount: number }> }> =
    json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];

  const result: DailyMap = {};
  for (const week of weeks) {
    for (const { date, contributionCount } of week.contributionDays) {
      if (contributionCount > 0) result[date] = contributionCount;
    }
  }
  return result;
}

async function fetchLeetCode(): Promise<DailyMap> {
  const username = process.env.LEETCODE_USERNAME;
  if (!username) return {};

  const fetchYear = async (year: number): Promise<DailyMap> => {
    const query = `query($u:String!,$y:Int){matchedUser(username:$u){userCalendar(year:$y){submissionCalendar}}}`;
    const res = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0',
      },
      body: JSON.stringify({ query, variables: { u: username, y: year } }),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return {};
    const json = await res.json();
    const calStr: string | undefined = json?.data?.matchedUser?.userCalendar?.submissionCalendar;
    if (!calStr) return {};
    const cal = JSON.parse(calStr) as Record<string, number>;
    const result: DailyMap = {};
    for (const [ts, count] of Object.entries(cal)) {
      result[tsToDate(parseInt(ts))] = count;
    }
    return result;
  };

  const year = new Date().getFullYear();
  const [prev, curr] = await Promise.all([fetchYear(year - 1), fetchYear(year)]);
  return { ...prev, ...curr };
}

async function fetchCodeforces(): Promise<DailyMap> {
  const handle = process.env.CODEFORCES_HANDLE;
  if (!handle) return {};

  const res = await fetch(
    `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=10000`,
    { next: { revalidate: REVALIDATE } }
  );
  if (!res.ok) return {};
  const json = await res.json();
  if (json.status !== 'OK') return {};

  const cutoff = Math.floor(Date.now() / 1000) - 365 * 24 * 3600;
  const result: DailyMap = {};
  for (const sub of json.result as Array<{ creationTimeSeconds: number }>) {
    if (sub.creationTimeSeconds < cutoff) break; // submissions are newest-first
    const date = tsToDate(sub.creationTimeSeconds);
    result[date] = (result[date] ?? 0) + 1;
  }
  return result;
}

async function fetchGitLab(): Promise<DailyMap> {
  const username = process.env.GITLAB_USERNAME;
  if (!username) return {};

  const res = await fetch(
    `https://gitlab.com/users/${encodeURIComponent(username)}/calendar.json`,
    { next: { revalidate: REVALIDATE } }
  );
  if (!res.ok) return {};
  return (await res.json()) as DailyMap;
}

async function fetchCodeChef(): Promise<DailyMap> {
  const username = process.env.CODECHEF_USERNAME;
  if (!username) return {};

  const res = await fetch(`https://www.codechef.com/users/${encodeURIComponent(username)}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return {};
  const html = await res.text();

  // CodeChef embeds heatmap data as a JSON-encoded string in a script variable
  const patterns = [
    /calenderData\s*=\s*"((?:[^"\\]|\\.)*)"/,
    /calenderData\s*=\s*'((?:[^'\\]|\\.)*)'/,
    /"activity"\s*:\s*(\[[\s\S]*?\])/,
  ];

  for (const pattern of patterns) {
    const m = html.match(pattern);
    if (!m) continue;
    try {
      const raw = m[1].replace(/\\"/g, '"').replace(/\\'/g, "'");
      const data = JSON.parse(raw) as Array<{ date: string; value: number }>;
      if (!Array.isArray(data)) continue;
      const result: DailyMap = {};
      for (const { date, value } of data) {
        if (value > 0) result[date] = value;
      }
      return result;
    } catch {
      continue;
    }
  }
  return {};
}

async function fetchGeeksForGeeks(): Promise<DailyMap> {
  const username = process.env.GFG_USERNAME;
  if (!username) return {};

  const result: DailyMap = {};
  const cutoffMs = Date.now() - 365 * 24 * 3600 * 1000;

  for (let page = 0; page < 20; page++) {
    const res = await fetch(
      `https://practiceapi.geeksforgeeks.org/api/latest/user/practice/submission-by-category/?ptype=all&category=&language=&page=${page}&handle=${encodeURIComponent(username)}&pageSize=200`,
      { next: { revalidate: REVALIDATE } }
    );
    if (!res.ok) break;
    const json = await res.json();
    const submissions: Array<{ date: string }> = json?.results ?? [];
    if (submissions.length === 0) break;

    let done = false;
    for (const sub of submissions) {
      const ts = new Date(sub.date).getTime();
      if (isNaN(ts) || ts < cutoffMs) { done = true; break; }
      const date = new Date(sub.date).toISOString().slice(0, 10);
      result[date] = (result[date] ?? 0) + 1;
    }
    if (done) break;
  }
  return result;
}

export async function GET() {
  const [github, gitlab, leetcode, codeforces, codechef, geeksforgeeks] = await Promise.all([
    safe(fetchGitHub),
    safe(fetchGitLab),
    safe(fetchLeetCode),
    safe(fetchCodeforces),
    safe(fetchCodeChef),
    safe(fetchGeeksForGeeks),
  ]);

  const allDates = new Set([
    ...Object.keys(github),
    ...Object.keys(gitlab),
    ...Object.keys(leetcode),
    ...Object.keys(codeforces),
    ...Object.keys(codechef),
    ...Object.keys(geeksforgeeks),
  ]);

  const days = Array.from(allDates).sort().map(date => ({
    date,
    github: github[date] ?? 0,
    gitlab: gitlab[date] ?? 0,
    leetcode: leetcode[date] ?? 0,
    codeforces: codeforces[date] ?? 0,
    codechef: codechef[date] ?? 0,
    geeksforgeeks: geeksforgeeks[date] ?? 0,
    total:
      (github[date] ?? 0) +
      (gitlab[date] ?? 0) +
      (leetcode[date] ?? 0) +
      (codeforces[date] ?? 0) +
      (codechef[date] ?? 0) +
      (geeksforgeeks[date] ?? 0),
  }));

  return NextResponse.json({ days }, {
    headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
  });
}
