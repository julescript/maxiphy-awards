import { GoogleGenAI } from "@google/genai";
import path from "node:path";
import * as fs from "node:fs";
import imagesToGenerate from "./imagesToGenerate.json" with { type: "json" };

const ICONS_DIR = path.join(process.cwd(), "public", "icons");
const BACKUP_DIR = path.join(process.cwd(), "public", "icons_gen_backup");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing GOOGLE_GENAI_API_KEY env var (export GOOGLE_GENAI_API_KEY=...)."
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  ensureDir(ICONS_DIR);
  ensureDir(BACKUP_DIR);

  // De-dupe by imageName (last one wins)
  const byName = new Map();
  for (const item of imagesToGenerate) byName.set(item.imageName, item);
  const jobs = [...byName.values()];

  for (let i = 0; i < jobs.length; i++) {
    const p = jobs[i];
    console.log(`[${i + 1}/${jobs.length}] Generating ${p.imageName}...`);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: [{ role: "user", parts: [{ text: p.imagePrompt }] }],
    });

    const parts = response?.candidates?.[0]?.content?.parts ?? [];

    let wrote = false;
    for (const part of parts) {
      if (part.text) {
        console.log(part.text);
      } else if (part.inlineData?.data) {
        const buffer = Buffer.from(part.inlineData.data, "base64");

        const outputPath = path.join(ICONS_DIR, p.imageName);

        // Backup existing icon if present
        if (fs.existsSync(outputPath)) {
          const backupPath = path.join(
            BACKUP_DIR,
            `${Date.now()}-${path.basename(p.imageName)}`
          );
          fs.copyFileSync(outputPath, backupPath);
        }

        fs.writeFileSync(outputPath, buffer);
        console.log(`Saved: ${path.relative(process.cwd(), outputPath)}`);
        wrote = true;
      }
    }

    if (!wrote) {
      console.warn(`No image data returned for ${p.imageName}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
