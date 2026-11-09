import { mkdir, writeFile } from "node:fs/promises";
import { renderLinkCards } from "./links.ts";

const directory = new URL("../assets/", import.meta.url);
await mkdir(directory, { recursive: true });
for (const [file, svg] of Object.entries(renderLinkCards())) {
  await writeFile(new URL(file, directory), svg);
}
console.log("Generated Website and Twitter link cards.");
