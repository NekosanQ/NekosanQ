import type { ProfileStats } from "./github.ts";
import { icon } from "./icons.ts";
import type { IconName } from "./icons.ts";

// Match the light README text in the supplied reference across both cards.
export const theme = {
  background: "#0d1117", badge: "#151b23", border: "#3d444d",
  foreground: "#e6edf3", muted: "#e6edf3", languageFallback: "#9198a1",
};
const format = new Intl.NumberFormat("en-US");

export interface Badge { id: string; icon: IconName; label: string; value: string; logo?: string; description?: string }
export interface BadgeGroup { title: string; badges: Badge[] }

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!);
}

function textWidth(value: string): number {
  return Math.ceil([...value].reduce((width, char) => width + (
    /[ilI.,:;'!|]/.test(char) ? 3 : /[%—…]/.test(char) ? 11 : /[mwMW@]/.test(char) ? 9 : char === " " ? 4 : /[A-Z0-9]/.test(char) ? 7.2 : 6.3
  ), 0));
}

function badgeWidth(badge: Badge): number {
  return 25 + textWidth(badge.label) + (badge.value ? 7 + textWidth(badge.value) : 0) + 8;
}

function badgeContent(badge: Badge): string {
  const width = badgeWidth(badge);
  const glyph = badge.logo
    ? `<svg x="6" y="3" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="${theme.foreground}" d="${escapeXml(badge.logo)}"/></svg>`
    : `<svg x="6" y="3" width="14" height="14" viewBox="0 0 16 16">${icon(badge.icon, 0, 0, theme.foreground)}</svg>`;
  return `<rect width="${width}" height="20" fill="${theme.badge}"/>
  ${glyph}
  <text x="25" y="14">${escapeXml(badge.label)}</text>
  ${badge.value ? `<text x="${width - 8}" y="14" text-anchor="end">${escapeXml(badge.value)}</text>` : ""}`;
}

function document(width: number, height: number, title: string, description: string, content: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(title)}</title>
  <desc id="description">${escapeXml(description)}</desc>
  <style>
    text { font: 11px Verdana, Geneva, "DejaVu Sans", sans-serif; fill: ${theme.foreground}; }
    .heading { font: 600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .muted { fill: ${theme.muted}; }
    .value { fill: ${theme.foreground}; font-variant-numeric: tabular-nums; }
  </style>
  ${content}
</svg>
`;
}

function badgeGroups(stats: ProfileStats): BadgeGroup[] {
  const badge = (id: string, name: IconName, label: string, value: string | number): Badge => ({
    id, icon: name, label, value: typeof value === "number" ? format.format(value) : value,
  });
  const repo = (id: string, name: IconName, label: string, value: ProfileStats["mostStarred"]): Badge => {
    const fullName = value?.name ?? "—";
    return { ...badge(id, name, label, fullName.length > 28 ? fullName.slice(0, 27) + "…" : fullName), description: `${label}: ${fullName}` };
  };
  const repositoryMetrics = [
    ["repository", "Repositories", "count"], ["star", "Stars", "stars"], ["fork", "Forks", "forks"],
    ["eye", "Watchers", "watchers"], ["template", "Templates", "templates"], ["archive", "Archived", "archived"],
  ] as const;
  return [
    { title: "General", badges: [
      badge("year-joined", "calendar", "Year joined", String(stats.joinedYear)),
      badge("followers", "users", "Followers", stats.followers), badge("following", "following", "Following", stats.following),
      repo("most-starred", "star", "Most starred", stats.mostStarred), repo("most-forked", "fork", "Most forked", stats.mostForked),
    ] },
    { title: "Repositories · Non-forks / All", badges: repositoryMetrics.map(([name, label, key]) => ({
      ...badge(`repo-${key}`, name, label, `${format.format(stats.repositories.nonForks[key])} / ${format.format(stats.repositories.all[key])}`),
      description: `${label}: ${stats.repositories.nonForks[key]} non-forks, ${stats.repositories.all[key]} including forks.`,
    })) },
    { title: "Contributions · Past year", badges: [
      badge("commits", "commit", "Commits", stats.commits), badge("pull-requests", "pullRequest", "Pull requests", stats.pullRequests),
      badge("issues", "issue", "Issues", stats.issues), badge("reviews", "review", "PR reviews", stats.reviews),
      badge("contributed-to", "contributed", "Contributed to", stats.contributedTo),
    ] },
  ];
}

function description(badge: Badge): string { return badge.description ?? (badge.value ? `${badge.label}: ${badge.value}` : badge.label); }

export function renderStatusMarkdown(): string {
  return '<p align="left">\n  <img alt="GitHub Stats: general information, repositories, past-year contributions, and language distribution" width="800" src="./assets/github-stats.svg" />\n</p>';
}

function frame(height: number): string {
  return `<rect x=".5" y=".5" width="799" height="${height - 1}" fill="${theme.background}" stroke="${theme.border}"/>`;
}

function header(title: string, subtitle: string, headerIcon: IconName): string {
  return icon(headerIcon, 24, 24, theme.foreground)
    + `<text x="50" y="37" class="heading">${escapeXml(title)}</text>`
    + `<text x="776" y="36" text-anchor="end" class="muted">${escapeXml(subtitle)}</text>`
    + `<path d="M24 56H776" stroke="${theme.border}"/>`;
}

// Skills keeps its flat badge layout inside the same frame used by Status.
export function renderCard(groups: BadgeGroup[], title: string, subtitle: string, headerIcon: IconName): string {
  let y = 86;
  const parts: string[] = [header(title, subtitle, headerIcon)];
  for (const [index, group] of groups.entries()) {
    if (index) parts.push(`<path d="M24 ${y - 23}H776" stroke="${theme.border}" stroke-opacity=".6"/>`);
    parts.push(`<text x="24" y="${y}" class="heading" style="font-size:14px">${escapeXml(group.title)}</text>`);
    y += 16;
    let x = 24;
    for (const badge of group.badges) {
      const width = badgeWidth(badge);
      if (x > 24 && x + width > 776) { x = 24; y += 26; }
      parts.push(`<g transform="translate(${x} ${y})">${badgeContent(badge)}</g>`);
      x += width + 4;
    }
    y += 64;
  }
  const height = y - 20;
  return document(800, height, title,
    subtitle + ". " + groups.map(group => group.title + ": " + group.badges.map(description).join(", ")).join(". "),
    frame(height) + parts.join("\n"));
}

function languageData(stats: ProfileStats) {
  const total = stats.languages.reduce((sum, language) => sum + language.bytes, 0);
  const entries = stats.languages.slice(0, 7).map(language => ({
    ...language, color: language.color && /^#[\da-f]{6}$/i.test(language.color) ? language.color : theme.languageFallback,
  }));
  const remaining = total - entries.reduce((sum, language) => sum + language.bytes, 0);
  if (remaining > 0) entries.push({ name: "Other", bytes: remaining, color: theme.languageFallback });
  return { total, entries };
}

function languageDescription(stats: ProfileStats): string {
  const { total, entries } = languageData(stats);
  return !total ? "No public language data yet." : entries.map(language => `${language.name}: ${(language.bytes / total * 100).toFixed(1)}%`).join(", ");
}

function languageSection(stats: ProfileStats, y: number): string {
  const { total, entries } = languageData(stats);
  const title = icon("code", 24, y - 12, theme.muted)
    + `<text x="48" y="${y}" class="heading" style="font-size:14px">Language distribution</text>`
    + `<text x="776" y="${y}" text-anchor="end" class="muted">By code size</text>`;
  if (!total) return title + `<text x="24" y="${y + 48}" class="muted">No public language data yet.</text>`;
  let x = 24;
  const segments = entries.map(language => {
    const width = language.bytes / total * 752;
    const segment = `<rect x="${x.toFixed(3)}" y="${y + 16}" width="${width.toFixed(3)}" height="10" fill="${language.color}"/>`;
    x += width;
    return segment;
  }).join("\n");
  const legend = entries.map((language, index) => {
    const x = 24 + index % 4 * 192;
    const baseline = y + 50 + Math.floor(index / 4) * 22;
    return `<circle cx="${x + 3}" cy="${baseline - 4}" r="3" fill="${language.color}"/>
      <svg x="${x + 13}" y="${baseline - 12}" width="120" height="16" viewBox="0 0 120 16"><text y="12">${escapeXml(language.name)}</text></svg>
      <text x="${x + 174}" y="${baseline}" text-anchor="end" class="muted">${(language.bytes / total * 100).toFixed(1)}%</text>`;
  }).join("\n");
  return `${title}
  <defs><clipPath id="language-bar"><rect x="24" y="${y + 16}" width="752" height="10" rx="5"/></clipPath></defs>
  <g clip-path="url(#language-bar)">${segments}</g>
  ${legend}`;
}

function shorten(value: string, maxWidth: number): string {
  if (textWidth(value) <= maxWidth) return value;
  while (value.length && textWidth(value + "…") > maxWidth) value = value.slice(0, -1);
  return value + "…";
}

export function renderStats(stats: ProfileStats): string {
  const groups = badgeGroups(stats);
  const headingIcons: IconName[] = ["user", "repository", "chart"];
  const columns = groups.map((group, index) => {
    const x = 24 + index * 260;
    const title = group.title.split(" · ")[0];
    let content = icon(headingIcons[index], x, 78, theme.muted)
      + `<text x="${x + 24}" y="90" class="heading" style="font-size:14px">${title}</text>`;
    if (index === 1) {
      content += '<text x="464" y="114" text-anchor="end" class="muted">Non-forks</text><text x="516" y="114" text-anchor="end" class="muted">All</text>';
    } else {
      content += `<text x="${index === 0 ? x + 24 : x + 232}" y="114"${index === 0 ? "" : ' text-anchor="end"'} class="muted">${index === 0 ? "Profile totals" : "Past year"}</text>`;
    }
    content += group.badges.map((badge, row) => {
      const y = 140 + row * 22;
      const label = icon(badge.icon, x, y - 12, theme.muted)
        + `<text x="${x + 24}" y="${y}" class="muted">${escapeXml(badge.label)}</text>`;
      if (index === 1) {
        const [nonForks, all] = badge.value.split(" / ");
        return label + `<text x="464" y="${y}" text-anchor="end" class="value">${nonForks}</text><text x="516" y="${y}" text-anchor="end" class="value">${all}</text>`;
      }
      return label + `<text x="${x + 232}" y="${y}" text-anchor="end" class="value">${escapeXml(shorten(badge.value, 116))}</text>`;
    }).join("\n");
    return `<g id="column-${index}" aria-label="${title}">${content}</g>`;
  }).join("\n");
  const desc = `${stats.login}. ` + groups.map(group => group.title + ": " + group.badges.map(description).join(", ")).join(". ")
    + ". Language distribution: " + languageDescription(stats);
  return document(800, 394, "GitHub Stats", desc, frame(394)
    + header("GitHub Stats", `@${stats.login}`, "chart")
    + `<path d="M270 78V252M530 78V252" stroke="${theme.border}" stroke-opacity=".65"/>`
    + columns
    + `<path d="M24 272H776" stroke="${theme.border}"/>` + languageSection(stats, 300));
}

export function renderLanguages(stats: ProfileStats): string {
  return document(800, 188, "Language distribution", languageDescription(stats), frame(188)
    + header("Language distribution", "Public repositories", "code") + languageSection(stats, 94));
}
