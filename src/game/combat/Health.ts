export class Health {
  private currentValue: number;

  constructor(readonly max: number) {
    this.currentValue = max;
  }

  get current(): number {
    return this.currentValue;
  }

  get alive(): boolean {
    return this.currentValue > 0;
  }

  damage(amount: number): void {
    this.currentValue = Math.max(0, this.currentValue - amount);
  }

  reset(): void {
    this.currentValue = this.max;
  }
}
