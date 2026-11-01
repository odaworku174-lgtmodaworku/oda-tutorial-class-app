// Lightweight, dependency-free QR Code generator for ODA EDUCATIONAL APP
// Generates standard 2D matrix suitable for crisp SVG rendering

// Reed-Solomon polynomial math and standard Galois field (GF 256)
const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_LOG[x] = i;
    x = x << 1;
    if (x & 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF256_EXP[i] = GF256_EXP[i - 255];
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const nextPoly = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j++) {
      nextPoly[j] ^= gfMul(poly[j], GF256_EXP[i]);
      nextPoly[j + 1] ^= poly[j];
    }
    poly = nextPoly;
  }
  return poly;
}

function rsEncode(data: Uint8Array, ecCount: number): Uint8Array {
  const gen = rsGeneratorPoly(ecCount);
  const res = new Uint8Array(ecCount);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ res[0];
    for (let j = 0; j < ecCount - 1; j++) {
      res[j] = res[j + 1] ^ gfMul(gen[j + 1], factor);
    }
    res[ecCount - 1] = gfMul(gen[ecCount], factor);
  }
  return res;
}

/**
 * Creates a boolean matrix (true = black, false = white) for a given text.
 * Falls back to a well-formed QR structure suitable for links.
 */
export function generateQRMatrix(text: string): { size: number; matrix: boolean[][] } {
  // Version 4 QR Code (33x33) handles typical URLs up to ~78 chars in Byte mode with Level M error correction
  // For larger URLs, we adapt version (up to Version 7 45x45)
  const len = text.length;
  let version = 4; // 33x33
  let ecBytes = 18;
  let dataCapacity = 64;

  if (len > 55) {
    version = 6; // 41x41
    ecBytes = 28;
    dataCapacity = 108;
  }
  if (len > 95) {
    version = 8; // 49x49
    ecBytes = 42;
    dataCapacity = 152;
  }

  const size = 17 + 4 * version;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  function setModule(r: number, c: number, val: boolean) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val;
      isFunction[r][c] = true;
    }
  }

  // 1. Finder patterns (7x7 corners)
  function drawFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            setModule(nr, nc, true);
          } else {
            setModule(nr, nc, false);
          }
        }
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // 2. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const val = i % 2 === 0;
    if (!isFunction[6][i]) setModule(6, i, val);
    if (!isFunction[i][6]) setModule(i, 6, val);
  }

  // 3. Dark module
  setModule(size - 8, 8, true);

  // 4. Alignment patterns for Version 4+
  const alignPos = version === 4 ? [6, 26] : version === 6 ? [6, 34] : [6, 26, 46];
  for (const ar of alignPos) {
    for (const ac of alignPos) {
      if (isFunction[ar][ac]) continue;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const val = Math.max(Math.abs(r), Math.abs(c)) !== 1;
          setModule(ar + r, ac + c, val);
        }
      }
    }
  }

  // 5. Build raw data bitstream (Byte mode 0100 + char count + utf8 bytes + terminator)
  const utf8Bytes = new TextEncoder().encode(text);
  const dataBits: number[] = [];

  // Mode: Byte (0100)
  dataBits.push(0, 1, 0, 0);

  // Char count (8 bits for v1-9 byte mode)
  for (let i = 7; i >= 0; i--) {
    dataBits.push((utf8Bytes.length >> i) & 1);
  }

  // Content
  for (let i = 0; i < utf8Bytes.length; i++) {
    for (let b = 7; b >= 0; b--) {
      dataBits.push((utf8Bytes[i] >> b) & 1);
    }
  }

  // Terminator (up to 4 zeroes)
  for (let i = 0; i < 4 && dataBits.length < dataCapacity * 8; i++) {
    dataBits.push(0);
  }
  // Pad to multiple of 8
  while (dataBits.length % 8 !== 0) {
    dataBits.push(0);
  }

  // Convert to bytes
  const dataBytes: number[] = [];
  for (let i = 0; i < dataBits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      byte = (byte << 1) | dataBits[i + b];
    }
    dataBytes.push(byte);
  }

  // Pad bytes
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (dataBytes.length < dataCapacity) {
    dataBytes.push(padBytes[padIdx % 2]);
    padIdx++;
  }

  // Reed-Solomon Error Correction
  const ec = rsEncode(new Uint8Array(dataBytes), ecBytes);
  const fullCodewords = [...dataBytes, ...Array.from(ec)];

  // Convert full codewords back to bit sequence
  const allBits: number[] = [];
  for (const b of fullCodewords) {
    for (let i = 7; i >= 0; i--) {
      allBits.push((b >> i) & 1);
    }
  }

  // 6. Place bits in matrix in zigzag 2-column paths
  let bitIdx = 0;
  let upwards = true;

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // Skip vertical timing column
    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const c of [col, col - 1]) {
        if (!isFunction[r][c]) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          // Apply standard mask 0: (row + col) % 2 === 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = (bit === 1) !== mask;
        }
      }
    }
    upwards = !upwards;
  }

  return { size, matrix };
}
