export interface Language {
  name: string;
  bytes: number;
  color: string | null;
}

export interface RepositoryTotals {
  count: number;
  stars: number;
  forks: number;
  watchers: number;
  templates: number;
  archived: number;
}

export interface ProfileStats {
  login: string;
  joinedYear: number;
  following: number;
  mostStarred: { name: string; count: number } | null;
  mostForked: { name: string; count: number } | null;
  repositories: { nonForks: RepositoryTotals; all: RepositoryTotals };
  followers: number;
  commits: number;
  pullRequests: number;
  issues: number;
  reviews: number;
  contributedTo: number;
  languages: Language[];
}

interface RepositoryPage {
  user: null | {
    login: string;
    createdAt: string;
    followers: { totalCount: number };
    following: { totalCount: number };
    contributionsCollection: {
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalIssueContributions: number;
      totalPullRequestReviewContributions: number;
      totalRepositoriesWithContributedCommits: number;
    };
    repositories: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: {
        name: string;
        isFork: boolean;
        isArchived: boolean;
        isTemplate: boolean;
        stargazerCount: number;
        forkCount: number;
        watchers: { totalCount: number };
        languages: {
          pageInfo: { hasNextPage: boolean };
          edges: { size: number; node: { name: string; color: string | null } }[];
        };
      }[];
    };
  };
}

const query = `
  query ProfileStats($login: String!, $cursor: String) {
    user(login: $login) {
      login
      createdAt
      followers { totalCount }
      following { totalCount }
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalPullRequestReviewContributions
        totalRepositoriesWithContributedCommits
      }
      repositories(first: 100, after: $cursor, privacy: PUBLIC,
        ownerAffiliations: [OWNER],
        orderBy: {field: NAME, direction: ASC}) {
        pageInfo { hasNextPage endCursor }
        nodes {
          name
          isFork
          isArchived
          isTemplate
          stargazerCount
          forkCount
          watchers { totalCount }
          languages(first: 100) {
            pageInfo { hasNextPage }
            edges { size node { name color } }
          }
        }
      }
    }
  }
`;

export async function fetchStats(
  login: string,
  token: string,
  request: typeof fetch = fetch,
): Promise<ProfileStats> {
  let cursor: string | null = null;
  const languages = new Map<string, Language>();
  const emptyTotals = (): RepositoryTotals => ({ count: 0, stars: 0, forks: 0, watchers: 0, templates: 0, archived: 0 });
  const stats: ProfileStats = {
    login, joinedYear: 0, following: 0, mostStarred: null, mostForked: null,
    repositories: { nonForks: emptyTotals(), all: emptyTotals() }, followers: 0,
    commits: 0, pullRequests: 0, issues: 0, reviews: 0, contributedTo: 0, languages: [],
  };

  do {
    const response = await request("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "nekosanq-profile-cards",
      },
      body: JSON.stringify({ query, variables: { login, cursor } }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new Error(`GitHub API returned HTTP ${response.status}`);
    }
    const result = await response.json() as {
      data?: RepositoryPage;
      errors?: { message: string }[];
    };
    if (result.errors?.length) {
      throw new Error(`GitHub GraphQL: ${result.errors.map(error => error.message).join("; ")}`);
    }
    const user = result.data?.user;
    if (!user) throw new Error(`GitHub user not found: ${login}`);

    stats.login = user.login;
    stats.joinedYear = new Date(user.createdAt).getUTCFullYear();
    stats.followers = user.followers.totalCount;
    stats.following = user.following.totalCount;
    stats.commits = user.contributionsCollection.totalCommitContributions;
    stats.pullRequests = user.contributionsCollection.totalPullRequestContributions;
    stats.issues = user.contributionsCollection.totalIssueContributions;
    stats.reviews = user.contributionsCollection.totalPullRequestReviewContributions;
    stats.contributedTo = user.contributionsCollection.totalRepositoriesWithContributedCommits;
    for (const repo of user.repositories.nodes) {
      for (const totals of repo.isFork ? [stats.repositories.all] : [stats.repositories.all, stats.repositories.nonForks]) {
        totals.count++;
        totals.stars += repo.stargazerCount;
        totals.forks += repo.forkCount;
        totals.watchers += repo.watchers.totalCount;
        totals.templates += Number(repo.isTemplate);
        totals.archived += Number(repo.isArchived);
      }
      if (repo.isFork) continue;
      if (repo.stargazerCount > (stats.mostStarred?.count ?? 0)) stats.mostStarred = { name: repo.name, count: repo.stargazerCount };
      if (repo.forkCount > (stats.mostForked?.count ?? 0)) stats.mostForked = { name: repo.name, count: repo.forkCount };
      if (repo.languages.pageInfo.hasNextPage) {
        throw new Error("A repository has more than 100 languages; refusing a partial language total.");
      }
      for (const { size, node } of repo.languages.edges) {
        const previous = languages.get(node.name);
        languages.set(node.name, { name: node.name, bytes: (previous?.bytes ?? 0) + size, color: node.color });
      }
    }
    const page = user.repositories.pageInfo;
    if (page.hasNextPage && (!page.endCursor || page.endCursor === cursor)) {
      throw new Error("GitHub returned an invalid repository pagination cursor.");
    }
    cursor = page.hasNextPage ? page.endCursor : null;
  } while (cursor);

  stats.languages = [...languages.values()]
    .filter(language => language.bytes > 0)
    .sort((a, b) => b.bytes - a.bytes || a.name.localeCompare(b.name, "en"));
  return stats;
}
