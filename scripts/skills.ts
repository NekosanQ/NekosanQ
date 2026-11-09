import {
  siTypescript, siJavascript, siPython, siC, siSharp, siOpenjdk, siKotlin, siHtml5, siCss, siGnubash,
  siNodedotjs, siDiscorddotjs, siReact, siNextdotjs, siBootstrap, siPrisma, siMysql, siSqlite, siRedis,
  siLinux, siUbuntu, siDocker, siNginx, siProxmox, siCloudflare, siTailscale, siWireguard,
  siGrafana, siGit, siGithub, siGithubactions, siNotion, siObsidian, siDiagramsdotnet, siSteam,
} from "simple-icons";
import { renderCard } from "./cards.ts";
import type { Badge, BadgeGroup } from "./cards.ts";
import type { IconName } from "./icons.ts";

type Skill = { name: string; logo?: { path: string }; icon?: IconName };
const groups: { title: string; skills: Skill[] }[] = [
  { title: "Languages", skills: [
    { name: "TypeScript", logo: siTypescript }, { name: "JavaScript", logo: siJavascript },
    { name: "Python", logo: siPython }, { name: "C", logo: siC }, { name: "C#", logo: siSharp },
    { name: "Java", logo: siOpenjdk }, { name: "Kotlin", logo: siKotlin },
    { name: "HTML5", logo: siHtml5 }, { name: "CSS3", logo: siCss }, { name: "Bash", logo: siGnubash },
  ] },
  { title: "Frameworks & Databases", skills: [
    { name: "Node.js", logo: siNodedotjs }, { name: "Discord.js", logo: siDiscorddotjs },
    { name: "React", logo: siReact }, { name: "Next.js", logo: siNextdotjs }, { name: "Bootstrap", logo: siBootstrap },
    { name: "Prisma", logo: siPrisma }, { name: "MySQL", logo: siMysql }, { name: "SQLite", logo: siSqlite }, { name: "Redis", logo: siRedis },
  ] },
  { title: "Infrastructure & Cloud", skills: [
    { name: "Linux", logo: siLinux }, { name: "Ubuntu", logo: siUbuntu },
    { name: "Docker", logo: siDocker }, { name: "Docker Compose", logo: siDocker },
    { name: "Nginx", logo: siNginx },
    { name: "Proxmox VE", logo: siProxmox }, { name: "KVM", icon: "server" },
    { name: "systemd", logo: siLinux }, { name: "Cloudflare", logo: siCloudflare },
    { name: "Cloudflare Tunnel", logo: siCloudflare }, { name: "AWS", icon: "cloud" },
    { name: "Oracle Cloud", icon: "database" }, { name: "Tailscale", logo: siTailscale }, { name: "WireGuard", logo: siWireguard },
  ] },
  { title: "Monitoring & Tools", skills: [
    { name: "Grafana", logo: siGrafana }, { name: "Grafana Alloy", logo: siGrafana },
    { name: "Zabbix", icon: "gauge" },
    { name: "VictoriaMetrics", icon: "gauge" }, { name: "Git", logo: siGit }, { name: "GitHub", logo: siGithub },
    { name: "GitHub Actions", logo: siGithubactions },
    { name: "VS Code", icon: "code" }, { name: "Notion", logo: siNotion },
    { name: "Obsidian", logo: siObsidian }, { name: "draw.io", logo: siDiagramsdotnet }, { name: "SteamCMD", logo: siSteam },
  ] },
];

export function renderSkills(): string {
  const badgeGroups: BadgeGroup[] = groups.map(group => ({
    title: group.title,
    badges: group.skills.map((skill, index): Badge => ({
      id: `${group.title}-${index}`, label: skill.name, value: "", icon: skill.icon ?? "code", logo: skill.logo?.path,
    })),
  }));
  return renderCard(badgeGroups, "Skills", `${groups.reduce((sum, group) => sum + group.skills.length, 0)} technologies`, "code");
}
