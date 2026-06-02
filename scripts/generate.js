const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");

const IMAGES_DIR = path.join(ROOT, "images-new");
const OUTPUT_DIR = path.join(ROOT, "data", "details");

function run(cmd) {
  console.log(">>", cmd);
  execSync(cmd, { stdio: "inherit" });
}

// slug -> pretty name
function formatName(slug) {
  return slug
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// folder scan
function getModels(brandPath) {
  return fs.readdirSync(brandPath);
}

// generations scan
function getGenerations(modelPath) {
  return fs.readdirSync(modelPath).map(file => {
    const slug = file.replace(".webp", "");

    const parts = slug.split("-");

    const years = parts.slice(-2);
    const year_start = parseInt(years[0]);
    const year_end = years[1] === "now" ? 2026 : parseInt(years[1]);

    return {
      slug,
      name: parts[0].toUpperCase(),
      year_start,
      year_end,
      body_type: "unknown",
      images: {
        webp: `https://raw.githubusercontent.com/RuslanGuseinov02/qaraj-data-new/main/images/${brand}/${model}/${file}`
      }
    };
  });
}

function generateModel(brand, model) {
  const modelPath = path.join(IMAGES_DIR, brand, model);

  if (!fs.existsSync(modelPath)) {
    console.log("SKIP:", model);
    return;
  }

  const generations = getGenerations(modelPath);

  const json = {
    make: {
      slug: brand,
      name: formatName(brand)
    },
    slug: model,
    name: formatName(model),
    generations
  };

  const outPath = path.join(OUTPUT_DIR, brand);
  if (!fs.existsSync(outPath)) {
    fs.mkdirSync(outPath, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outPath, `${model}.json`),
    JSON.stringify(json, null, 2)
  );

  console.log("DONE:", model);
}

function main() {
  const brands = fs.readdirSync(IMAGES_DIR);

  console.log("FOUND BRANDS:", brands);

  for (const brand of brands) {
    const models = getModels(path.join(IMAGES_DIR, brand));

    console.log(`\n=== ${brand.toUpperCase()} ===`);

    for (const model of models) {
      generateModel(brand, model);
    }
  }

  console.log("\nJSON GENERATION DONE ✔");

  // git auto sync
  try {
    run("git add .");
    run('git commit -m "auto: generate all models JSON"');
    run("git push origin main");
  } catch (e) {
    console.log("No changes to commit");
  }
}

main();