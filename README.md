# Feng Xiang’s portfolio

An Astro static site hosted at https://jasonxiang1.github.io. The migration preserves the content and public URLs from Git commit `bbbc4ac7b078fc8ca840618d877fd2896194c33e`, including the Waymo profile update.

## Development

Use Node 24 (`nvm install && nvm use`), then:

```sh
npm ci
npm run dev
```

Run `npm run verify` before opening a PR. This runs Astro diagnostics, a production build, complete document/asset preservation checks, and regression tests of the preservation checker. Use `npm run preview` to inspect the production output; the dev server is not a substitute for testing the published `.html` paths.

## Source and content

- Astro pages contain the existing homepage and project markup literally. Shared components supply metadata, navigation, and the footer through a common document layout.
- `public/` contains the original assets, PDFs, CSS, JavaScript, robots file, sitemap, and legacy projects redirect. Files retain their original public paths and bytes.
- `_archive/` retains the original Jekyll source as a reference. It is outside both Astro’s pages and public directories and is never included in the deployment artifact.
- `tests/fixtures/content-baseline.json` records normalized document structure, all ordered text (including inert dialog templates), attributes, metadata, JSON-LD, and SHA-256 asset hashes from the fixed baseline commit. Formatting whitespace, entity serialization, comments, and equivalent boolean attribute serialization may differ; content and asset bytes may not.

The preserved URLs are `/`, `/index.html`, `/pages/coborg.html`, `/pages/gqa.html`, `/pages/centerpoint.html`, and the redirect at `/pages/projects.html`. Both existing headshot paths remain available. The existing client script retains mobile navigation, skills tabs, project dialogs, focus handling, and the automatic footer year; the content remains usable without JavaScript.

The baseline capture command is `node scripts/capture-baseline.mjs --write`. It reads only the fixed Git commit, not the working source, and requires that commit to exist locally. Do not regenerate the baseline to make a migration regression pass. Later intentional content changes must explicitly update the preservation policy and reviewed reference data in their own PR.

## Deployment

The workflow builds and verifies PRs without deploying them. Successful builds on `main` (or manual runs on `main`) deploy only `dist/` using the official Astro and GitHub Pages actions. Dependencies are locked, and action versions are pinned to immutable commits. No custom domain or environment secrets are needed.

For the initial migration rollout:

1. Review and merge the migration PR after its checks pass.
2. In repository **Settings → Pages → Build and deployment**, change **Source** to **GitHub Actions**. Record the previous branch and directory first. The pre-migration site uses `main` at the repository root.
3. If the merge-triggered deployment needs the source-setting change, rerun it or dispatch **Verify and deploy portfolio** on `main`.
4. Wait for the `github-pages` deployment to succeed. Verify the public homepage, legacy URLs, PDFs, and video playback. Do not call the migration deployed until these checks pass.

### Rollback

If the migration deployment fails or changes content, revert the migration merge commit (using `git revert -m 1` for a merge commit), restore the recorded Pages source (`main` / root for branch publishing), and wait for the original Pages build to succeed. Verify the homepage and project URLs again. Do not reset or force-push `main`. If no later content commits exist, the target site content is the fixed baseline above; preserve later intentional changes when preparing a rollback.

Known provider limitations from earlier checks: LinkedIn may require sign-in, and Google Drive may report fullscreen permission errors even when video playback works. Recheck providers during rollout and report restrictions separately from migration regressions.
