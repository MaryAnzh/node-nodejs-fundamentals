import { spawn } from 'child_process';

// test  node src/cp/execCommand.js "node -v"
// in windows -la does't exist
const execCommand = () => {
  const input = process.argv.at(2);

  if (!input) {
    console.error('No command provided');
    process.exit(1);
  }

  const [cmd, ...args] = input.split(" ");

  const child = spawn(cmd, args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: process.env                   
  });

  child.stdout.pipe(process.stdout);

  child.stderr.pipe(process.stderr);

  child.on('close', (code) => {
    process.exit(code);
  });
};

execCommand();
