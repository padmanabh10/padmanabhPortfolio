"use client";

import { useEffect, useState, useCallback } from "react";

type Platform = "github" | "gitlab" | "leetcode" | "codeforces" | "codechef" | "geeksforgeeks";

interface DayData {
  date: string;
  total: number;
  github: number;
  gitlab: number;
  leetcode: number;
  codeforces: number;
  codechef: number;
  geeksforgeeks: number;
}

const PLATFORMS: Record<Platform, string> = {
  github: "GitHub",
  gitlab: "GitLab",
  leetcode: "LeetCode",
  codeforces: "Codeforces",
  codechef: "CodeChef",
  geeksforgeeks: "GeeksForGeeks",
};

const PLATFORM_KEYS = Object.keys(PLATFORMS) as Platform[];

const VERSION_CONTROL: Platform[] = ["github", "gitlab"];
const PROBLEM_SOLVING: Platform[] = ["leetcode", "codeforces", "codechef", "geeksforgeeks"];

// 5 shades per platform: [empty, low, mid-low, mid-high, high]
// Index 0 is always the "no activity" background colour.
const EMPTY = "#D4E8D0";

const SHADES: Record<Platform, [string, string, string, string, string]> = {
  github:        [EMPTY, "#95C9A5", "#52A870", "#1D7A52", "#006C53"], // primary green
  gitlab:        [EMPTY, "#fdd9bc", "#fba86a", "#FC6D26", "#c44800"], // orange
  leetcode:      [EMPTY, "#fde9a8", "#fcc84a", "#F59E0B", "#b57209"], // amber
  codeforces:    [EMPTY, "#fca5a5", "#f87171", "#ef4444", "#b91c1c"], // red
  codechef:      [EMPTY, "#bfdbfe", "#60a5fa", "#3B82F6", "#1d4ed8"], // blue
  geeksforgeeks: [EMPTY, "#a7f3d0", "#34d399", "#10B981", "#065f46"], // emerald
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const CELL = 16;
const GAP = 3;
const STEP = CELL + GAP;
const NUM_WEEKS = 52;

function getLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 7) return 2;
  if (count <= 15) return 3;
  return 4;
}

// Returns a CSS background value — solid colour or diagonal gradient stripe
function getCellBackground(cell: CellData, active: Set<Platform>): string {
  const activePlatforms = PLATFORM_KEYS.filter(p => active.has(p) && cell[p] > 0);

  if (activePlatforms.length === 0) return EMPTY;

  if (activePlatforms.length === 1) {
    const p = activePlatforms[0];
    return SHADES[p][getLevel(cell[p])];
  }

  // Multiple platforms → equal-width diagonal stripes
  const colors = activePlatforms.map(p => SHADES[p][getLevel(cell[p])]);
  const pct = 100 / colors.length;
  const stops = colors.flatMap((c, i) => [
    `${c} ${(i * pct).toFixed(1)}%`,
    `${c} ${((i + 1) * pct).toFixed(1)}%`,
  ]);
  return `linear-gradient(135deg, ${stops.join(", ")})`;
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatLong(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
}

interface CellData extends DayData { displayCount: number }

function buildGrid(days: DayData[], active: Set<Platform>) {
  const dayMap = new Map<string, DayData>(days.map(d => [d.date, d]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endSunday = new Date(today);
  endSunday.setDate(today.getDate() - today.getDay());

  const startSunday = new Date(endSunday);
  startSunday.setDate(endSunday.getDate() - (NUM_WEEKS - 1) * 7);

  const weeks: (CellData | null)[][] = [];
  const monthLabels: { label: string; weekIdx: number }[] = [];
  let lastMonth = -1;

  for (let w = 0; w < NUM_WEEKS; w++) {
    const weekStart = new Date(startSunday);
    weekStart.setDate(startSunday.getDate() + w * 7);
    const week: (CellData | null)[] = [];

    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + d);

      if (date > today) { week.push(null); continue; }

      const dateStr = fmtDate(date);
      const data = dayMap.get(dateStr) ?? {
        date: dateStr, total: 0, github: 0, gitlab: 0,
        leetcode: 0, codeforces: 0, codechef: 0, geeksforgeeks: 0,
      };

      const displayCount = Array.from(active).reduce((s, p) => s + data[p], 0);
      week.push({ ...data, displayCount });

      if (d === 0) {
        const month = date.getMonth();
        if (month !== lastMonth) {
          monthLabels.push({ label: MONTHS[month], weekIdx: w });
          lastMonth = month;
        }
      }
    }
    weeks.push(week);
  }

  return { weeks, monthLabels };
}

// ── Panel ────────────────────────────────────────────────────────────────────

function Dot({ platform }: { platform: Platform }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: SHADES[platform][3],
        flexShrink: 0,
      }}
    />
  );
}

function StatRow({ platform, count, unit }: { platform: Platform; count: number; unit: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border-accent last:border-0">
      <div className="flex items-center gap-2">
        <Dot platform={platform} />
        <span className="font-mono text-[10px] text-text-secondary">{PLATFORMS[platform]}</span>
      </div>
      <span className="font-mono text-[11px] font-bold shrink-0" style={{ color: SHADES[platform][3] }}>
        {count} {unit}
      </span>
    </div>
  );
}

