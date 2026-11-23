import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pageManifest } from '../scripts/content-manifest.mjs';
import { verifyContent } from '../scripts/verify-content.mjs';

test('allows HTML formatting, entity encoding, and boolean serialization differences', () => {
  assert.deepEqual(pageManifest('<p hidden>Research &amp; robotics</p>'), pageManifest('\n<p hidden="true">Research & robotics</p>\n'));
});

test('accepts the unchanged production output', async () => {
  assert.deepEqual(await verifyContent(), { pages: 5, assets: 9 });
});

const mutations = [
  ['visible copy', 'index.html', s => s.replace('Software Engineer · Waymo', 'Engineer · Waymo')],
  ['hidden accessibility label', 'index.html', s => s.replace('Close project overview', 'Close')],
  ['dialog template text', 'index.html', s => s.replace('Backpack-Mounted Third Robot Arm', 'Robot arm')],
  ['link destination', 'index.html', s => s.replace('href="assets/pdf/resume.pdf"', 'href="assets/pdf/other.pdf"')],
  ['structured employer', 'index.html', s => s.replace('"name":"Waymo"', '"name":"Other"')],
  ['video URL', 'pages/coborg.html', s => s.replace('KbwLp_TAgcU', 'wrong-video')],
  ['stylesheet bytes', 'styles/main.css', s => s + '\n'],
];
for (const [name, path, mutate] of mutations) {
  test(`rejects changes to ${name}`, async () => {
    const folder = await mkdtemp(join(tmpdir(), 'portfolio-preservation-'));
    try {
      await cp('dist', folder, { recursive: true });
      const target = join(folder, path);
      const original = await readFile(target, 'utf8');
      const changed = mutate(original);
      assert.notEqual(changed, original, 'Mutation must actually alter the test document');
      await writeFile(target, changed);
      await assert.rejects(verifyContent(folder), /Content changed|Asset bytes changed/u);
    } finally {
      await rm(folder, { recursive: true, force: true });
    }
  });
}

test('rejects unexpected files in the deployment artifact', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'portfolio-artifact-'));
  try {
    await cp('dist', folder, { recursive: true });
    await writeFile(join(folder, 'README.md'), 'must not publish');
    await assert.rejects(verifyContent(folder), /Unexpected published files/u);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});
