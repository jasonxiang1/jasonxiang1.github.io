# Feng Xiang’s portfolio

Personal GitHub Pages website, built with HTML, CSS, and vanilla JavaScript. No package installation or application build is required.

## Local preview

Run `python3 -m http.server 8000` in this directory, then open `http://localhost:8000`. Stop the server with Ctrl+C.

## Content

- `index.html`: introduction, experience, project summaries, skills, and contact links.
- `pages/`: project details. The original `/pages/projects.html`, `/pages/coborg.html`, and `/pages/gqa.html` URLs are retained.
- `styles/main.css`: shared responsive styles.
- `js/main.js`: mobile menu, accessible skill tabs, project quick views, and footer year.
- `assets/pdf/`: public resume and VQA project paper.
- `_archive/`: original Jekyll site, retained as a reference and excluded from the GitHub Pages build by `_config.yml`.

The content was adapted from the existing live portfolio and supplied resume. Update `sitemap.xml` dates when page content changes. Keep metadata in the HTML consistent with your title and background. Project detail links, skills, and mobile navigation remain usable with JavaScript disabled.

## Publishing

Use this repository’s GitHub Pages branch configuration. The root `index.html` is the homepage; `_config.yml` only configures exclusions, with no remote theme or plugins. Review the diff, commit, and push to the branch configured for Pages. Confirm the deployed homepage, project pages, PDFs, and video embeds after deployment. A custom Pages Actions workflow, if configured outside this checkout, must also exclude `_archive/` from its published artifact.
