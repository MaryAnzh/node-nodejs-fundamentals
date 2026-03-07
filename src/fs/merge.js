import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ERROR_MESSAGE, WORKSPACE_PATH } from '../constants.js';
import { normalizePath, isFile } from '../utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FLAG = '--files';

// for test
// node src\fs\merge.js
// node src\fs\merge.js --files file_4.txt, file_1.txt
// err
// node src\fs\merge.js --files
// node src\fs\merge.js --files file_41.txt,file_1.txt
// impotent add files na,e without spaces, as in task --files <filename1,filename2,...>
const merge = async () => {
  const workspaceDir = path.join(__dirname, WORKSPACE_PATH);
  const partsDir = path.join(workspaceDir, 'parts');
  const outputFile = path.join(workspaceDir, 'merged.txt');

  try {
    await fs.access(partsDir);
  } catch {
    throw new Error(ERROR_MESSAGE);
  }

  const args = process.argv;
  const extIndex = args.indexOf(FLAG);
  const isFileFlag = extIndex !== -1;
  let filesFromConsole = null;

  if (isFileFlag) {
    filesFromConsole = args.at(extIndex + 1)
      .split(',')
      .map(f => f.trim())
      .filter(Boolean);

    if (filesFromConsole.length === 0) throw new Error(ERROR_MESSAGE);
  }

  try {
    let files = [];

    if (isFileFlag) {
      for (const file of filesFromConsole) {
        const fullPath = path.join(partsDir, file);

        try {
          await fs.access(fullPath);
        } catch {
          // additional message
          const errMessage = `Sub error message: ${file} not exist`;
          console.error(errMessage);
          throw new Error(ERROR_MESSAGE);
        }
        const normalized = normalizePath(fullPath);
        files.push(normalized);
      }
    }

    if (!isFileFlag) {
      const items = await fs.readdir(partsDir, { withFileTypes: true });

      const txtFiles = items
        .filter(item => isFile(item) && path.extname(item.name) === '.txt')
        .map(({ name }) => name)
        .sort();

      if (txtFiles.length === 0) {
        throw new Error(ERROR_MESSAGE);
      }

      files = txtFiles.map(name => {
        const fullPath = path.join(partsDir, name);
        return normalizePath(fullPath);
      });
    }

    let mergedContent = ``;

    for (const filePath of files) {
      const content = await fs.readFile(filePath, 'utf8');
      mergedContent += content;
    }

    await fs.writeFile(outputFile, mergedContent, 'utf8');

    console.log('Merged successfully');
    console.log(`merged content: ${mergedContent}`);
  } catch {
    throw new Error(ERROR_MESSAGE);
  }
};

await merge();
