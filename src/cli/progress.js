// test
// node src\cli\progress.js
// node src\cli\progress.js --color '#8cc5c0'
// node src\cli\progress.js --color '#222e9a' --bgColor '#cfcef1'
// node src\cli\progress.js --duration 500
// node src\cli\progress.js --duration 500 --interval 10
const { duration, interval, length, color, bgColor } = {
  duration: 'duration',
  interval: 'interval',
  length: 'length',
  color: 'color',
  bgColor: 'bgColor'
};

const createFlag = (v) => `--${v}`;

const PROGRESS_DATE = {
  [duration]: { flag: createFlag(duration), value: 5000 },
  [interval]: { flag: createFlag(interval), value: 100 },
  [length]: { flag: createFlag(length), value: 30 },
  [color]: { flag: createFlag(color), value: null },
  [bgColor]: { flag: createFlag(bgColor), value: null }
};
const isValidHexColor = (hex) => /^#[0-9A-Fa-f]{6}$/.test(hex);

const getArgs = () => {
  const args = process.argv.slice(2);

  const getFlag = (flag, value) => {
    const idx = args.indexOf(flag);
    const v = args.at(idx + 1);
    return idx !== -1 && v ? v : value;
  };

  const result = {};

  for (const key of Object.keys(PROGRESS_DATE)) {
    const { flag, value } = PROGRESS_DATE[key];
    const newValue = getFlag(flag);

    if (key === color || key === bgColor) {
      result[key] = isValidHexColor(newValue) ? newValue : value;
    } else {
      result[key] = Number(newValue) ? Math.round(Number(newValue)) : value;
    }
  }

  return result;
};
const getRGB = (hex) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16)
});

const hexToAnsi = (hex) => {
  if (!isValidHexColor(hex)) return '';
  const { r, g, b } = getRGB(hex);
  return `\x1b[38;2;${r};${g};${b}m`;
};

const hexToAnsiBg = (hex) => {
  if (!isValidHexColor(hex)) return '';
  const { r, g, b } = getRGB(hex);
  return `\x1b[48;2;${r};${g};${b}m`;
};

const RESET = '\x1b[0m';

const progress = () => {
  const { duration, interval, length, color, bgColor } = getArgs();

  const steps = duration / interval;
  let step = 0;

  const timer = setInterval(() => {
    step++;

    const percent = Math.min(step / steps, 1);
    const filled = Math.round(percent * length);
    const space = length - filled;

    const filledAnsi = color ? hexToAnsi(color) : '';
    const emptyBgAnsi = bgColor ? hexToAnsiBg(bgColor) : '';

    const filledPart = `${filledAnsi}${'█'.repeat(filled)}${RESET}`;
    const emptyPart = emptyBgAnsi
      ? `${emptyBgAnsi}${' '.repeat(space)}${RESET}`
      : ' '.repeat(space);

    const progressBar = `[${filledPart}${emptyPart}] ${(percent * 100).toFixed(0)}%`;

    process.stdout.write(`\r${progressBar}`);

    if (percent >= 1) {
      clearInterval(timer);
      process.stdout.write('\n');
      console.log('Done');
    }
  }, interval);
};

progress();