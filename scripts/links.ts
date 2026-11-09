import { siX } from "simple-icons";
import { document, escapeXml, frame, header, theme } from "./cards.ts";
import { icon } from "./icons.ts";
import type { IconName } from "./icons.ts";

const links: { file: string; title: string; label: string; icon: IconName; logo?: string }[] = [
  { file: "link-website.svg", title: "Website", label: "nekosanq.net", icon: "globe" },
  { file: "link-twitter.svg", title: "Twitter / X", label: "@nekosanq_ts", icon: "user", logo: siX.path },
];

export function renderLinkCards(): Record<string, string> {
  const width = 396;
  const height = 110;
  return Object.fromEntries(links.map(link => [link.file, document(width, height,
    link.title, `${link.title}: ${link.label}. Open the linked profile.`,
    frame(height, width)
    + header(link.title, "", link.icon, link.logo, width)
    + icon("externalLink", width - 40, 24, theme.foreground)
    + `<text x="24" y="84" style="font-size:12px">${escapeXml(link.label)}</text>`),
  ]));
}
