import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ERROR_MESSAGE, WORKSPACE_PATH } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// test example for check
// node src\fs\findByExt.js
// node src\fs\findByExt.js --ext js
// node src\fs\findByExt.js --ext .js
// node src\fs\findByExt.js --ext
const findByExt = async (фкп) => {
  const workspaceDir = path.join(__dirname, WORKSPACE_PATH);
  try {
    await fs.access(workspaceDir);
  } catch (e) {
    throw new Error(ERROR_MESSAGE);
  }


  let ext = process.argv.reduce(
    (acc, cur, i, arr) =>
      cur === '--ext'
        ?
        arr[i + 1] ?? acc
        : acc,
    '.txt');

  if (ext.at(0) !== '.') {
    ext = `.${ext}`;
  }

  try {

    const items = await fs.readdir(workspaceDir, {
      withFileTypes: true,
      recursive: true
    });

    const result = [];

    for (const item of items) {
      const TYPE = Object.getOwnPropertySymbols(item)[0];
      const typeCode = item[TYPE];

      if (typeCode === 2) continue;

      const { parentPath, name } = item;

      const fullPath = path.join(parentPath, name);
      const relativePath = path.relative(workspaceDir, fullPath);

      const normalized = relativePath.replace(/\\/g, '/');

      if (normalized.endsWith(ext)) {
        result.push(normalized);
      }
    }

    result
      .sort()
      .forEach(file => console.log(file));

  } catch {
    throw new Error(ERROR_MESSAGE);
  }
};

await findByExt();
