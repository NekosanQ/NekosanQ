import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { fetchStats } from "./github.ts";
import { renderLanguages, renderStats, renderStatusMarkdown } from "./cards.ts";
import { renderSkills } from "./skills.ts";
import { renderIntro } from "./intro.ts";
import { renderLinkCards } from "./links.ts";

const login = process.env.PROFILE_USERNAME ?? "NekosanQ";
const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
if (!token) throw new Error("Set GH_TOKEN or GITHUB_TOKEN to read the GitHub GraphQL API.");

// Fetch everything before touching the existing cards: API failures keep the last good images.
const stats = await fetchStats(login, token);
const readmePath = new URL("../README.md", import.meta.url);
const readme = await readFile(readmePath, "utf8");
const start = "<!-- stats:start -->";
const end = "<!-- stats:end -->";
if (readme.split(start).length !== 2 || readme.split(end).length !== 2 || readme.indexOf(start) > readme.indexOf(end)) {
  throw new Error("README must contain exactly one ordered pair of stats:start / stats:end markers.");
}
const updatedReadme = readme.slice(0, readme.indexOf(start) + start.length)
  + "\n" + renderStatusMarkdown() + "\n"
  + readme.slice(readme.indexOf(end));
const directory = new URL("../assets/", import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL("intro.svg", directory), renderIntro(login));
await writeFile(new URL("github-stats.svg", directory), renderStats(stats));
await writeFile(new URL("top-languages.svg", directory), renderLanguages(stats));
await writeFile(new URL("skills.svg", directory), renderSkills());
for (const [file, svg] of Object.entries(renderLinkCards())) {
  await writeFile(new URL(file, directory), svg);
}
await writeFile(readmePath, updatedReadme);
console.log(`Generated profile cards for ${stats.login} in ${fileURLToPath(directory)}`);
