// Mobile smoke test: full flow at 360x780 against a running app in mock mode.
// Usage: node scripts/smoke.cjs [baseUrl] [screenshotPath]
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const screenshotPath = process.argv[3] || "smoke-result.png";
const WIDTH = 360;

async function main() {
  let step = "setup";
  let browser;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "smoke-"));
  try {
    const photo = path.join(dir, "photo.jpg");
    const sharp = require("sharp");
    await sharp({ create: { width: 1200, height: 1600, channels: 3, background: { r: 150, g: 120, b: 100 } } })
      .jpeg()
      .toFile(photo);

    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: WIDTH, height: 780 } });
    page.setDefaultTimeout(10_000);

    step = "open landing";
    await page.goto(`${baseUrl}/?ref=smoke`);

    step = "click CTA";
    await page.getByRole("link", { name: "Začať" }).click();

    step = "consent";
    await page.getByRole("checkbox", { name: /Mám aspoň 18 rokov/ }).check();
    await page.getByRole("button", { name: "Pokračovať" }).click();

    step = "upload photos";
    for (const title of ["Tvár spredu", "Profil (z boku)", "Celá postava"]) {
      await page.getByLabel(new RegExp(`^${title.replace(/[()]/g, "\\$&")} – `)).setInputFiles(photo);
      await page.getByRole("img", { name: title }).waitFor();
    }

    step = "fill inputs";
    await page.getByLabel("Výška (cm)").fill("180");
    await page.getByRole("radio", { name: "Rovné" }).check({ force: true });
    await page.getByRole("radio", { name: "Casual", exact: true }).check({ force: true });

    step = "submit";
    await page.getByRole("button", { name: "Vytvoriť Blueprint" }).click();

    step = "wait for blueprint";
    await page.getByTestId("blueprint").waitFor({ timeout: 30_000 });

    step = "check horizontal scroll";
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    if (scrollWidth > WIDTH) throw new Error(`scrollWidth ${scrollWidth} > ${WIDTH}`);

    step = "screenshot";
    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log(`smoke OK (scrollWidth ${scrollWidth}, screenshot ${screenshotPath})`);
  } catch (err) {
    console.error(`smoke FAILED at step "${step}": ${err && err.message ? err.message : err}`);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

main();
