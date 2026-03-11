import { createReadStream, createWriteStream } from 'fs';
import { access, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createBrotliDecompress } from 'zlib';
import { ERROR_MESSAGE, WORKSPACE } from '../constants.js';
import { ARCHIVE_FILE_NAME, COMPRESSED_FOLDER_NAME } from './constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPRESSED_DIR = path.join(__dirname, WORKSPACE, COMPRESSED_FOLDER_NAME);
const ARCHIVE_FILE = path.join(COMPRESSED_DIR, ARCHIVE_FILE_NAME);
const OUT_DIR = path.join(__dirname, WORKSPACE, 'decompressed');

export const decompressDir = async () => {
  try {
    await access(COMPRESSED_DIR);
    await access(ARCHIVE_FILE);
  } catch {
    throw new Error(ERROR_MESSAGE);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const brotli = createBrotliDecompress();
  const rs = createReadStream(ARCHIVE_FILE);

  rs.pipe(brotli);

  let buffer = '';
  let currentFile = null;
  let currentStream = null;

  brotli.on('data', (chunk) => {
    buffer += chunk.toString();

    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);

      if (line.startsWith('FILE ')) {
        const relPath = line.slice(5).trim();
        const fullPath = path.join(OUT_DIR, relPath);

        const dir = path.dirname(fullPath);
        mkdir(dir, { recursive: true });

        currentFile = fullPath;
        currentStream = createWriteStream(fullPath);
        continue;
      }

      if (line === 'END') {
        if (currentStream) {
          currentStream.end();
          currentStream = null;
          currentFile = null;
        }
        continue;
      }

      if (currentStream) {
        currentStream.write(line + '\n');
      }
    }
  });

  brotli.on('end', () => {
    if (currentStream) currentStream.end();
  });

  brotli.on('error', () => {
    throw new Error(ERROR_MESSAGE);
  });
};

await decompressDir();