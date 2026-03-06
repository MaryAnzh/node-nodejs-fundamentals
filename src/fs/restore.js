import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FILE_NOT_EXIST_CODE } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const restore = async () => {
  const snapshotPath = path.join(__dirname, 'snapshot.json');
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
    } catch (e) {
      if (e.code !== FILE_NOT_EXIST_CODE) {
        throw new Error(ERROR_MESSAGE);
      }
    }

    const snapshotRaw = await fs.readFile(snapshotPath, 'utf8');
    const snapshot = JSON.parse(snapshotRaw);
    const { entries } = snapshot;

    await fs.mkdir(restoreDir);

    for (const entry of entries) {
      if (entry.type === 'directory') {
        const dirPath = path.join(restoreDir, entry.path);
        await fs.mkdir(dirPath, { recursive: true });
      }
    }

    for (const entry of entries) {
      if (entry.type === 'file') {
        const filePath = path.join(restoreDir, entry.path);
        const dirPath = path.dirname(filePath);

        await fs.mkdir(dirPath, { recursive: true });

        const buffer = Buffer.from(entry.content, 'base64');
        await fs.writeFile(filePath, buffer);
      }
    }

    console.log('Restore completed successfully');
  } catch {
    throw new Error(ERROR_MESSAGE);
  }
}


await restore();
