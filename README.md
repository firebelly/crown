# Crown

## About

This work is the front-end layer of an app that enables [Crown](https://crownschool.uchicago.edu/) students to search a [database](https://mycrownschool.uchicago.edu/) for programs based on various criteria. The backend (Cold Fusion) is written & maintained by Crown's in-house one-person team (Jack).

This work includes:

1. Program Search Landing Page with filters
2. Program Detail Page

The staging site lives here:

https://main--firebelly-crown.netlify.app/program/search/page-1/

Locally, the site lives here, where _page-1_ can be subbed out as needed:

http://localhost:8082/program/search/page-1/

## Requirements :computer:

This static site is generated using [Eleventy](https://www.11ty.dev/).

To access the production database, you'll need Crown credentials.

### Styles, Scripts and Assets

See the `.eleventy.js` config file for more details on asset handling.

- To compile stylesheets we use the Eleventy Plugin, [Sass Lightning CSS](https://github.com/5t3ph/eleventy-plugin-sass-lightningcss).

- To bundle scripts we use [esbuild](https://esbuild.github.io/getting-started/).

### Templating

Eleventy supports [Nunjucks](https://www.11ty.dev/docs/languages/nunjucks/) outta the box, and with similar syntax to Twig, it's an easy choice. Templating docs are [here](https://mozilla.github.io/nunjucks/templating.html) and [here](https://www.11ty.dev/docs/languages/nunjucks/).

## Get Started

Once you've installed all the things:

1. Use `--serve` to start up a hot-reloading local web server, or the shorthand `npm start`. Copies of everything should be generated within the `public` directory.

```
crown % npx @11ty/eleventy --serve
[11ty] Writing public/scripts/main.js from ./src/scripts/main.js
[11ty] Writing public/sass/project.css from ./src/sass/project.scss
[11ty] Writing public/sass/style.css from ./src/sass/style.scss
[11ty] Writing public/index.html from ./src/index.md (liquid)
[11ty] Copied 8 files / Wrote 4 files in 0.06 seconds (v2.0.1)
[11ty] Watching…
[11ty] Server at http://localhost:8080/
```

2. Updates to markup and assets should refresh automatically without manual page reload.

3. Publish it online using [Netlify](https://app.netlify.com/drop):

Drag your Eleventy-generated `public` folder into the Netlify GUI 
OR
Auto-deploy when you push to `main` 

Configure [Netflify Settings](https://app.netlify.com/sites/firebelly-crown/configuration/general)

### Program Search

To test data, json files are imported into [index.njk](https://github.com/firebelly/crown/blob/main/src/index.njk#L10) (see [11ty's data dox](https://www.11ty.dev/docs/data/)).

The sample data files live inside the [data directory](https://github.com/firebelly/crown/tree/main/src/_data).

The `organizationList` is the record of programs; specific keys in each organization object are filterable, e.g. `STA_MA1` (Students Accepted), `SERVICE_IDS`.

**NOTE**
Make special note of [`dataTranslator.json`](https://github.com/firebelly/crown/blob/main/src/_data/dataTranslator.json), which is not _sample_ data; instead, it maps & organizes the data keys into user-friendly categories that makes for cleaner templating markup within the [Program Detail](https://github.com/firebelly/crown/blob/main/src/_includes/macros/result.njk).

## Filtering

Students can filter programs directly by either typing the organization name into the [savvy search field](https://github.com/firebelly/crown/blob/main/src/_includes/fieldsets/organizations.njk#L2), or selecting the organization from a list with the [modal](https://github.com/firebelly/crown/blob/main/src/_includes/fieldsets/organizations.njk#L22). 

Students can also filter their search by program property; there are currently [5 program properties](https://github.com/firebelly/crown/blob/main/src/_includes/macros/result.njk) by which to search:

1. Students
2. Population
3. Clinical
4. Social
5. Keyword

More criteria can be added easily, as needed, by following the existing convention. These 5 criteria are [multi-select checkbox fields](https://github.com/firebelly/crown/blob/main/src/_includes/macros/filters.njk#L68), but [single checkbox/radio fields](https://github.com/firebelly/crown/blob/main/src/_includes/macros/filters.njk#L97) are also available.






