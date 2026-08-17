# APL Hackathon Website

A static vanilla JavaScript single-page site for the monthly community hackathon at the Attleboro Public Library (74 North Main Street, Attleboro, MA).

## Features

- One HTML document: styles and chrome stay loaded, so navigation has no flash of unstyled content
- Hash routes inject home, listings, and article bodies into `<main>`
- Reserved Google Calendar embed
- Articles, workshop ideas (future sessions), and language tutorials from Hello-World

## Local development

From this project directory:

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

Routes:

- `#/` home
- `#/calendar` home, scrolled to the calendar
- `#/articles`, `#/themes`, `#/tutorials` listings
- `#/themes/games-from-scratch` workshop idea
- `#/tutorials/html` language tutorial

## Configuration

Edit `js/config.js` for site name, room (`location`), meetup day (`meetupDay` / `schedule`), Google Calendar embed URL, and contact links. Catalog strings can use `{location}`, `{meetupDay}`, and `{schedule}`; HTML can use `data-config="location"` (and the other keys) so copy stays in one place.

Metadata lives in `data/content.json`. Body copy lives in `content/{articles|themes|tutorials}/{slug}.html`.

## Adding an article, theme, or tutorial

1. Add an entry to `data/content.json` with a `slug`.
2. Create a fragment at `content/<kind>/<slug>.html` with only the body markup:

```html
<p>Your article body goes here.</p>
<h2>A heading</h2>
<p>More copy.</p>
```

The SPA loads that fragment into the current page and supplies the header, footer, title, and hero from the catalog.
