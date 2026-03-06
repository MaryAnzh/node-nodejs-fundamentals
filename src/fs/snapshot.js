import { promises as fs, Dirent } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspace = '/home/user/workspace';
const workspaceDir = path.join(__dirname, workspace);
const jsonName = 'snapshot.json';

const snapshot = async () => {
  const workspacePath = path.join(__dirname, workspaceDir);

  try {
    const items = await fs.readdir(workspaceDir, { withFileTypes: true, recursive: true });
    const entries = [];

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const TYPE = Object.getOwnPropertySymbols(item)[0];
      const itemType = item[TYPE];
      const { name, parentPath } = item;
      const fullPath = path.join(parentPath, name);
      const relativePath = path.relative(workspaceDir, fullPath);

      if (itemType === 1) {
        const stat = await fs.stat(fullPath);
        const buffer = await fs.readFile(fullPath);
        const base64 = buffer.toString('base64');
        const normalizedPath = path.posix.join(...relativePath.split(path.sep));

        entries.push({
          path: normalizedPath,
          type: 'file',
          size: stat.size,
          content: base64
        });
      } else {
        entries.push({
          path: relativePath,
          type: 'directory',
        });
      }
    }

    const snapshotData = {
      rootPath: workspace,
      entries
    };

    const jsonFilePath = path.join(__dirname, jsonName);

    try {
      await fs.writeFile(
        jsonFilePath,
        JSON.stringify(snapshotData, null, 2),
        'utf8'
      );
      console.log('file is create');
    } catch (e) {
      console.error(e)
    }
  } catch (e) {
    console.error(e);
  }
};

await snapshot();
