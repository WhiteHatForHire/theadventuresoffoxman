export class Health {
  private currentValue: number;

  constructor(readonly max: number, current = max) {
    this.currentValue = Math.max(0, Math.min(max, current));
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

  heal(amount: number): number {
    const before = this.currentValue;
    this.currentValue = Math.min(this.max, this.currentValue + Math.max(0, amount));
    return this.currentValue - before;
  }

  reset(): void {
    this.currentValue = this.max;
  }
}
