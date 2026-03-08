import { Transform } from 'stream';

// test
// node src\streams\lineNumberer.js
// name\nis
const lineNumberer = () => {
  let lineCount = 1;

  const transformer = new Transform({
    readableObjectMode: false,
    writableObjectMode: false,

    transform(chunk, encoding, callback) {
      const text = chunk.toString();

      // Windows fix: remove \r
      const cleaned = text.replace(/\r/g, '');
      let lines = cleaned
        .split('\n')
        .flatMap(l => l.split('\\n'))
        .filter(Boolean);

      const setLine = lines
        .map(content => `${lineCount++} | ${content}`)
        .join('\n');

      callback(null, setLine);
    }
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};

lineNumberer();
