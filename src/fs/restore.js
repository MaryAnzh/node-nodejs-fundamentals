import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DIRECTORY, FILE, FILE_NOT_EXIST_CODE, SNAPSHOT_JSON, ERROR_MESSAGE } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const restore = async () => {
  const snapshotPath = path.join(__dirname, SNAPSHOT_JSON);
  const restoreDir = path.join(__dirname, 'workspace_restored');

  try {
    try {
      await fs.access(snapshotPath);
    } catch {
      throw new Error(ERROR_MESSAGE);
    }

    try {
      await fs.access(restoreDir);
      throw new Error(ERROR_MESSAGE);
    } catch ({ code }) {
      if (code !== FILE_NOT_EXIST_CODE) {
        throw new Error(ERROR_MESSAGE);
      }
    }

    const snapshotRaw = await fs.readFile(snapshotPath, 'utf8');
    const snapshot = JSON.parse(snapshotRaw);
    const { entries } = snapshot;

    await fs.mkdir(restoreDir);

    for (const entry of entries) {
      const { type, path: entryPath } = entry;

      if (type === DIRECTORY) {
        const dirPath = path.join(restoreDir, entryPath);
        await fs.mkdir(dirPath, { recursive: true });
      }

      if(type === FILE) {
        const { content } = entry;
        const filePath = path.join(restoreDir, entryPath);
        const dirPath = path.dirname(filePath);

        await fs.mkdir(dirPath, { recursive: true });

        const buffer = Buffer.from(content, 'base64');
        await fs.writeFile(filePath, buffer);
      }
    }

    console.log('Restore completed successfully');
  } catch {
    throw new Error(ERROR_MESSAGE);
  }
}

await restore();
