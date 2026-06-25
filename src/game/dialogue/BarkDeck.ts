export type BarkTrigger = "pickup" | "enemy-dead" | "player-hit" | "room-complete";

type BarkEntry = {
  trigger: BarkTrigger;
  line: string;
};

const BARK_COOLDOWN_MS = 1700;

const barks: BarkEntry[] = [
  { trigger: "pickup", line: "I stole the saber. I am the economy now." },
  { trigger: "enemy-dead", line: "That was medicinal violence." },
  { trigger: "player-hit", line: "Oi. I needed those ribs for swagger." },
  { trigger: "room-complete", line: "Lovely. Another public service nobody asked for." },
];

export class BarkDeck {
  private nextBarkAt = 0;

  trySpeak(trigger: BarkTrigger, time: number): string | undefined {
    if (time < this.nextBarkAt) {
      return undefined;
    }

    const line = barks.find((candidate) => candidate.trigger === trigger)?.line;

    if (!line) {
      return undefined;
    }

    this.nextBarkAt = time + BARK_COOLDOWN_MS;
    return line;
  }

  reset(): void {
    this.nextBarkAt = 0;
  }
}
