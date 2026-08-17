# APL Hackathon Website

A static vanilla JavaScript single-page site for a monthly community hackathon hosted at a local public library.

## Features

- One HTML document: styles and chrome stay loaded, so navigation has no flash of unstyled content
- Hash routes inject home, listings, and article bodies into `<main>`
- Reserved Google Calendar embed
- Articles, monthly themes, and tutorials

## Local development

From this project directory:

```bash
python3 -m http.server 8080 --directory public
```

Then open [http://localhost:8080](http://localhost:8080).

Routes:

- `#/` home
- `#/calendar` home, scrolled to the calendar
- `#/articles`, `#/themes`, `#/tutorials` listings
- `#/articles/welcome-to-apl-hackathon` (and similar) article, theme, or tutorial pages

## Configuration

Edit `public/js/config.js` for site name, library location, Google Calendar embed URL, and contact links.

Metadata lives in `public/data/content.json`. Body copy lives in `public/content/{articles|themes|tutorials}/{slug}.html`.

## Adding an article, theme, or tutorial

1. Add an entry to `public/data/content.json` with a `slug`.
2. Create a fragment at `public/content/<kind>/<slug>.html` with only the body markup:

```html
<p>Your article body goes here.</p>
<h2>A heading</h2>
<p>More copy.</p>
```

The SPA loads that fragment into the current page and supplies the header, footer, title, and hero from the catalog.
