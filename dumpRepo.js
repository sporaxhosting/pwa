const fs = require("fs");
const path = require("path");

const ROOT_DIR = process.cwd();
const OUTPUT_FILE = "repo_dump.txt";
const ALLOWED_EXTENSIONS = [".html", ".css", ".js", ".json"];

let output = "PROJECT: NoterGitter\n\n";

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (fullPath.includes("node_modules") || fullPath.includes(".git")) {
      continue;
    }

    if (entry.isDirectory()) {
      walk(fullPath);
    } else {
      const ext = path.extname(entry.name);
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        const content = fs.readFileSync(fullPath, "utf8");
        const relPath = path.relative(ROOT_DIR, fullPath);

        output +=
`===== FILE START =====
PATH: ${relPath}
TYPE: ${ext.slice(1)}
===== CONTENT =====
${content}
===== FILE END =====

`;
      }
    }
  }
}

walk(ROOT_DIR);
fs.writeFileSync(OUTPUT_FILE, output, "utf8");

console.log("✅ ChatGPT-ready repo dump created:", OUTPUT_FILE);
