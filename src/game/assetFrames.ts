export type CropFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const FoxmanFrames = {
  idle: { x: 192, y: 23, width: 245, height: 394 },
  run: { x: 565, y: 103, width: 489, height: 304 },
  jump: { x: 1124, y: 31, width: 397, height: 358 },
  attack: { x: 70, y: 460, width: 452, height: 361 },
  hurt: { x: 667, y: 466, width: 347, height: 362 },
  dash: { x: 1120, y: 578, width: 443, height: 209 },
} satisfies Record<string, CropFrame>;

export const GuardFrames = {
  attack: { x: 1093, y: 94, width: 318, height: 513 },
  idle: { x: 33, y: 159, width: 315, height: 454 },
  patrol: { x: 380, y: 176, width: 338, height: 434 },
  alert: { x: 744, y: 180, width: 299, height: 430 },
  hurt: { x: 1459, y: 222, width: 271, height: 394 },
  dead: { x: 1759, y: 386, width: 402, height: 283 },
} satisfies Record<string, CropFrame>;

export const TaxClerkFrames = {
  idle: { x: 199, y: 29, width: 233, height: 393 },
  patrol: { x: 674, y: 82, width: 340, height: 339 },
  alert: { x: 1166, y: 81, width: 476, height: 340 },
  attack: { x: 40, y: 502, width: 568, height: 331 },
  hurt: { x: 687, y: 469, width: 318, height: 367 },
  dead: { x: 1105, y: 698, width: 512, height: 142 },
} satisfies Record<keyof typeof GuardFrames, CropFrame>;

export const TollBaronFrames = {
  idle: { x: 32, y: 56, width: 438, height: 426 },
  patrol: { x: 511, y: 80, width: 448, height: 408 },
  alert: { x: 995, y: 73, width: 506, height: 415 },
  attack: { x: 46, y: 535, width: 452, height: 430 },
  hurt: { x: 531, y: 551, width: 410, height: 381 },
  dead: { x: 954, y: 715, width: 569, height: 237 },
} satisfies Record<keyof typeof GuardFrames, CropFrame>;

export const PropFrames = {
  lockedGate: { x: 596, y: 135, width: 428, height: 560 },
  unlockedGate: { x: 1045, y: 135, width: 430, height: 565 },
  butcherSaber: { x: 35, y: 292, width: 260, height: 370 },
  pickupRing: { x: 357, y: 321, width: 183, height: 354 },
  lockIcon: { x: 1497, y: 408, width: 104, height: 164 },
  exitArrow: { x: 1622, y: 427, width: 115, height: 121 },
} satisfies Record<string, CropFrame>;
