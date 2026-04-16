import { spawn } from 'node:child_process';

const maxAttempts = Number.parseInt(process.env.WRANGLER_DEPLOY_MAX_ATTEMPTS ?? '4', 10);
const baseDelayMs = Number.parseInt(process.env.WRANGLER_DEPLOY_BASE_DELAY_MS ?? '5000', 10);
const extraArgs = process.argv.slice(2);

if (extraArgs.includes('--help')) {
  console.log('Usage: node scripts/wrangler-deploy-retry.mjs [wrangler args...]');
  console.log('Retries transient Cloudflare deploy failures such as HTTP 5xx and malformed upstream responses.');
  console.log('Env vars: WRANGLER_DEPLOY_MAX_ATTEMPTS, WRANGLER_DEPLOY_BASE_DELAY_MS');
  process.exit(0);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(output) {
  return [
    '503 service unavailable',
    'received a malformed response from the api',
    'upstream connect error or disconnect/reset before headers',
    'error fetching from remote api',
    'internal error',
    'bad gateway',
    'gateway timeout',
    'too many requests',
  ].some((token) => output.includes(token));
}

function runWrangler() {
  return new Promise((resolve) => {
    const child = spawn(
      process.platform === 'win32' ? 'npx.cmd' : 'npx',
      ['wrangler', 'deploy', ...extraArgs],
      {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: false,
        env: process.env,
      },
    );

    let combinedOutput = '';

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      combinedOutput += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      combinedOutput += text;
      process.stderr.write(text);
    });

    child.on('close', (code) => {
      resolve({ code: code ?? 1, output: combinedOutput.toLowerCase() });
    });
  });
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const result = await runWrangler();

  if (result.code === 0) {
    process.exit(0);
  }

  const retryable = isRetryable(result.output);
  const lastAttempt = attempt === maxAttempts;

  if (!retryable || lastAttempt) {
    process.exit(result.code);
  }

  const delayMs = baseDelayMs * attempt;
  console.error(`\nRetrying Cloudflare deploy in ${delayMs}ms (${attempt}/${maxAttempts - 1} retries used)...\n`);
  await sleep(delayMs);
}
