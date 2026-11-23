import { parse } from 'parse5';
import { createHash } from 'node:crypto';

export const baselineCommit = 'bbbc4ac7b078fc8ca840618d877fd2896194c33e';
export const pagePaths = ['index.html', 'pages/coborg.html', 'pages/gqa.html', 'pages/centerpoint.html', 'pages/projects.html'];
const booleanAttributes = new Set(['allowfullscreen', 'autofocus', 'defer', 'hidden']);
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

// Compare the complete parsed document, including inert template contents.
// Ignore comments and indentation; retain ordered text, elements and attributes.
export function pageManifest(html) {
  const events = [];
  const walk = node => {
    if (node.nodeName === '#comment' || node.nodeName === '#documentType') return;
    if (node.nodeName === '#text') {
      const value = node.value.replace(/[ \t\r\n\f]+/gu, ' ').trim();
      if (value) events.push(['text', value]);
      return;
    }
    if (node.tagName) {
      const attrs = Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, booleanAttributes.has(name) ? '' : value]).sort(([a], [b]) => a.localeCompare(b)));
      events.push(['open', node.tagName, attrs]);
      if (node.tagName === 'script' && attrs.type === 'application/ld+json') {
        events.push(['json', JSON.parse(node.childNodes.map(child => child.value ?? '').join(''))]);
      } else {
        for (const child of (node.content ?? node).childNodes ?? []) walk(child);
      }
      events.push(['close', node.tagName]);
    } else {
      for (const child of node.childNodes ?? []) walk(child);
    }
  };
  walk(parse(html));
  return events;
}
