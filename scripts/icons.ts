// Inline line icons keep the SVG self-contained in GitHub's image renderer.
const paths = {
  user: '<circle cx="8" cy="5" r="2.5"/><path d="M3 14v-1a5 5 0 0 1 10 0v1"/>',
  users: '<circle cx="6" cy="5" r="2.2"/><path d="M1.5 14v-1a4.5 4.5 0 0 1 9 0v1M11 3a2.2 2.2 0 0 1 0 4.4M12 9a4 4 0 0 1 2.5 4v1"/>',
  following: '<circle cx="6" cy="5" r="2.2"/><path d="M1.5 14v-1a4.5 4.5 0 0 1 9 0v1M13 4v5M10.5 6.5h5"/>',
  calendar: '<rect x="2" y="3" width="12" height="11" rx="1"/><path d="M5 1.5v3M11 1.5v3M2 7h12"/>',
  repository: '<rect x="3" y="1.5" width="10" height="12" rx="1"/><path d="M3 10.5h10M6 13.5v2l2-1 2 1v-2"/>',
  star: '<path d="m8 1 2.1 4.3 4.8.7-3.5 3.4.8 4.8L8 12l-4.2 2.2.8-4.8L1.1 6l4.8-.7Z"/>',
  fork: '<circle cx="4" cy="3" r="1.5"/><circle cx="12" cy="3" r="1.5"/><circle cx="8" cy="13" r="1.5"/><path d="M4 4.5v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2M8 8.5v3"/>',
  eye: '<path d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8Z"/><circle cx="8" cy="8" r="2"/>',
  template: '<rect x="2" y="2" width="12" height="12" rx="1" stroke-dasharray="2 2"/><path d="M5 6h6M8 6v5"/>',
  archive: '<path d="M2 5h12v9H2zM1 2h14v3H1zM6 8h4"/>',
  chart: '<path d="M2 1v13h13M4 10l3-4 3 2 4-5"/>',
  commit: '<circle cx="8" cy="8" r="3"/><path d="M1 8h4M11 8h4"/>',
  issue: '<circle cx="8" cy="8" r="6"/><path d="M8 4.5v4M8 11h.01"/>',
  pullRequest: '<circle cx="4" cy="3" r="1.5"/><circle cx="4" cy="13" r="1.5"/><circle cx="12" cy="13" r="1.5"/><path d="M4 4.5v7M12 11.5V6a3 3 0 0 0-3-3H8m2-2L8 3l2 2"/>',
  review: '<path d="M2 2h12v9H7l-4 3v-3H2zM5 6l2 2 4-4"/>',
  contributed: '<path d="M3 13H1V2h10v3M7 9h8M11 5v8M5 15h10"/>',
  code: '<path d="m5 4-4 4 4 4M11 4l4 4-4 4M9 2 7 14"/>',
  cloud: '<path d="M4.5 12.5a3.5 3.5 0 1 1 .4-7 4.5 4.5 0 0 1 8.6 2 2.5 2.5 0 0 1-.5 5Z"/>',
  server: '<rect x="2" y="1.5" width="12" height="5" rx="1"/><rect x="2" y="9.5" width="12" height="5" rx="1"/><path d="M5 4h.01M5 12h.01M9 4h2M9 12h2"/>',
  terminal: '<rect x="1" y="2" width="14" height="12" rx="1"/><path d="m4 6 2 2-2 2M8 11h4"/>',
  gauge: '<path d="M2 13a7 7 0 1 1 12 0ZM8 9l3-4M3 7h1M12 7h1M8 2v1"/><circle cx="8" cy="9" r="1"/>',
  database: '<ellipse cx="8" cy="3.5" rx="6" ry="2"/><path d="M2 3.5v9c0 2.7 12 2.7 12 0v-9M2 8c0 2.7 12 2.7 12 0"/>',
} as const;

export type IconName = keyof typeof paths;

export function icon(name: IconName, x: number, y: number, color = "#a3adbf"): string {
  return `<g transform="translate(${x} ${y})" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</g>`;
}
