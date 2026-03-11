import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { ERROR_MESSAGE } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  node src\hash\verify.js
const verify = async () => {
  const checksumsPath = path.join(__dirname, 'checksums.json');

  try {
    await fsp.access(checksumsPath);
  } catch (e) {
    throw new Error(ERROR_MESSAGE)
  }

  const result = await fsp.readFile(checksumsPath, 'utf8');
  const data = JSON.parse(result);

  for (const [fileName, expectedHash] of Object.entries(data)) {
    const filePath = path.join(__dirname, fileName);

    try {
      await fsp.access(filePath);
    } catch (e) {
      throw new Error(ERROR_MESSAGE)
    }

    try {
      const hash = await new Promise((resolve, reject) => {
        const h = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);

        stream.on('data', (chunk) => h.update(chunk));
        stream.on('end', () => resolve(h.digest('hex')));
        stream.on('error', reject);
      });

      if (hash === expectedHash) {
        console.log(`${fileName} — OK`);
      } else {
        console.log(`${fileName} — FAIL`);
      }

    } catch {
      console.log(`${fileName} — FAIL`);
    }
  }
};

await verify();
