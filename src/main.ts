import Phaser from "phaser";
import { gameConfig } from "./game/GameConfig";
import "./style.css";

const rootId = "game-root";

const game = new Phaser.Game({
  ...gameConfig,
  parent: rootId,
});

window.addEventListener("beforeunload", () => {
  game.destroy(true);
});
