import { spawnSync } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npmCommand, ['run', 'build'], {
  env: {
    ...process.env,
    PUBLIC_DEPLOY_ENV: 'production',
    PUBLIC_SITE_URL: 'https://www.sanapatel.com.au',
  },
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
