import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const indexPath = join(distDir, "index.html");

if (!existsSync(indexPath)) {
  throw new Error("dist/index.html does not exist. Run npm run build first.");
}

const index = readFileSync(indexPath, "utf8");

if (!index.includes("<script") || !index.includes("assets/")) {
  throw new Error("dist/index.html does not reference built assets.");
}

console.log("Smoke passed: dist/index.html references built assets.");
