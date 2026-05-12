const fs = require('fs');
const path = require('path');

function findAndPatch() {
  const pluginPaths = [
    path.resolve(__dirname, 'node_modules/@douyinfe/vite-plugin-semi/lib/vite-plugin-semi.js'),
  ];

  const pnpmDir = path.resolve(__dirname, 'node_modules/.pnpm');
  if (fs.existsSync(pnpmDir)) {
    const entries = fs.readdirSync(pnpmDir).filter(e => e.startsWith('@douyinfe+vite-plugin-semi'));
    for (const entry of entries) {
      pluginPaths.push(
        path.resolve(pnpmDir, entry, 'node_modules/@douyinfe/vite-plugin-semi/lib/vite-plugin-semi.js')
      );
    }
  }

  for (const filePath of pluginPaths) {
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('/^(\\S*\\/node_modules\\/)')) {
      content = content.replace(/\/\^\(\\S\*\\\/node_modules\\\/\)\//g, '/^(.*\\/node_modules\\/)*/');
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`[patch-vite-plugin-semi] Patched: ${filePath}`);
    }
  }
}

findAndPatch();
