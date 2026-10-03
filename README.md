# debanjanmahata.github.io

Personal website of Debanjan Mahata, served by GitHub Pages at https://debanjanmahata.github.io/.

Plain HTML/CSS/JS with no build step. The look is inspired by the
[Adritian](https://github.com/zetxek/adritian-free-hugo-theme) Hugo theme (MIT).

## Editing

- `index.html`: all page sections (about, research, experience, education, service, contact).
- `assets/js/publications.js`: the publication list (from the Google Scholar BibTeX export). Add a paper there; `topics` drives the filter chips and `sel: true` puts it under "Selected".
- `assets/css/style.css`: colors live in `:root` (light) and `[data-theme="dark"]`. Change `--accent` to re-theme.
- `images/DebanjanMahata.jpg`: profile photo.

Preview locally with `python3 -m http.server` and open http://localhost:8000.
