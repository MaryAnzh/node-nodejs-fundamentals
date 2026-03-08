const execCommand = () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('No command provided');
    process.exit(1);
  }

  const [command, ...commandArgs] = args;
  
  // not completed.....


};

execCommand();
