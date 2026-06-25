export type AudioCue =
  | "pickup"
  | "player-hit"
  | "enemy-hit"
  | "enemy-dead"
  | "exit-unlocked"
  | "room-complete";

export class AudioBus {
  private lastCue: AudioCue | undefined;

  play(cue: AudioCue): void {
    this.lastCue = cue;

    if (typeof document !== "undefined") {
      document.body.dataset.lastAudioCue = cue;
    }
  }

  debugState(): { lastCue?: AudioCue } {
    return { lastCue: this.lastCue };
  }
}
