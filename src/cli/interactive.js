import readline from 'readline';

const EXIT = 'exit';
const LINE_COMMANDS = {
  uptime: `Uptime: ${process.uptime().toFixed(2)}s`,
  cwd: process.cwd(),
  date: new Date().toISOString(),
  [EXIT]: 'Goodbye!',
};

// node src\cli\interactive.js
const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });

  const handleCommand = (cmd) => {
    const input = cmd.trim();

    console.log(LINE_COMMANDS[input] ?? 'Unknown command');

    if (input === EXIT) {
      process.exit(0);
    }
  };

  rl.prompt();

  rl.on('line', (line) => {
    handleCommand(line);
    rl.prompt();
  });

  rl.on('SIGINT', () => {
    console.log('Goodbye!');
    process.exit(0);
  });

  rl.on('close', () => {
    console.log('Goodbye!');
    process.exit(0);
  });
};

interactive();
