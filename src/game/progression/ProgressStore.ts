export type ProgressState = {
  deaths: number;
  kills: number;
  unlocks: string[];
};

const storageKey = "foxman.progress.v1";

const initialProgress: ProgressState = {
  deaths: 0,
  kills: 0,
  unlocks: [],
};

export class ProgressStore {
  load(): ProgressState {
    if (typeof window === "undefined" || !window.localStorage) {
      return { ...initialProgress };
    }

    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return { ...initialProgress };
    }

    try {
      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      return {
        deaths: Number(parsed.deaths ?? 0),
        kills: Number(parsed.kills ?? 0),
        unlocks: Array.isArray(parsed.unlocks) ? parsed.unlocks.filter(Boolean) : [],
      };
    } catch {
      return { ...initialProgress };
    }
  }

  addKill(): ProgressState {
    const next = this.load();
    next.kills += 1;
    return this.save(next);
  }

  addDeath(): ProgressState {
    const next = this.load();
    next.deaths += 1;
    return this.save(next);
  }

  unlock(id: string): ProgressState {
    const next = this.load();

    if (!next.unlocks.includes(id)) {
      next.unlocks.push(id);
    }

    return this.save(next);
  }

  private save(state: ProgressState): ProgressState {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    }

    return state;
  }
}
