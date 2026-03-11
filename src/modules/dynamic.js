import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLUGIN_NOT_FOUND = 'Plugin not found';

// test
// node src/modules/dynamic.js uppercase
// node src/modules/dynamic.js reverse
// node src/modules/dynamic.js repeat
// node src/modules/dynamic.js something
const dynamic = async () => {
  const pluginName = process.argv[2];

  if (!pluginName) {
    console.log(PLUGIN_NOT_FOUND);
    process.exit(1);
  }

  const pluginPath = path.join(__dirname, 'plugins', `${pluginName}.js`);
  const pluginDynamicPath = pathToFileURL(pluginPath).href;

  try {
    const plugin = await import(pluginDynamicPath);

    if (typeof plugin.run !== 'function') {
      console.log(PLUGIN_NOT_FOUND);
      process.exit(1);
    }
    console.log(plugin.run());

  } catch (e) {
    console.log(PLUGIN_NOT_FOUND);
    process.exit(1);
  }
};

await dynamic();
