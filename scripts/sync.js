const { execSync } = require("child_process");

function run(cmd) {
  console.log("\n>>", cmd);
  execSync(cmd, { stdio: "inherit" });
}

function main() {
  console.log("SYNC START...");

  // git add
  run("git add .");

  // commit (əgər dəyişiklik varsa)
  try {
    run('git commit -m "auto sync: images + json update"');
  } catch (e) {
    console.log("Nothing to commit");
  }

  // push
  run("git push origin main");

  console.log("\nDONE ✔");
}

main();