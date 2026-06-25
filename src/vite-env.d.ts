/// <reference types="vite/client" />

declare global {
  interface Window {
    __FOXMAN_DEBUG__?: {
      player?: import("./game/movement/PlayerMotor").PlayerDebugState;
      guard?: import("./game/entities/GuardEnemy").GuardDebugState;
      scene?: string;
      room?: import("./game/levels/RoomObjective").RoomObjectiveState;
    };
    __FOXMAN_PAUSE__?: () => void;
    __FOXMAN_RESUME__?: () => void;
    __FOXMAN_RESTART_BOSS__?: () => void;
    __FOXMAN_RESTART_SECOND__?: () => void;
  }
}

export {};
