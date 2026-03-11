import { createWriteStream, createReadStream } from 'fs';
import { readdir, access, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';
import { ERROR_MESSAGE, WORKSPACE } from '../constants.js';
import { ARCHIVE_FILE_NAME, COMPRESSED_FOLDER_NAME } from './constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, WORKSPACE, 'toCompress');
const OUT_DIR = path.join(__dirname, WORKSPACE, COMPRESSED_FOLDER_NAME);
const OUT_FILE = path.join(OUT_DIR, ARCHIVE_FILE_NAME);

async function* walk(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full);

    if (entry.isDirectory()) {
      yield* walk(full, base);
    } else {
      yield { full, rel };
    }
  }
}

const compressDir = async () => {
  try {
    await access(SRC_DIR);
  } catch {
    throw new Error(ERROR_MESSAGE);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const brotli = zlib.createBrotliCompress();
  const outStream = createWriteStream(OUT_FILE);

  brotli.pipe(outStream);

  for await (const file of walk(SRC_DIR)) {
    brotli.write(`FILE ${file.rel}\n`);

    await new Promise((resolve, reject) => {
      const rs = createReadStream(file.full);

      rs.on('error', reject);
      rs.on('end', () => {
        brotli.write(`\nEND\n`);
        resolve();
      });

      rs.pipe(brotli, { end: false });
    });
  }

  brotli.end();
};

await compressDir();
