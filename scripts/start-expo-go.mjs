import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';

const port = 8081;

function addressScore(name, address) {
  let score = 0;
  if (/wi-?fi|wlan|wireless/i.test(name)) score += 100;
  if (/ethernet|^en\d|^eth\d/i.test(name)) score += 60;
  if (/virtual|vethernet|vmware|virtualbox|wsl|loopback|vpn|tailscale/i.test(name)) score -= 200;
  if (address.startsWith('192.168.')) score += 30;
  if (address.startsWith('10.')) score += 20;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(address)) score += 20;
  return score;
}

function findLanAddress() {
  const candidates = Object.entries(networkInterfaces())
    .flatMap(([name, addresses]) => (addresses ?? []).map((address) => ({ name, ...address })))
    .filter((address) => address.family === 'IPv4' && !address.internal)
    .sort((left, right) => addressScore(right.name, right.address) - addressScore(left.name, left.address));

  return candidates[0]?.address;
}

function portIsAvailable(targetPort) {
  return new Promise((resolve) => {
    const server = createServer();
    server.unref();
    server.once('error', () => resolve(false));
    server.listen(targetPort, '0.0.0.0', () => server.close(() => resolve(true)));
  });
}

const lanAddress = findLanAddress();

if (!lanAddress) {
  console.error('No active LAN connection was found. Connect this computer to the same Wi-Fi as your phone and try again.');
  process.exit(1);
}

if (!(await portIsAvailable(port))) {
  console.error(`Port ${port} is already in use. Close the other Metro terminal with Ctrl+C, then run this command again.`);
  process.exit(1);
}

if (process.argv.includes('--check')) {
  console.log(`Expo Go launcher is ready for exp://${lanAddress}:${port}`);
  process.exit(0);
}

console.log(`Starting Expo Go on exp://${lanAddress}:${port}`);
console.log('Keep this terminal open and scan the QR code from Expo Go.');

const expoCli = fileURLToPath(new URL('../node_modules/expo/bin/cli', import.meta.url));
const expo = spawn(process.execPath, [expoCli, 'start', '--clear', '--lan', '--port', String(port)], {
  env: { ...process.env, REACT_NATIVE_PACKAGER_HOSTNAME: lanAddress },
  stdio: 'inherit',
});

expo.once('error', (error) => {
  console.error(`Could not start Expo: ${error.message}`);
  process.exit(1);
});

expo.once('exit', (code) => process.exit(code ?? 0));
