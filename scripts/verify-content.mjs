import { readFile, readdir } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { baselineCommit, pageManifest, sha256 } from './content-manifest.mjs';

export async function verifyContent(directory = 'dist', fixture = 'tests/fixtures/content-baseline.json') {
  const manifest = JSON.parse(await readFile(fixture, 'utf8'));
  if (manifest.baselineCommit !== baselineCommit) throw new Error('Unexpected content baseline commit.');
  for (const [path, expected] of Object.entries(manifest.pages)) {
    const actual = pageManifest(await readFile(resolve(directory, path), 'utf8'));
    if (!isDeepStrictEqual(actual, expected)) {
      const index = actual.findIndex((event, i) => !isDeepStrictEqual(event, expected[i]));
      throw new Error(`Content changed in ${path} at event ${index === -1 ? actual.length : index}:\nexpected ${JSON.stringify(expected[index === -1 ? actual.length : index])}\nreceived ${JSON.stringify(actual[index === -1 ? actual.length : index])}`);
    }
  }
  for (const [path, expected] of Object.entries(manifest.assets)) {
    if (sha256(await readFile(resolve(directory, path))) !== expected) throw new Error(`Asset bytes changed: ${path}`);
  }
  const published = [];
  async function walk(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = resolve(folder, entry.name);
      if (entry.isDirectory()) await walk(path);
      else published.push(relative(resolve(directory), path).split(sep).join('/'));
    }
  }
  await walk(resolve(directory));
  const allowed = new Set([...Object.keys(manifest.pages), ...Object.keys(manifest.assets)]);
  const unexpected = published.filter(path => !allowed.has(path));
  if (unexpected.length) throw new Error(`Unexpected published files: ${unexpected.join(', ')}`);
  // Resolve links against the exact published filenames, including legacy aliases.
  for (const [path, events] of Object.entries(manifest.pages)) {
    for (const [, , attrs] of events.filter(event => event[0] === 'open')) {
      for (const name of ['href', 'src']) {
        if (!attrs[name]) continue;
        const url = new URL(attrs[name], `https://jasonxiang1.github.io/${path}`);
        if (url.origin !== 'https://jasonxiang1.github.io') continue;
        const target = decodeURIComponent(url.pathname).replace(/^\//u, '') || 'index.html';
        if (!allowed.has(target)) throw new Error(`Missing link target in ${path}: ${attrs[name]}`);
        if (url.hash && manifest.pages[target]) {
          const id = decodeURIComponent(url.hash.slice(1));
          if (!manifest.pages[target].some(event => event[0] === 'open' && event[2].id === id)) throw new Error(`Missing fragment in ${path}: ${attrs[name]}`);
        }
      }
    }
  }
  return { pages: Object.keys(manifest.pages).length, assets: Object.keys(manifest.assets).length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await verifyContent();
  console.log(`Preservation passed: ${result.pages} complete page manifests, ${result.assets} byte-identical assets, all local links and fragments, and no extra published files.`);
}
