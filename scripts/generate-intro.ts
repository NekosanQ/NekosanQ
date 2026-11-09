import { mkdir, writeFile } from "node:fs/promises";
import { renderIntro } from "./intro.ts";

const directory = new URL("../assets/", import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL("intro.svg", directory), renderIntro(process.env.PROFILE_USERNAME ?? "NekosanQ"));
console.log("Generated Linux login introduction.");
