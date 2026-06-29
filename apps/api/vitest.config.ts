import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "../../src/": fileURLToPath(new URL("./src/", import.meta.url)),
      "../src/": fileURLToPath(new URL("./src/", import.meta.url)),
    },
  },
});
