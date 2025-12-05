javascript
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function getLastVersionFromGit() {
  try {
    const tag = execSync("git describe --tags --abbrev=0", {
      encoding: "utf-8",
    }).trim();
    return tag.replace("v", "");
  } catch (e) {
    return null;
  }
}

function getLastCommitMessage() {
  try {
    return execSync("git log -1 --pretty=%B", { encoding: "utf-8" }).trim();
  } catch (e) {
    return "";
  }
}

function normalizeVersion(v) {
  if (!v) return "0.0.0";
  const parts = v.split(".").map((p) => parseInt(p, 10) || 0);
  return `${parts[0] || 0}.${parts[1] || 0}.${parts[2] || 0}`;
}

function bumpVersion(version, commitMsg) {
  const [major, minor, patch] = version.split(".").map(Number);

  const breaking = /BREAKING CHANGE|!:/.test(commitMsg);
  const isFeat = /^feat(\(|:)/m.test(commitMsg);
  const isFix = /^fix(\(|:)/m.test(commitMsg);

  if (breaking) {
    return `${major + 1}.0.0`;
  }
  if (isFeat) {
    return `${major}.${minor + 1}.0`;
  }
  if (isFix) {
    return `${major}.${minor}.${patch + 1}`;
  }
  // default: patch
  return `${major}.${minor}.${patch + 1}`;
}

function readPackageJson() {
  const pkgPath = path.resolve(process.cwd(), "package.json");
  try {
    const raw = fs.readFileSync(pkgPath, "utf-8");
    return { pkgPath, pkg: JSON.parse(raw) };
  } catch (e) {
    return { pkgPath, pkg: { version: "0.0.0" } };
  }
}

function writePackageJson(pkgPath, pkg) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
}

// Main
const providedMsg = process.argv.slice(2).join(" ") || "";
const commitMessage = providedMsg || getLastCommitMessage();

const gitLastTag = getLastVersionFromGit();
const { pkgPath, pkg } = readPackageJson();
const baseVersion = normalizeVersion(gitLastTag || pkg.version || "0.0.0");

const newVersion = bumpVersion(baseVersion, commitMessage);

// update package.json only if changed
if (pkg.version !== newVersion) {
  pkg.version = newVersion;
  writePackageJson(pkgPath, pkg);
}

// Print the new version (GitHub Actions will capture it). Keep output simple for parsing.
console.log(newVersion);

// Also print a key=value line for older workflows (optional)
console.log(`new_version=${newVersion}`);
