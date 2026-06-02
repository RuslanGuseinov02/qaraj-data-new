const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = "C:/Users/rusla/StudioProjects/qaraj-data-new";
const IMAGES = path.join(ROOT, "images");
const OUTPUT = path.join(ROOT, "data/details");

function isValidImage(file) {
  return file.endsWith(".webp");
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function run() {
  const brands = fs.readdirSync(IMAGES);

  for (const brand of brands) {
    const brandPath = path.join(IMAGES, brand);

    if (!fs.statSync(brandPath).isDirectory()) continue;

    const models = fs.readdirSync(brandPath);

    console.log(`\n=== ${brand.toUpperCase()} ===`);

    const brandJsonDir = path.join(OUTPUT, brand);
    ensureDir(brandJsonDir);

    for (const model of models) {
      const modelPath = path.join(brandPath, model);

      if (!fs.statSync(modelPath).isDirectory()) continue;

      const images = fs.readdirSync(modelPath)
        .filter(isValidImage)
        .map(img => ({
          webp: `https://raw.githubusercontent.com/RuslanGuseinov02/qaraj-data-new/main/images/${brand}/${model}/${img}`
        }));

      const json = {
        make: {
          slug: brand,
          name: brand.toUpperCase()
        },
        slug: model,
        name: model,
        generations: images.map((img, i) => ({
          slug: `${model}-${i}`,
          name: `${model} ${i + 1}`,
          year_start: 0,
          year_end: 0,
          body_type: "unknown",
          images: img
        }))
      };

      fs.writeFileSync(
        path.join(brandJsonDir, `${model}.json`),
        JSON.stringify(json, null, 2)
      );

      console.log("DONE:", model);
    }
  }

  gitSync();
}

function gitSync() {
  try {
    console.log("\n=== GIT SYNC START ===");

    execSync("git add .", { stdio: "inherit" });
    execSync('git commit -m "auto sync: images + json"', { stdio: "inherit" });
    execSync("git push origin main", { stdio: "inherit" });

    console.log("\n✔ GIT SYNC DONE");
  } catch (err) {
    console.log("\n⚠ Git sync skipped (no changes or auth issue)");
  }
}

run();