import assert from "node:assert/strict";

await import("../number-trainer/stats-validation.js");

const validation = globalThis.NumberTrainerStatsValidation;
const NUMBERS = Array.from({ length: 101 }, (_, index) => index);
const fixedNow = new Date("2026-06-02T00:00:00.000Z");
const defaultState = () => validation.createDefaultState(NUMBERS, fixedNow);

function normalize(candidate) {
  return validation.normalizeState(candidate, NUMBERS, defaultState);
}

{
  const state = normalize({
    version: 1,
    createdAt: "2026-06-01T10:00:00.000Z",
    stats: {
      12: {
        attempts: 5,
        correct: 4,
        wrong: 1,
        reveals: 1,
        slow: 2,
        replays: 3,
        totalMs: 9500,
        lastSeen: "2026-06-01T11:00:00.000Z"
      }
    }
  });

  assert.equal(state.version, 1);
  assert.equal(state.createdAt, "2026-06-01T10:00:00.000Z");
  assert.equal(state.stats[12].attempts, 5);
  assert.equal(state.stats[12].correct, 4);
  assert.equal(state.stats[12].lastSeen, "2026-06-01T11:00:00.000Z");
}

{
  const state = normalize({
    stats: {
      7: {
        attempts: "<script>alert(1)</script>",
        correct: "<img src=x onerror=alert(1)>",
        wrong: -5,
        reveals: 99,
        slow: 99,
        replays: "Infinity",
        totalMs: Number.POSITIVE_INFINITY,
        lastSeen: "not a date"
      }
    }
  });

  assert.equal(state.stats[7].attempts, 0);
  assert.equal(state.stats[7].correct, 0);
  assert.equal(state.stats[7].wrong, 0);
  assert.equal(state.stats[7].reveals, 0);
  assert.equal(state.stats[7].slow, 0);
  assert.equal(state.stats[7].replays, 0);
  assert.equal(state.stats[7].totalMs, 0);
  assert.equal(state.stats[7].lastSeen, null);
}

{
  const state = normalize({
    stats: {
      42: {
        attempts: 1_000_000_000,
        correct: 1_000_000_000,
        wrong: 1_000_000_000,
        reveals: 1_000_000_000,
        slow: 1_000_000_000,
        pauses: 1_000_000_000,
        totalMs: 1_000_000_000
      },
      101: {
        attempts: 10
      }
    }
  });

  assert.equal(state.stats[42].attempts, validation.MAX_STAT_VALUE);
  assert.equal(state.stats[42].correct, validation.MAX_STAT_VALUE);
  assert.equal(state.stats[42].wrong, validation.MAX_STAT_VALUE);
  assert.equal(state.stats[42].reveals, validation.MAX_STAT_VALUE);
  assert.equal(state.stats[42].slow, validation.MAX_STAT_VALUE);
  assert.equal(state.stats[42].pauses, validation.MAX_STAT_VALUE);
  assert.equal(state.stats[42].totalMs, validation.MAX_STAT_VALUE);
  assert.equal(state.stats[101], undefined);
}

{
  const malicious = JSON.parse('{"stats":{"0":{"attempts":1},"__proto__":{"polluted":true}}}');
  normalize(malicious);
  assert.equal({}.polluted, undefined);
}

assert.throws(() => normalize(null), /Nieprawidłowy format/);
assert.throws(() => normalize({}), /Brak pola stats/);
assert.throws(() => normalize({ stats: [] }), /Brak pola stats/);

console.log("Security import validation tests passed");
