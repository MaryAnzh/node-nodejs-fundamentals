import { readFile } from 'fs/promises';
import { cpus } from 'os';
import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKER_PATH = path.join(__dirname, 'worker.js');

function mergeSortedArrays(arrays) {
  const result = [];
  const pointers = Array(arrays.length).fill(0);

  while (true) {
    let minVal = Infinity;
    let minIndex = -1;

    for (let i = 0; i < arrays.length; i++) {
      const p = pointers[i];
      if (p < arrays[i].length && arrays[i][p] < minVal) {
        minVal = arrays[i][p];
        minIndex = i;
      }
    }

    if (minIndex === -1) break;

    result.push(minVal);
    pointers[minIndex]++;
  }

  return result;
}

const main = async () => {
  const data = await readFile(path.join(__dirname, 'data.json'), 'utf8');
  const numbers = JSON.parse(data);

  const N = cpus().length;
  const chunkSize = Math.ceil(numbers.length / N);

  const chunks = [];
  for (let i = 0; i < N; i++) {
    chunks.push(numbers.slice(i * chunkSize, (i + 1) * chunkSize));
  }

  const promises = chunks.map((chunk, index) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(WORKER_PATH);

      worker.on('message', (sortedChunk) => {
        resolve({ index, sortedChunk });
        worker.terminate(); // ← ВАЖНО
      });
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker stopped with code ${code}`));
      });

      worker.postMessage(chunk);
    });
  })

  const results = await Promise.all(promises);
  console.log(results);

  const sortedChunks = results
    .sort((a, b) => a.index - b.index)
    .map(r => r.sortedChunk);

  const finalSorted = mergeSortedArrays(sortedChunks);

  console.log(finalSorted);
};

await main();