function Panel({ cell, active }: { cell: CellData; active: Set<Platform> }) {
  const vcPlatforms = VERSION_CONTROL.filter(p => active.has(p) && cell[p] > 0);
  const psPlatforms = PROBLEM_SOLVING.filter(p => active.has(p) && cell[p] > 0);
  const totalDisplay = Array.from(active).reduce((s, p) => s + cell[p], 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-border-accent shrink-0">
        <p className="font-heading text-sm uppercase text-primary leading-tight">
          {formatLong(cell.date)}
        </p>
        <p className="font-mono text-[10px] text-text-secondary mt-1">
          {totalDisplay === 0 ? "No activity" : `${totalDisplay} total contribution${totalDisplay !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="flex-1 overflow-hidden px-4 py-3">
        {vcPlatforms.map(p => (
          <StatRow key={p} platform={p} count={cell[p]} unit={cell[p] === 1 ? "contribution" : "contributions"} />
        ))}
        {psPlatforms.map(p => (
          <StatRow key={p} platform={p} count={cell[p]} unit={cell[p] === 1 ? "question" : "questions"} />
        ))}
        {totalDisplay === 0 && (
          <p className="font-mono text-[10px] text-text-muted italic">No recorded activity on this day</p>
        )}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

const ALL = new Set(PLATFORM_KEYS);

export default function ActivityCalendar() {
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Set<Platform>>(new Set(ALL));
  const [hoveredCell, setHoveredCell] = useState<CellData | null>(null);

  useEffect(() => {
    fetch("/api/activity")
      .then(r => r.json())
      .then(data => { setDays(data.days ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const isAll = active.size === PLATFORM_KEYS.length;

  const handlePlatformClick = useCallback((p: Platform) => {
    setActive(prev => {
      if (prev.size === PLATFORM_KEYS.length) return new Set([p]);
      const next = new Set(prev);
      if (next.has(p)) { if (next.size > 1) next.delete(p); }
      else next.add(p);
      return next;
    });
  }, []);

  const handleAllClick = useCallback(() => setActive(new Set(ALL)), []);
  const handleCellEnter = useCallback((cell: CellData) => setHoveredCell(cell), []);
  const handleCellLeave = useCallback(() => {}, []);

  const { weeks, monthLabels } = buildGrid(days, active);

  const totalCount = days.reduce(
    (sum, d) => sum + Array.from(active).reduce((s, p) => s + d[p], 0), 0
  );

  return (
    <div className="font-mono w-full">
      <p className="text-xs text-text-secondary mb-4">
        {loading ? "Loading contributions..." : `${totalCount.toLocaleString()} contributions in the last year`}
      </p>

      {/* Platform filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={handleAllClick}
          className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 border transition-colors cursor-pointer select-none ${
            isAll ? "border-primary text-primary bg-accent-bg" : "border-border text-text-muted bg-surface"
          }`}
        >
          All
        </button>
        {PLATFORM_KEYS.map(p => {
          const isActive = active.has(p) && !isAll;
          const isInactive = !active.has(p);
          return (
            <button
              key={p}
              onClick={() => handlePlatformClick(p)}
              className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2 py-1 border transition-colors cursor-pointer select-none ${
                isActive
                  ? "border-border-accent text-text bg-surface"
                  : isInactive
                  ? "border-border text-text-muted bg-surface opacity-40"
                  : "border-border text-text-muted bg-surface"
              }`}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: isInactive ? "#aaa" : SHADES[p][3],
                  flexShrink: 0,
                }}
              />
              {PLATFORMS[p]}
            </button>
          );
        })}
      </div>

      {/* Calendar + panel */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Heatmap ── */}
        <div className="flex-1 min-w-0">
          <div className="overflow-x-auto pb-1">
            <div style={{ display: "flex", alignItems: "flex-start", width: "max-content" }}>

              {/* Day labels */}
              <div style={{ display: "flex", flexDirection: "column", gap: GAP, paddingTop: 18, width: 32, flexShrink: 0 }}>
                {DAY_LABELS.map((label, i) => (
                  <div key={i} style={{ height: CELL, lineHeight: `${CELL}px`, fontSize: 9, color: "var(--color-text-muted)", textAlign: "right", paddingRight: 4 }}>
                    {label}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div style={{ position: "relative" }}>
                <div style={{ height: 16, position: "relative", marginBottom: GAP }}>
                  {monthLabels.map(({ label, weekIdx }) => (
                    <span
                      key={`${weekIdx}-${label}`}
                      style={{ position: "absolute", left: weekIdx * STEP, top: 0, fontSize: 9, lineHeight: "16px", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}
                    >
                      {label}
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: GAP }}>
                  {weeks.map((week, wIdx) => (
                    <div key={wIdx} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                      {week.map((cell, dIdx) => {
                        if (!cell) return <div key={dIdx} style={{ width: CELL, height: CELL }} />;
                        const bg = loading ? EMPTY : getCellBackground(cell, active);
                        const isHovered = hoveredCell?.date === cell.date;
                        return (
                          <div
                            key={dIdx}
                            style={{
                              width: CELL,
                              height: CELL,
                              background: bg,
                              outline: isHovered ? "1.5px solid var(--color-primary)" : "none",
                              outlineOffset: 1,
                              cursor: "default",
                            }}
                            onMouseEnter={() => handleCellEnter(cell)}
                            onMouseLeave={handleCellLeave}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        {hoveredCell && (
          <div
            className="w-full lg:w-60 xl:w-64 shrink-0 border border-border-accent bg-bg-card"
            style={{ height: 7 * CELL + 6 * GAP + 16 + GAP + 80 }}
          >
            <Panel cell={hoveredCell} active={active} />
          </div>
        )}
      </div>
    </div>
  );
}
