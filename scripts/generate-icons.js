const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// Helper to write PNG chunks
function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = crc32(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function crc32(buf) {
  let c;
  let crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8));
  }
  return (crc ^ (-1)) >>> 0;
}

function generateIconPNG(size, outputPath) {
  const width = size;
  const height = size;
  
  // Create RGBA raw bitmap
  const rowSize = 1 + width * 4; // 1 filter byte (0) + 4 bytes per pixel
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.45;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Gradient circle: Indigo to Amber
        const t = (y / height);
        const r = Math.floor(79 * (1 - t) + 245 * t);
        const g = Math.floor(70 * (1 - t) + 158 * t);
        const b = Math.floor(229 * (1 - t) + 11 * t);
        
        // Ring border
        if (dist > radius - width * 0.05) {
          rawData[pxOffset] = 251;     // R
          rawData[pxOffset + 1] = 191; // G
          rawData[pxOffset + 2] = 36;  // B (Amber-400)
          rawData[pxOffset + 3] = 255; // A
        } else {
          rawData[pxOffset] = r;
          rawData[pxOffset + 1] = g;
          rawData[pxOffset + 2] = b;
          rawData[pxOffset + 3] = 255;
        }
      } else {
        // Transparent outside
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Header
  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = createChunk("IHDR", ihdr);

  // IDAT Chunk
  const idatChunk = createChunk("IDAT", deflated);

  // IEND Chunk
  const iendChunk = createChunk("IEND", Buffer.alloc(0));

  const finalPng = Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(outputPath, finalPng);
  console.log(`Generated icon ${size}x${size} at: ${outputPath}`);
}

generateIconPNG(192, path.join(__dirname, "../public/icon-192.png"));
generateIconPNG(512, path.join(__dirname, "../public/icon-512.png"));
generateIconPNG(180, path.join(__dirname, "../public/apple-touch-icon.png"));
generateIconPNG(64, path.join(__dirname, "../public/favicon.ico"));
console.log("All PWA icons successfully generated!");
