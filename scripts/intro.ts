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
  const age = calculateAge(now);
  return document(800, 374, "Linux login introduction", `Welcome to my GitHub profile! ${login}. Age: ${age}. Country: Oita, Japan. Language: Japanese, English (almost read-only). Likes: Rack-mounted equipment. ${greeting} ${about}`, frame(374)
    + `<style>
      .terminal { font: 13px "Ubuntu Mono", "Cascadia Code", Consolas, "Liberation Mono", monospace; }
      .welcome, .greeting { font-size: 14px; font-weight: 600; }
      .prompt { fill: #3fb950; font-weight: 600; }
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

      <text x="24" y="350" class="terminal">${prompt} <tspan aria-hidden="true">▍</tspan></text>
    </g>`);
}
