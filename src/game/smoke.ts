export function smokeParam(): string | null {
  return new URLSearchParams(window.location.search).get("smoke");
}

export function smokeAutoEnabled(): boolean {
  return new URLSearchParams(window.location.search).get("smokeAuto") === "1";
}
