import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const alias = { "@": fileURLToPath(new URL("./src", import.meta.url)) };

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [react()],
        resolve: { alias },
        test: { name: "node", environment: "node", include: ["**/*.test.ts"] },
      },
      {
        extends: true,
        plugins: [react()],
        resolve: { alias },
        test: {
          name: "jsdom",
          environment: "jsdom",
          include: ["**/*.test.tsx"],
        },
      },
    ],
    exclude: ["node_modules", ".next", ".superpowers"],
  },
});
