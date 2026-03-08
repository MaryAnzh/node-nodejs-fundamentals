import { Transform } from 'stream';

const filter = () => {
  const args = process.argv;
  const patternIndex = args.indexOf('--pattern');
  const pattern = args.at(patternIndex + 1);

  if (patternIndex === -1 || !pattern) {
    console.error('Pattern is required');
    process.exit(1);
  }

  const filterStream = new Transform({
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

      // Filter by pattern
      const filtered = lines
        .filter(line => line.includes(pattern))
        .join('\n');

      callback(null, filtered ? filtered + '\n' : filtered);
    }
  });

  process.stdin.pipe(filterStream).pipe(process.stdout);
};

filter();
