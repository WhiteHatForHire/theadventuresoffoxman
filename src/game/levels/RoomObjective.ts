export type RoomObjectiveState = {
  exitUnlocked: boolean;
  complete: boolean;
};

export class RoomObjective {
  private unlocked = false;
  private completed = false;

  update(requirementsMet: boolean): void {
    if (requirementsMet) {
      this.unlocked = true;
    }
  }

  complete(): void {
    if (this.unlocked) {
      this.completed = true;
    }
  }

  reset(): void {
    this.unlocked = false;
    this.completed = false;
  }

  debugState(): RoomObjectiveState {
    return {
      exitUnlocked: this.unlocked,
      complete: this.completed,
    };
  }
}
