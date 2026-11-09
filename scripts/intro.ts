import { document, escapeXml, frame } from "./cards.ts";

const japanDate = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Tokyo", year: "numeric", month: "numeric", day: "numeric",
});

export function calculateAge(now = new Date()): number {
  const parts = japanDate.formatToParts(now);
  const part = (type: string) => Number(parts.find(value => value.type === type)!.value);
  const year = part("year");
  const month = part("month");
  const day = part("day");
  // Born on January 11, 2007; increment only once that birthday has arrived in Japan.
  return year - 2007 - Number(month === 1 && day < 11);
}

export function renderIntro(login = "NekosanQ", now = new Date()): string {
  const user = login.toLowerCase();
  const host = `${user}@github`;
  const prompt = `<tspan class="prompt">${escapeXml(host)}</tspan>:~$`;
  const greeting = "Hello World!!";
  const about = "I'm a student with many hobbies...";
  const philosophy = "Dopagaki Driven Development";
  const support = "I love DDD!";
  const command = "curl -fsSL https://chatgpt.com/codex/install.sh | sh";
  // Illustrative output based on the installer transcript supplied by the user.
  const installLogs = [
    { text: "==> Installing Codex CLI", delay: 3.9 },
    { text: "==> Downloading Codex CLI", delay: 4.4 },
    { text: "Codex CLI installed successfully.", delay: 5.5 },
  ];
  const confirmationY = 448 + installLogs.length * 20;
  const promptY = confirmationY + 62;
  const height = promptY + 24;
  const logOutput = installLogs.map((line, index) =>
    `<text x="24" y="${448 + index * 20}" class="terminal install-output install-step" data-install-log="${index}" style="animation-delay:${line.delay}s">${escapeXml(line.text)}</text>`
  ).join("\n");
  // Fixed monospace cells keep the typing mask and cursor aligned across fallback fonts.
  const cellWidth = 7.8;
  const promptWidth = (`${host}:~$ `.length * cellWidth).toFixed(1);
  const commandWidth = (command.length * cellWidth).toFixed(1);
  const lineWidth = ((`${host}:~$ `.length + command.length) * cellWidth).toFixed(1);
  const age = calculateAge(now);
  return document(800, height, "Linux login introduction", `Welcome to my GitHub profile! ${login}. Age: ${age}. Country: Oita, Japan. Language: Japanese, English (almost read-only). Likes: Rack-mounted equipment. ${greeting} ${about} DDD: ${philosophy}. ${support} Illustrated terminal sequence: ${command}. Codex CLI installation, followed by the launch confirmation and a fresh prompt.`, frame(height)
    + `<style>
      .terminal { font: 13px "Ubuntu Mono", "Cascadia Code", Consolas, "Liberation Mono", monospace; }
      .terminal { font-variant-ligatures: none; }
      .welcome, .greeting { font-size: 14px; font-weight: 600; }
      .prompt { fill: #3fb950; font-weight: 600; }
      .ddd-name { fill: #f778ba; }
      .install-command-reveal { animation: type-command 3s steps(${command.length}, end) .7s both; }
      .install-cursor { opacity: 0; animation: command-cursor 3s steps(${command.length}, end) .7s both; }
      .install-step { opacity: 1; animation: show-install-step .12s linear both; }
      .install-output { font-size: 12px; }
      .install-confirm { animation-delay: 5.9s; }
      .install-answer { animation-delay: 6.6s; }
      .install-launch { animation-delay: 7s; }
      .install-finished { animation-delay: 7.4s; }
      .ready-cursor { animation: blink-cursor .9s step-end infinite; }
      @keyframes type-command { from { width: ${promptWidth}px; } to { width: ${lineWidth}px; } }
      @keyframes command-cursor {
        0% { transform: translateX(0); opacity: 1; }
        99% { opacity: 1; }
        100% { transform: translateX(${commandWidth}px); opacity: 0; }
      }
      @keyframes show-install-step { from { opacity: 0; } to { opacity: 1; } }
      @keyframes blink-cursor { 50% { opacity: 0; } }
      @media (prefers-reduced-motion: reduce) {
        .install-command-reveal, .install-cursor, .install-step, .ready-cursor { animation: none; }
        .install-cursor { opacity: 0; }
      }
    </style>
    <g class="terminal">
      <text x="24" y="38" class="terminal welcome">Welcome to my GitHub profile!</text>

      <text x="32" y="78" class="terminal">* Website:  https://nekosanq.net</text>
      <text x="32" y="100" class="terminal">* GitHub:   https://github.com/${escapeXml(login)}</text>

      <text x="32" y="142" class="terminal">Profile information:</text>
      <text x="40" y="176" class="terminal">Name:</text>
      <text x="144" y="176" class="terminal">${escapeXml(login)}</text>
      <text x="416" y="176" class="terminal">Role:</text>
      <text x="528" y="176" class="terminal">Student</text>
      <text x="40" y="198" class="terminal">Country:</text>
      <text x="144" y="198" class="terminal">Oita, Japan</text>
      <text x="416" y="198" class="terminal">Age:</text>
      <text x="528" y="198" class="terminal">${age}</text>
      <text x="40" y="220" class="terminal">Language:</text>
      <text x="144" y="220" class="terminal">Japanese,</text>
      <text x="144" y="242" class="terminal">English (almost read-only)</text>
      <text x="416" y="220" class="terminal">Likes:</text>
      <text x="528" y="220" class="terminal">Rack-mounted equipment</text>

      <text x="24" y="288" class="terminal greeting">${escapeXml(greeting)}</text>
      <text x="24" y="312" class="terminal">${escapeXml(about)}</text>

      <text x="24" y="350" class="terminal welcome">DDD: <tspan class="ddd-name">${escapeXml(philosophy)}</tspan></text>
      <text x="24" y="376" class="terminal">${escapeXml(support)}</text>

      <defs>
        <clipPath id="install-command-clip">
          <rect x="24" y="402" width="${lineWidth}" height="22" class="install-command-reveal"/>
        </clipPath>
      </defs>
      <g clip-path="url(#install-command-clip)">
        <text x="24" y="418" class="terminal" textLength="${lineWidth}" lengthAdjust="spacingAndGlyphs">${prompt} ${escapeXml(command)}</text>
      </g>
      <rect x="${(24 + Number(promptWidth)).toFixed(1)}" y="405" width="7" height="15" fill="#e6edf3" class="install-cursor" aria-hidden="true"/>
      ${logOutput}
      <text x="24" y="${confirmationY}" class="terminal install-output install-step install-confirm">Start Codex now? [y/N] <tspan class="install-step install-answer">y</tspan></text>
      <text x="24" y="${confirmationY + 24}" class="terminal install-output install-step install-launch">==&gt; Launching Codex</text>
      <text x="24" y="${promptY}" class="terminal install-step install-finished">${prompt} <tspan class="ready-cursor" aria-hidden="true">▍</tspan></text>
    </g>`);
}
