/**
 * Gera o tray-icon.png a partir do icon.png:
 * - Remove o fundo preto tornando-o transparente
 * - Mantém os pixels brancos (o ícone da hydra)
 * - Redimensiona para 32x32 (ideal para system tray no Windows)
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, "../resources/icon.png");
const outputPath = path.join(__dirname, "../resources/tray-icon.png");

// 1. Ler a imagem original
const { data, info } = await sharp(inputPath)
  .resize(32, 32, { fit: "contain" })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const pixels = new Uint8Array(data);

// 2. Para cada pixel: se o pixel for escuro (fundo preto), torna transparente
//    Se for claro (o ícone branco), mantém branco com alpha 255
for (let i = 0; i < pixels.length; i += 4) {
  const r = pixels[i];
  const g = pixels[i + 1];
  const b = pixels[i + 2];

  // Luminância aproximada
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  if (luminance < 80) {
    // Pixel escuro = fundo → transparente
    pixels[i + 3] = 0;
  } else {
    // Pixel claro = ícone → branco puro, opaco
    pixels[i] = 255;
    pixels[i + 1] = 255;
    pixels[i + 2] = 255;
    pixels[i + 3] = 255;
  }
}

// 3. Salvar o resultado
await sharp(Buffer.from(pixels), {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toFile(outputPath);

console.log(`✅ tray-icon.png gerado: ${info.width}x${info.height}px, fundo transparente`);
