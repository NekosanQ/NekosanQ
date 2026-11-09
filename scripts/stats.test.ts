import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchStats } from "./github.ts";
import type { ProfileStats } from "./github.ts";
import { renderLanguages, renderStats } from "./cards.ts";

const stats: ProfileStats = {
  login: "NekosanQ", joinedYear: 2022, following: 12, followers: 42,
  mostStarred: { name: "some-long-repository-name", count: 12 }, mostForked: null,
  repositories: {
    nonForks: { count: 3, stars: 12, forks: 1, watchers: 3, templates: 0, archived: 1 },
    all: { count: 4, stars: 15, forks: 2, watchers: 4, templates: 1, archived: 1 },
  },
  commits: 1234, pullRequests: 8, issues: 5, reviews: 2, contributedTo: 3,
  languages: [{ name: "TypeScript", bytes: 60, color: "#3178c6" }, { name: "C#", bytes: 40, color: "#178600" }],
};

function page(hasNextPage: boolean, endCursor: string | null, bytes: number, isFork = false) {
  return { data: { user: {
    login: "NekosanQ", createdAt: "2022-12-31T23:59:59Z", followers: { totalCount: 42 }, following: { totalCount: 12 },
    contributionsCollection: {
      totalCommitContributions: 1234,
      totalPullRequestContributions: 8,
      totalIssueContributions: 5,
      totalPullRequestReviewContributions: 2,
      totalRepositoriesWithContributedCommits: 3,
    },
    repositories: {
      pageInfo: { hasNextPage, endCursor },
      nodes: [{
        name: "repo", isFork, isArchived: true, isTemplate: false,
        stargazerCount: 6,
        forkCount: 2,
        watchers: { totalCount: 3 },
        languages: {
          pageInfo: { hasNextPage: false },
          edges: [{ size: bytes, node: { name: "TypeScript", color: "#3178c6" } }],
        },
      }],
    },
  } } };
}

test("aggregates stars and language bytes across repository pages without multiplying activity", async () => {
  const cursors: unknown[] = [];
  const request: typeof fetch = async (_url, options) => {
    const body = JSON.parse(String(options?.body));
    assert.match(body.query, /privacy: PUBLIC/);
    assert.match(body.query, /ownerAffiliations: \[OWNER\]/);
    cursors.push(body.variables.cursor);
    return Response.json(cursors.length === 1 ? page(true, "next", 60) : page(false, null, 40));
  };
  const result = await fetchStats("NekosanQ", "test-token", request);
  assert.deepEqual(cursors, [null, "next"]);
  assert.equal(result.repositories.nonForks.count, 2);
  assert.equal(result.repositories.nonForks.stars, 12);
  assert.equal(result.commits, 1234);
  assert.equal(result.joinedYear, 2022);
  assert.equal(result.following, 12);
  assert.equal(result.reviews, 2);
  assert.deepEqual(result.languages, [{ name: "TypeScript", bytes: 100, color: "#3178c6" }]);
});

test("counts forks in All while excluding them from language totals and top repositories", async () => {
  let calls = 0;
  const result = await fetchStats("NekosanQ", "test", async () => Response.json(
    ++calls === 1 ? page(true, "next", 60) : page(false, null, 9000, true),
  ));
  assert.deepEqual(result.repositories.nonForks, { count: 1, stars: 6, forks: 2, watchers: 3, templates: 0, archived: 1 });
  assert.deepEqual(result.repositories.all, { count: 2, stars: 12, forks: 4, watchers: 6, templates: 0, archived: 2 });
  assert.equal(result.languages[0].bytes, 60);
  assert.deepEqual(result.mostStarred, { name: "repo", count: 6 });
});

test("rejects HTTP errors and GraphQL partial data", async () => {
  await assert.rejects(fetchStats("NekosanQ", "test", async () => new Response(null, { status: 403 })), /HTTP 403/);
  await assert.rejects(fetchStats("NekosanQ", "test", async () => Response.json({
    ...page(false, null, 100), errors: [{ message: "rate limited" }],
  })), /rate limited/);
});

test("rejects missing users, invalid cursors and truncated language data", async () => {
  await assert.rejects(fetchStats("missing", "test", async () => Response.json({ data: { user: null } })), /not found/);
  await assert.rejects(fetchStats("NekosanQ", "test", async () => Response.json(page(true, null, 100))), /pagination cursor/);
  const truncated = page(false, null, 100);
  truncated.data.user.repositories.nodes[0].languages.pageInfo.hasNextPage = true;
  await assert.rejects(fetchStats("NekosanQ", "test", async () => Response.json(truncated)), /partial language total/);
});

test("escapes API strings and labels contribution windows", () => {
  const svg = renderStats({ ...stats, login: '<script>&"\'' });
  assert.ok(!svg.includes("<script>"));
  assert.ok(svg.includes("&lt;script&gt;&amp;&quot;&apos;"));
  assert.ok(svg.includes("1,234"));
  assert.ok(svg.includes("Past year"));
  assert.ok(svg.includes("Non-forks"));
  assert.ok(svg.includes("Language distribution"));
  assert.ok(svg.includes('fill="#0d1117"'));
  assert.ok(svg.includes('aria-labelledby="title description"'));
  assert.ok(renderLanguages({ ...stats, languages: [{ name: "C<&", bytes: 1, color: null }] }).includes("C&lt;&amp;"));
});

test("keeps percentages relative to all languages and combines the remainder into Other", () => {
  const svg = renderLanguages({ ...stats, languages: Array.from({ length: 10 }, (_, i) => ({ name: `Language ${i}`, bytes: 10, color: null })) });
  assert.equal((svg.match(/>10\.0%<\/text>/g) ?? []).length, 7);
  assert.ok(svg.includes(">30.0%</text>"));
  assert.ok(svg.includes(">Other</text>"));
  assert.ok(!svg.includes("Language 7"));
  const widths = [...svg.matchAll(/<rect x="[\d.]+" y="[\d.]+" width="([\d.]+)" height="10" fill="#[\da-f]{6}"\/>/gi)].map(match => Number(match[1]));
  assert.equal(widths.length, 8);
  assert.ok(Math.abs(widths.reduce((sum, width) => sum + width, 0) - 752) < 0.01);
  assert.ok(Math.abs(widths[7] - 225.6) < 0.01);
});

test("rejects unsafe color attributes from the API", () => {
  const svg = renderLanguages({ ...stats, languages: [{ name: "Test", bytes: 1, color: 'red" onload="alert(1)' }] });
  assert.ok(!svg.includes("onload"));
  assert.ok(svg.includes(">100.0%</text>"));
});

test("renders empty language data without NaN or invalid geometry", () => {
  const svg = renderLanguages({ ...stats, languages: [] });
  assert.ok(svg.includes("No public language data yet."));
  assert.doesNotMatch(svg, /NaN|Infinity/);
});
