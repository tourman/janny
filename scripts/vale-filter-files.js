const { spawn } = require('node:child_process');

const masksToExclude = [/\.json$/, /eslint\.config/, /lintstaged/];

(async function main() {
  const stdinFiles = await new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () =>
      resolve(
        data
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length),
      ),
    );
  });
  const argFiles = process.argv.slice(2).filter((arg) => arg.length);
  const files = [...new Set([...stdinFiles, ...argFiles])];
  const filteredFiles = files.filter((file) =>
    masksToExclude.every((mask) => !mask.test(file)),
  );
  if (!filteredFiles.length) {
    return;
  }
  await new Promise((resolve, reject) => {
    console.log(`vale ${filteredFiles.join(' ')}`);
    const child = spawn('vale', ['--output=line', ...filteredFiles], {
      shell: false,
    });
    let stdout = '';
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    child.on('close', () => {
      if (stdout.length) {
        console.log(stdout);
        reject(new Error('Vale: wrong validation'));
      } else {
        resolve();
      }
    });
    child.on('error', (err) => {
      reject(err);
    });
  });
})().catch((error) => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Unknown error';
  console.error(message);
  process.exit(2);
});
