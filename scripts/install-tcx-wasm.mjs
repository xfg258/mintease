import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const vendor = join(root, "public", "tcx-wasm");
const version = "0.9.1";

const files = [
  "package.json",
  "tcx_wasm.js",
  "tcx_wasm.d.ts",
  "tcx_wasm_bg.wasm",
  "tcx_wasm_bg.wasm.d.ts",
];

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  mkdirSync(vendor, { recursive: true });
  console.log(`Installing @consenlabs/tcx-wasm@${version} -> public/tcx-wasm/`);
  for (const f of files) {
    const url = `https://cdn.jsdelivr.net/npm/@consenlabs/tcx-wasm@${version}/${f}`;
    process.stdout.write(`  ${f} ... `);
    const data = await download(url);
    writeFileSync(join(vendor, f), data);
    console.log(`${(data.length / 1024).toFixed(0)} KB`);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
