#!/usr/bin/env node
/**
 * Forge — Font downloader
 * Run: node scripts/download-fonts.js
 * Downloads all required fonts to public/fonts/ for offline use.
 */
const https = require("https");
const fs    = require("fs");
const path  = require("path");

const FONTS_DIR = path.join(__dirname, "../public/fonts");
if (!fs.existsSync(FONTS_DIR)) fs.mkdirSync(FONTS_DIR, { recursive: true });

const FONTS = [
  { url: "https://fonts.gstatic.com/s/syne/v22/8vIS7w4qzmVxsWxjBZRjr0FKM_04uQ.woff2",         file: "Syne-Bold.woff2" },
  { url: "https://fonts.gstatic.com/s/dmsans/v15/rP2Hp2ywxg089UriCZOIHTWEBlwu8Q.woff2",       file: "DMSans-Regular.woff2" },
  { url: "https://fonts.gstatic.com/s/dmsans/v15/rP2Hp2ywxg089UriCZa5HTWEBlwu8Q.woff2",       file: "DMSans-Medium.woff2" },
  { url: "https://fonts.gstatic.com/s/dmsans/v15/rP2Hp2ywxg089UriCZ65HTWEBlwu8Q.woff2",       file: "DMSans-SemiBold.woff2" },
  { url: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOVk6OThhvA.woff2", file: "JetBrainsMono-Regular.woff2" },
  { url: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbX2o-flEEny0FZhsfKu5WU4xD-IQ-PuZJJXxfpAO-Lf1ZBLXQ.woff2",     file: "JetBrainsMono-SemiBold.woff2" },
];

function download(url, dest) {
  return new Promise((res, rej) => {
    if (fs.existsSync(dest)) { console.log(`  ✓ ${path.basename(dest)} (ya existe)`); res(); return; }
    const file = fs.createWriteStream(dest);
    https.get(url, r => {
      if (r.statusCode === 301 || r.statusCode === 302) {
        file.close(); fs.unlinkSync(dest);
        download(r.headers.location, dest).then(res).catch(rej);
        return;
      }
      r.pipe(file);
      file.on("finish", () => { file.close(); console.log(`  ↓ ${path.basename(dest)}`); res(); });
    }).on("error", e => { fs.unlinkSync(dest); rej(e); });
  });
}

(async () => {
  console.log("Forge — Descargando fuentes para uso offline...\n");
  for (const f of FONTS) {
    await download(f.url, path.join(FONTS_DIR, f.file)).catch(e => console.error(`  ✗ ${f.file}: ${e.message}`));
  }
  console.log("\n✓ Fuentes descargadas en public/fonts/");
  console.log("  La app ahora funciona completamente offline.");
})();
