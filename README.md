# APL Hackathon Website

A static vanilla JavaScript single-page site for the monthly community hackathon at the Attleboro Public Library (74 North Main Street, Attleboro, MA).

## Features

- One HTML shell: styles and chrome stay loaded, so navigation has no flash of unstyled content
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

## Content vs logic

Copy and markup live outside `js/`. The JavaScript modules load those files and wire behavior.

| Location | What belongs there |
| --- | --- |
| `data/site.json` | Library identity, meetup day, nav, collections, listing page copy, chrome labels, UI strings, calendar embed URL |
| `data/content.json` | Catalog metadata for articles, workshop ideas, and tutorials |
| `content/pages/` | Home, 404, listing, and document shells |
| `content/chrome/` | Header, footer, calendar, and list-item markup |
| `content/{articles\|themes\|tutorials}/` | Body copy for each catalog item |
| `js/` | Routing, data loading, interpolation, and web components |

Catalog strings can use `{location}`, `{meetupDay}`, and `{schedule}`. HTML can use the same placeholders or `data-config="location"` (and the other keys).

## Adding an article, theme, or tutorial

1. Add an entry to `data/content.json` with a `slug`.
2. Create a fragment at `content/<kind>/<slug>.html` with only the body markup:

```html
<p>Your article body goes here.</p>
<h2>A heading</h2>
<p>More copy.</p>
```

The SPA loads that fragment into the document shell and supplies the header, footer, title, and hero from the catalog.
