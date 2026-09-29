const { spawnSync } = require('node:child_process');
const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const step = process.argv[2];
const commands = {
  generate: [
    ['.sdk', ['build/docgen.js']],
    ['.sdk', ['node_modules/typescript/bin/tsc', '--build', 'src']],
    ['.sdk', ['--require', './build/windows-native-fs.cjs', 'node_modules/@voxgig/model/bin/voxgig-model', 'model/sdk.aontu']],
    ['.sdk', ['--require', './build/windows-native-fs.cjs', 'node_modules/@voxgig/model/bin/voxgig-model', 'test/test.aontu']],
  ],
  build: [['ts', ['node_modules/typescript/bin/tsc', '--build', 'src', 'test', '--force']]],
  test: [['ts', ['--enable-source-maps', '--test-concurrency=1', '--test', 'dist-test/**/*.test.js']]],
  doctor: [['.sdk', ['--require', './build/windows-native-fs.cjs', 'node_modules/@voxgig/sdkgen/bin/voxgig-sdkgen', 'doctor']]],
};
if (!commands[step]) throw new Error('Expected generate, build, test or doctor');
const started = new Date();
const measurements = [];
let exitCode = 0;
for (const [cwd, args] of commands[step]) {
  const begin = performance.now();
  const result = spawnSync(process.execPath, args, { cwd: path.join(root, cwd), stdio: 'inherit' });
  exitCode = result.status ?? 1;
  measurements.push({ cwd, args, elapsedMs: Math.round(performance.now() - begin), exitCode });
  if (result.error) console.error(result.error.message);
  if (exitCode) break;
}
mkdirSync(path.join(root, 'reports'), { recursive: true });
writeFileSync(path.join(root, 'reports', `${step}-result.json`), JSON.stringify({
  step, started: started.toISOString(), finished: new Date().toISOString(),
  node: process.version, platform: process.platform, measurements, exitCode,
}, null, 2) + '\n');
process.exitCode = exitCode;
