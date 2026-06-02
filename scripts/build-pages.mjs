#!/usr/bin/env node
import { copyFile, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const DIST = join(ROOT, "dist");
const APP = join(ROOT, "number-trainer");
const skipAudioCache = process.env.SKIP_AUDIO_CACHE === "1";

async function copy(from, to) {
  await mkdir(dirname(to), { recursive: true });
  await copyFile(from, to);
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

await copy(join(APP, "index.html"), join(DIST, "index.html"));
await copy(join(APP, "_headers"), join(DIST, "_headers"));

const localAudioCache = join(APP, "audio-cache.js");
if (!skipAudioCache && await exists(localAudioCache)) {
  await copy(localAudioCache, join(DIST, "audio-cache.js"));
} else {
  const emptyCache = {
    source: "browser-tts-fallback",
    generatedAt: null,
    language: "fr-FR",
    range: [0, 100],
    variantsPerNumber: 0,
    items: {}
  };
  await writeFile(
    join(DIST, "audio-cache.js"),
    `window.LANGPRACTICE_AUDIO_CACHE = ${JSON.stringify(emptyCache)};\n`,
    "utf8"
  );
}

console.log(`Built ${DIST}`);
