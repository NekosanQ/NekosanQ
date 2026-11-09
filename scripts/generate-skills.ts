import { writeFile, mkdir } from "node:fs/promises";
import { renderSkills } from "./skills.ts";

const directory = new URL("../assets/", import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL("skills.svg", directory), renderSkills());
console.log("Generated Skills card.");
