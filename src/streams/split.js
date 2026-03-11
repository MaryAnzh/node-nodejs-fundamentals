import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ERROR_MESSAGE } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FLAG = '--lines';
const DEFAULT_LINE_COUNT = 10;

// test
// node src\streams\split.js --lines 4
const split = async () => {
  const args = process.argv;
  const flagIndex = args.indexOf(FLAG);
  const lineFromArgs = flagIndex > -1 ? Number(args.at(flagIndex + 1)) : DEFAULT_LINE_COUNT;

  if (isNaN(lineFromArgs) || lineFromArgs <= 0) {
    console.error('Invalid --lines value');
    process.exit(1);
  }

  const sourcePath = path.join(__dirname, 'source.txt');
  try {
    await fsp.access(sourcePath);
  } catch (e) {
    throw new Error(ERROR_MESSAGE);
  }

  const readStream = fs.createReadStream(sourcePath, { encoding: 'utf8' });

  let buffer = '';
  let lineCount = 0;
  let chunkIndex = 1;
  let writeStream = fs.createWriteStream(path.join(__dirname, `chunk_${chunkIndex}.txt`));

  readStream.on('data', chunk => {
    buffer += chunk;

    // Windows fix: normalize \r\n → \n
    buffer = buffer.replace(/\r/g, '');
    let lines = buffer.split('\n');

    buffer = lines.pop();

    for (const line of lines) {
      writeStream.write(line + '\n');
      lineCount++;

      if (lineCount >= lineFromArgs) {
        writeStream.end();
        chunkIndex++;
        lineCount = 0;
        writeStream = fs.createWriteStream(path.join(__dirname, `chunk_${chunkIndex}.txt`));
      }
    }
  });

  readStream.on('end', () => {
    if (buffer.trim()) {
      writeStream.write(buffer + '\n');
    }
    console.log(`creates ${chunkIndex} files`);
    writeStream.end();
  });

  readStream.on('error', err => {
    console.error('Error reading source.txt:', err.message);
  });
};

await split();
