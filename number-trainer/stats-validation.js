(function defineStatsValidation(global) {
  const MAX_IMPORT_BYTES = 128 * 1024;
  const MAX_STAT_VALUE = 100000;
  const STAT_NUMBER_FIELDS = ["attempts", "correct", "wrong", "reveals", "slow", "replays", "totalMs", "pauses"];

  function createDefaultState(numbers, now = new Date()) {
    const stats = {};
    for (const number of numbers) {
      stats[number] = {
        attempts: 0,
        correct: 0,
        wrong: 0,
        reveals: 0,
        slow: 0,
        replays: 0,
        totalMs: 0,
        lastSeen: null
      };
    }
    return { version: 1, createdAt: now.toISOString(), stats };
  }

  function clampInteger(value, min = 0, max = MAX_STAT_VALUE) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return min;
    return Math.min(max, Math.max(min, Math.trunc(parsed)));
  }

  function normalizeDate(value) {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value !== "string" || value.length > 40) return null;
    const time = Date.parse(value);
    return Number.isFinite(time) ? new Date(time).toISOString() : null;
  }

  function normalizeStatsRecord(record = {}) {
    const clean = {
      attempts: 0,
      correct: 0,
      wrong: 0,
      reveals: 0,
      slow: 0,
      replays: 0,
      totalMs: 0,
      lastSeen: null
    };

    if (!record || typeof record !== "object" || Array.isArray(record)) return clean;

    for (const field of STAT_NUMBER_FIELDS) {
      if (field in record) clean[field] = clampInteger(record[field]);
    }

    clean.correct = Math.min(clean.correct, clean.attempts);
    clean.wrong = Math.min(clean.wrong, clean.attempts);
    clean.reveals = Math.min(clean.reveals, clean.wrong);
    clean.slow = Math.min(clean.slow, clean.correct);
    clean.pauses = Math.min(clean.pauses || 0, clean.attempts);
    clean.lastSeen = normalizeDate(record.lastSeen);
    return clean;
  }

  function normalizeState(candidate, numbers, defaultStateFactory) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      throw new Error("Nieprawidłowy format pliku");
    }
    if (!candidate.stats || typeof candidate.stats !== "object" || Array.isArray(candidate.stats)) {
      throw new Error("Brak pola stats");
    }

    const fresh = typeof defaultStateFactory === "function"
      ? defaultStateFactory()
      : createDefaultState(numbers);
    const cleanStats = {};
    for (const number of numbers) {
      cleanStats[number] = normalizeStatsRecord(candidate.stats[number]);
    }

    return {
      version: 1,
      createdAt: normalizeDate(candidate.createdAt) || fresh.createdAt,
      stats: cleanStats
    };
  }

  global.NumberTrainerStatsValidation = {
    MAX_IMPORT_BYTES,
    MAX_STAT_VALUE,
    createDefaultState,
    clampInteger,
    normalizeDate,
    normalizeStatsRecord,
    normalizeState
  };
})(globalThis);
