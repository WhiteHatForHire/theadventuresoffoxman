export type PickupDebugState = {
  collected: boolean;
  id: string;
};

export class PickupDebug {
  constructor(
    readonly id: string,
    private collectedValue = false,
  ) {}

  get collected(): boolean {
    return this.collectedValue;
  }

  collect(): void {
    this.collectedValue = true;
  }

  reset(): void {
    this.collectedValue = false;
  }

  debugState(): PickupDebugState {
    return {
      collected: this.collectedValue,
      id: this.id,
    };
  }
}
