const { duration, interval, length, color } = {
  duration: 'duration',
  interval: 'interval',
  length: 'length',
  color: 'color',
}

const MAIN_COLOR = '#eeeeee';

const PROGRESS_DATE = {
  [duration]: { flag: `--${duration}`, value: 5000 },
  [interval]: { flag: `--${interval}`, value: 100 },
  [length]: { flag: `--${length}`, value: 30 },
  [color]: { flag: `--${color}`, value: null },
};

const getArgs = () => {
  const args = process.argv.slice(2);

  const getFlag = (flag, value) => {
    const idx = args.indexOf(flag);
    const v = args.at(idx + 1);

    return idx !== -1 && v ? v : value;
  };
  const isValidHexColor = (hex) => /^#[0-9A-Fa-f]{6}$/.test(hex);

  const result = {};
  for (const key of Object.keys(PROGRESS_DATE)) {
    const { flag, value } = PROGRESS_DATE[key];
    const newValue = getFlag(flag);
    if (flag !== `--${color}`) {
      result[key] = Number(newValue) ? Math.round(Number(newValue)) : value;
    }

    if (flag === `--${color}`) {
      result[key] = isValidHexColor(newValue) ? newValue : value;
    }
  }
  return result;
};

const hexToAnsi = (hex) => {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return '';

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `\x1b[38;2;${r};${g};${b}m`;
};

const hexToAnsiBg = (hex) => {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return '';

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `\x1b[48;2;${r};${g};${b}m`; // фон
};

const RESET = '\x1b[0m';

const progress = () => {
  const { duration, interval, length, color } = getArgs();

  const steps = duration / interval;
  let step = 0;

  const timer = setInterval(() => {
    step++;

    const percent = Math.min(step / steps, 1);
    const filled = Math.round(percent * length);
    const space = length - filled;

    const mainAnsi = hexToAnsi(MAIN_COLOR);
    const emptyBg = color ? hexToAnsiBg(color) : '';

    const filledPart = `${mainAnsi}${'█'.repeat(filled)}${RESET}`;

    const emptyPart = emptyBg
      ? `${emptyBg}${' '.repeat(space)}${RESET}`
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
