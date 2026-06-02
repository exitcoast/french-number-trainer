#!/usr/bin/env node
import { writeFile } from "node:fs/promises";

const MIN = 0;
const MAX = 100;
const VARIANTS_PER_NUMBER = Number.parseInt(process.argv[2] || "3", 10);
const DELAY_MS = Number.parseInt(process.argv[3] || "160", 10);
const API_BASE = "https://langpractice.com/api/newnumber/french/1";
const OUTPUT = new URL("./audio-cache.js", import.meta.url);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function narrowRangeFor(number) {
  if (number === MIN) return [0, 1];
  if (number === MAX) return [99, 100];
  return [number, number + 1];
}

async function fetchCandidate(number) {
  const [min, max] = narrowRangeFor(number);
  const response = await fetch(`${API_BASE}/${min}/${max}`, {
    headers: {
      "accept": "application/json",
      "user-agent": "Greg local French number trainer cache builder"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${min}-${max}`);
  }

  return response.json();
}

async function collectNumber(number) {
  const variants = new Map();
  let tries = 0;
  const maxTries = Math.max(10, VARIANTS_PER_NUMBER * 8);

  while (variants.size < VARIANTS_PER_NUMBER && tries < maxTries) {
    tries += 1;
    const data = await fetchCandidate(number);
    if (data.n === number && data.audio_data) {
      variants.set(data.audio_data, {
        audio: data.audio_data,
        written: data.target?.written || "",
        phonetic: data.target?.phonetic || ""
      });
    }
    await sleep(DELAY_MS);
  }

  return [...variants.values()];
}

const items = {};
for (let number = MIN; number <= MAX; number += 1) {
  const variants = await collectNumber(number);
  items[number] = variants.map((variant) => variant.audio);
  const label = variants.length === 1 ? "variant" : "variants";
  console.log(`${String(number).padStart(3, " ")}: ${variants.length} ${label}`);
}

const payload = {
  source: "https://langpractice.com/french/numbers/listening",
  generatedAt: new Date().toISOString(),
  language: "fr-FR",
  range: [MIN, MAX],
  variantsPerNumber: VARIANTS_PER_NUMBER,
  items
};

const js = `window.LANGPRACTICE_AUDIO_CACHE = ${JSON.stringify(payload)};\n`;
await writeFile(OUTPUT, js, "utf8");
console.log(`Saved ${OUTPUT.pathname}`);
