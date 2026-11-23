import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { baselineCommit, pagePaths, pageManifest, sha256 } from './content-manifest.mjs';

if (!process.argv.includes('--write')) throw new Error('Pass --write explicitly to capture the fixed Git baseline. Never regenerate from migrated source.');
const read = path => execFileSync('git', ['show', `${baselineCommit}:${path}`], { maxBuffer: 16 * 1024 * 1024 });
const paths = execFileSync('git', ['ls-tree', '-r', '--name-only', baselineCommit], { encoding: 'utf8' }).trim().split('\n');
const assets = paths.filter(path => /^(assets|styles|js)\//u.test(path) || ['robots.txt', 'sitemap.xml'].includes(path));
const manifest = {
  baselineCommit,
  pages: Object.fromEntries(pagePaths.map(path => [path, pageManifest(read(path).toString('utf8'))])),
  assets: Object.fromEntries(assets.map(path => [path, sha256(read(path))])),
};
await mkdir('tests/fixtures', { recursive: true });
// One event per line keeps differences reviewable without excessive fixture size.
const pages = Object.entries(manifest.pages).map(([path, events]) =>
  `    ${JSON.stringify(path)}: [\n${events.map(event => `      ${JSON.stringify(event)}`).join(',\n')}\n    ]`
).join(',\n');
const json = `{\n  "baselineCommit": ${JSON.stringify(baselineCommit)},\n  "pages": {\n${pages}\n  },\n  "assets": ${JSON.stringify(manifest.assets, null, 4)}\n}`;
await writeFile('tests/fixtures/content-baseline.json', `${json}\n`);
console.log(`Captured ${pagePaths.length} documents and ${assets.length} asset hashes from ${baselineCommit}.`);
